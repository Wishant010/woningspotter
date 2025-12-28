'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Woning } from '@/types';

interface Favorite {
  id: string;
  user_id: string;
  property_url: string;
  property_data: Woning;
  created_at: string;
}

interface FavoritesContextType {
  favorites: Favorite[];
  loading: boolean;
  isFavorite: (propertyUrl: string) => boolean;
  addFavorite: (woning: Woning) => Promise<{ success: boolean; error?: string; requiresUpgrade?: boolean }>;
  removeFavorite: (propertyUrl: string) => Promise<{ success: boolean; error?: string }>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const isFavorite = useCallback((propertyUrl: string) => {
    return favorites.some(f => f.property_url === propertyUrl);
  }, [favorites]);

  const addFavorite = async (woning: Woning): Promise<{ success: boolean; error?: string; requiresUpgrade?: boolean }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          propertyUrl: woning.url,
          propertyData: woning,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error,
          requiresUpgrade: data.requiresUpgrade
        };
      }

      // Add to local state
      setFavorites(prev => [data.favorite, ...prev]);
      return { success: true };
    } catch (error) {
      console.error('Error adding favorite:', error);
      return { success: false, error: 'Failed to add favorite' };
    }
  };

  const removeFavorite = async (propertyUrl: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          propertyUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.error };
      }

      // Remove from local state
      setFavorites(prev => prev.filter(f => f.property_url !== propertyUrl));
      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      return { success: false, error: 'Failed to remove favorite' };
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        addFavorite,
        removeFavorite,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
