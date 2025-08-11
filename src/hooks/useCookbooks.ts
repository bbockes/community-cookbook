import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Cookbook = Database['public']['Tables']['cookbooks']['Row'];

export function useCookbooks() {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCookbooks();
  }, []);

  const fetchCookbooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cookbooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCookbooks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (cookbookId: string) => {
    try {
      // Get current cookbook
      const { data: cookbook, error: fetchError } = await supabase
        .from('cookbooks')
        .select('favorites')
        .eq('id', cookbookId)
        .single();

      if (fetchError) throw fetchError;

      // Increment favorites count
      const { error: updateError } = await supabase
        .from('cookbooks')
        .update({ favorites: cookbook.favorites + 1 })
        .eq('id', cookbookId);

      if (updateError) throw updateError;

      // Update local state
      setCookbooks(prev => 
        prev.map(cb => 
          cb.id === cookbookId 
            ? { ...cb, favorites: cb.favorites + 1 }
            : cb
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites');
    }
  };

  const submitCookbook = async (cookbook: Omit<Cookbook, 'id' | 'created_at' | 'updated_at' | 'favorites'>) => {
    try {
      const { data, error } = await supabase
        .from('cookbooks')
        .insert([cookbook])
        .select()
        .single();

      if (error) throw error;
      
      // Add to local state
      setCookbooks(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit cookbook';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  return {
    cookbooks,
    loading,
    error,
    fetchCookbooks,
    addToFavorites,
    submitCookbook,
  };
}