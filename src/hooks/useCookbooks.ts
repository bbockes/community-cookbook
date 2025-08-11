import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { useAuth } from './useAuth';

type Cookbook = Database['public']['Tables']['cookbooks']['Row'];

interface FilterOptions {
  searchQuery?: string;
  cuisine?: string;
  cookingMethod?: string;
  sortBy?: 'newest' | 'popular';
  timeFilter?: 'today' | 'week' | 'month' | 'all';
}

export function useCookbooks() {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { user } = useAuth();

  const ITEMS_PER_PAGE = 12;

  const fetchCookbooks = async (options: FilterOptions = {}, reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const currentPage = reset ? 0 : page;
      const from = currentPage * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('cookbooks')
        .select('*')
        .range(from, to);

      // Apply search filter
      if (options.searchQuery) {
        query = query.or(`title.ilike.%${options.searchQuery}%,author.ilike.%${options.searchQuery}%`);
      }

      // Apply cuisine filter
      if (options.cuisine && options.cuisine !== 'All') {
        query = query.eq('cuisine', options.cuisine);
      }

      // Apply cooking method filter
      if (options.cookingMethod && options.cookingMethod !== 'All') {
        query = query.eq('cooking_method', options.cookingMethod);
      }

      // Apply time filter for popular sort
      if (options.sortBy === 'popular' && options.timeFilter && options.timeFilter !== 'all') {
        const now = new Date();
        let cutoffDate = new Date();
        
        switch (options.timeFilter) {
          case 'today':
            cutoffDate.setDate(now.getDate() - 1);
            break;
          case 'week':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            cutoffDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      // Apply sorting
      if (options.sortBy === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else {
        query = query.order('favorites', { ascending: false });
      }

      const { data, error } = await supabase

      if (error) throw error;
      
      const newCookbooks = data || [];
      
      if (reset) {
        setCookbooks(newCookbooks);
      } else {
        setCookbooks(prev => [...prev, ...newCookbooks]);
      }
      
      setHasMore(newCookbooks.length === ITEMS_PER_PAGE);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (reset) {
        setLoading(false);
      }
    }
  };

  const loadMoreCookbooks = async (options: FilterOptions = {}) => {
    if (!hasMore || loading) return;
    await fetchCookbooks(options, false);
  };

  const addToFavorites = async (cookbookId: string) => {
    if (!user) return;
    
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
    if (!user) {
      return { data: null, error: 'Must be logged in to submit cookbooks' };
    }

    try {
      const { data, error } = await supabase
        .from('cookbooks')
        .insert([{ ...cookbook, submitted_by: user.id }])
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
    hasMore,
    fetchCookbooks,
    loadMoreCookbooks,
    addToFavorites,
    submitCookbook,
  };
}