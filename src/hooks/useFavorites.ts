import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export const useFavorites = (cookbookId: string, initialFavoriteCount: number) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfFavorited();
    } else {
      setIsFavorited(false);
    }
  }, [user, cookbookId]);

  const checkIfFavorited = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_cookbooks')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsFavorited(profile.favorite_cookbooks?.includes(cookbookId) || false);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('favorite_cookbooks')
        .eq('id', user.id)
        .single();

      if (profile) {
        const currentFavorites = profile.favorite_cookbooks || [];
        const newFavorites = isFavorited
          ? currentFavorites.filter((id: string) => id !== cookbookId)
          : [...currentFavorites, cookbookId];

        await supabase
          .from('profiles')
          .update({ favorite_cookbooks: newFavorites })
          .eq('id', user.id);

        // Update cookbook favorites count
        const newCount = isFavorited ? favoriteCount - 1 : favoriteCount + 1;
        
        await supabase
          .from('cookbooks')
          .update({ favorites: newCount })
          .eq('id', cookbookId);

        setIsFavorited(!isFavorited);
        setFavoriteCount(newCount);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorited,
    toggleFavorite,
    favoriteCount,
    isLoading
  };
};