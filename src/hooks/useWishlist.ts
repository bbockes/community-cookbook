import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';

export const useWishlist = (cookbookId: string) => {
  const { user } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkIfWishlisted();
    } else {
      setIsWishlisted(false);
    }
  }, [user, cookbookId]);

  const checkIfWishlisted = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('id', user.id)
        .single();

      if (profile) {
        setIsWishlisted(profile.wishlist?.includes(cookbookId) || false);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('wishlist')
        .eq('id', user.id)
        .single();

      if (profile) {
        const currentWishlist = profile.wishlist || [];
        const newWishlist = isWishlisted
          ? currentWishlist.filter((id: string) => id !== cookbookId)
          : [...currentWishlist, cookbookId];

        await supabase
          .from('profiles')
          .update({ wishlist: newWishlist })
          .eq('id', user.id);

        setIsWishlisted(!isWishlisted);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isWishlisted,
    toggleWishlist,
    isLoading
  };
};