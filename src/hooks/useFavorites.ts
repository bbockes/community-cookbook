import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export function useFavorites(cookbookId: string, initialCount: number) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  // Check if user has favorited this cookbook
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user) {
        setIsFavorited(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('favorite_cookbooks')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        setIsFavorited(profile.favorite_cookbooks?.includes(cookbookId) || false);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkFavoriteStatus();
  }, [user, cookbookId]);

  const toggleFavorite = async () => {
    if (!user || loading) return;
    
    setLoading(true);
    
    try {
      // Get current user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('favorite_cookbooks')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const currentFavorites = profile.favorite_cookbooks || [];
      const isCurrentlyFavorited = currentFavorites.includes(cookbookId);
      
      // Don't allow toggling if already in desired state
      if (isCurrentlyFavorited === isFavorited) {
        setLoading(false);
        return;
      }

      let newFavorites: string[];
      let newCount: number;

      if (isCurrentlyFavorited) {
        // Remove from favorites
        newFavorites = currentFavorites.filter(id => id !== cookbookId);
        newCount = favoriteCount - 1;
      } else {
        // Add to favorites
        newFavorites = [...currentFavorites, cookbookId];
        newCount = favoriteCount + 1;
      }

      // Update user's favorite_cookbooks
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ favorite_cookbooks: newFavorites })
        .eq('id', user.id);

      if (updateProfileError) throw updateProfileError;

      // Update cookbook's favorites count
      const { error: updateCookbookError } = await supabase
        .from('cookbooks')
        .update({ favorites: newCount })
        .eq('id', cookbookId);

      if (updateCookbookError) throw updateCookbookError;

      // Update local state
      setIsFavorited(!isCurrentlyFavorited);
      setFavoriteCount(newCount);
      
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFavorited,
    favoriteCount,
    toggleFavorite,
    loading
  };
}