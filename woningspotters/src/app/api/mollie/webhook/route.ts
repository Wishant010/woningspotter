import { NextRequest, NextResponse } from 'next/server';
import { getMollieClient, PLANS, PlanType } from '@/lib/mollie';
import { createServerClient } from '@/lib/supabase-server';

// Mollie webhook verification:
// Mollie doesn't use signature-based verification. Instead, verification is done by:
// 1. Only accepting payment IDs in the expected format
// 2. Fetching the payment from Mollie API to verify it exists
// 3. Checking that the payment metadata matches our records
// This is the recommended approach per Mollie's documentation

const MOLLIE_PAYMENT_ID_REGEX = /^tr_[a-zA-Z0-9]+$/;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get('id') as string;

    if (!paymentId) {
      console.error('Webhook: No payment ID provided');
      return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
    }

    // Validate payment ID format to prevent injection attacks
    if (!MOLLIE_PAYMENT_ID_REGEX.test(paymentId)) {
      console.error('Webhook: Invalid payment ID format:', paymentId);
      return NextResponse.json({ error: 'Invalid payment ID format' }, { status: 400 });
    }

    const mollieClient = getMollieClient();

    // Fetch payment from Mollie - this verifies the payment exists
    // If payment doesn't exist, Mollie will throw an error
    let payment;
    try {
      payment = await mollieClient.payments.get(paymentId);
    } catch (mollieError) {
      console.error('Webhook: Failed to fetch payment from Mollie:', mollieError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const supabase = createServerClient();
    const metadata = payment.metadata as { userId: string; plan: PlanType; type: string };

    // Verify metadata exists and has required fields
    if (!metadata || !metadata.userId || !metadata.plan) {
      console.error('Webhook: Invalid or missing payment metadata');
      return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 });
    }

    // Verify user exists in our database
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', metadata.userId)
      .single();

    if (profileError || !userProfile) {
      console.error('Webhook: User not found in database:', metadata.userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Log successful webhook verification
    console.log(`Webhook verified: Payment ${paymentId} for user ${metadata.userId}, status: ${payment.status}`);

    // Update payment status in database
    await supabase
      .from('payments')
      .update({
        status: payment.status,
        paid_at: payment.paidAt || null,
      })
      .eq('mollie_payment_id', paymentId);

    // Handle successful first payment - create subscription
    if (payment.status === 'paid' && metadata.type === 'subscription_setup') {
      const { userId, plan } = metadata;
      const planConfig = PLANS[plan];

      // Create the actual recurring subscription in Mollie
      const subscription = await mollieClient.customerSubscriptions.create({
        customerId: payment.customerId!,
        amount: {
          currency: planConfig.currency,
          value: planConfig.amount,
        },
        interval: planConfig.interval,
        description: planConfig.description,
        webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/mollie/webhook`,
        metadata: {
          userId,
          plan,
        },
      });

      // Update subscription record
      await supabase
        .from('subscriptions')
        .update({
          mollie_subscription_id: subscription.id,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: subscription.nextPaymentDate || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'pending');

      // Update user's subscription tier
      await supabase
        .from('profiles')
        .update({
          subscription_tier: plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    }

    // Handle recurring payment
    if (payment.status === 'paid' && payment.sequenceType === 'recurring') {
      const { userId, plan } = metadata;

      // Update subscription period
      await supabase
        .from('subscriptions')
        .update({
          current_period_start: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('plan', plan)
        .eq('status', 'active');
    }

    // Handle failed payment
    if (payment.status === 'failed' || payment.status === 'canceled' || payment.status === 'expired') {
      const { userId } = metadata;

      // If it was a setup payment that failed, remove pending subscription
      if (metadata.type === 'subscription_setup') {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('status', 'pending');
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
