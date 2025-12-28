-- WoningSpotters Database Schema
-- Run this in Supabase SQL Editor
-- Safe to run multiple times

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- CREATE TABLES FIRST
-- =====================

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'ultra')),
  mollie_customer_id text,
  searches_today integer default 0,
  last_search_date date,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Subscriptions table (Mollie subscriptions)
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  mollie_subscription_id text unique,
  mollie_customer_id text not null,
  plan text not null check (plan in ('pro', 'ultra')),
  status text default 'pending' check (status in ('pending', 'active', 'canceled', 'suspended', 'completed')),
  amount decimal(10,2) not null,
  interval text default '1 month',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Payments table (track individual payments)
create table if not exists public.payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subscription_id uuid references public.subscriptions on delete set null,
  mollie_payment_id text unique not null,
  amount decimal(10,2) not null,
  status text not null check (status in ('open', 'pending', 'paid', 'failed', 'canceled', 'expired')),
  description text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Favorites table (saved properties)
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  property_url text not null,
  property_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, property_url)
);

-- Search history (optional, for analytics)
create table if not exists public.search_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  search_query jsonb not null,
  results_count integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Newsletter subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  subscribed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Search alerts table (for Pro users)
create table if not exists public.search_alerts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  search_criteria jsonb not null,
  is_active boolean default true,
  last_checked_at timestamp with time zone,
  last_results_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================
-- DROP EXISTING POLICIES (after tables exist)
-- =====================
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can view own favorites" on public.favorites;
drop policy if exists "Users can insert own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;
drop policy if exists "Users can view own search history" on public.search_history;
drop policy if exists "Users can insert own search history" on public.search_history;
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "Service role can manage subscriptions" on public.subscriptions;
drop policy if exists "Users can view own payments" on public.payments;
drop policy if exists "Service role can manage payments" on public.payments;
drop policy if exists "Anyone can subscribe to newsletter" on public.newsletter_subscribers;
drop policy if exists "Users can view own subscription" on public.newsletter_subscribers;
drop policy if exists "Users can view own alerts" on public.search_alerts;
drop policy if exists "Users can insert own alerts" on public.search_alerts;
drop policy if exists "Users can update own alerts" on public.search_alerts;
drop policy if exists "Users can delete own alerts" on public.search_alerts;

-- =====================
-- ENABLE ROW LEVEL SECURITY
-- =====================
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.search_history enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.search_alerts enable row level security;

-- =====================
-- CREATE POLICIES
-- =====================

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Favorites policies
create policy "Users can view own favorites" on public.favorites
  for select using (auth.uid() = user_id);

create policy "Users can insert own favorites" on public.favorites
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own favorites" on public.favorites
  for delete using (auth.uid() = user_id);

-- Search history policies
create policy "Users can view own search history" on public.search_history
  for select using (auth.uid() = user_id);

create policy "Users can insert own search history" on public.search_history
  for insert with check (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view own subscriptions" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Service role can manage subscriptions" on public.subscriptions
  for all using (true);

-- Payments policies
create policy "Users can view own payments" on public.payments
  for select using (auth.uid() = user_id);

create policy "Service role can manage payments" on public.payments
  for all using (true);

-- Newsletter subscribers policies
create policy "Anyone can subscribe to newsletter" on public.newsletter_subscribers
  for insert with check (true);

create policy "Users can view own subscription" on public.newsletter_subscribers
  for select using (true);

-- Search alerts policies
create policy "Users can view own alerts" on public.search_alerts
  for select using (auth.uid() = user_id);

create policy "Users can insert own alerts" on public.search_alerts
  for insert with check (auth.uid() = user_id);

create policy "Users can update own alerts" on public.search_alerts
  for update using (auth.uid() = user_id);

create policy "Users can delete own alerts" on public.search_alerts
  for delete using (auth.uid() = user_id);

-- =====================
-- FUNCTIONS & TRIGGERS
-- =====================

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================
-- INDEXES
-- =====================
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists search_history_user_id_idx on public.search_history(user_id);
create index if not exists search_history_created_at_idx on public.search_history(created_at desc);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_mollie_id_idx on public.subscriptions(mollie_subscription_id);
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_mollie_id_idx on public.payments(mollie_payment_id);
create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);
