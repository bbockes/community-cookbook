import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CookbookCard } from '../components/CookbookCard';
import { FilterBar } from '../components/FilterBar';
import { useCookbooks } from '../hooks/useCookbooks';
import { DbCookbook } from '../utils/types';

interface HomeProps {
  onCookbookSelect: (cookbook: DbCookbook) => void;
  searchQuery: string;
}

export const Home: React.FC<HomeProps> = ({
  onCookbookSelect,
  searchQuery
}) => {
  const [activeSort, setActiveSort] = useState('newest');
  const [activeTimeFilter, setActiveTimeFilter] = useState('week');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [activeCookingMethod, setActiveCookingMethod] = useState('All');
  
  const { 
    cookbooks, 
    loading, 
    error, 
    hasMore, 
    fetchCookbooks, 
    loadMoreCookbooks, 
    addToFavorites 
  } = useCookbooks();
  
  const loadMoreRef = useRef<HTMLDivElement>(null);
  // Fetch cookbooks when filters change
  useEffect(() => {
    const filterOptions = {
      searchQuery: searchQuery || undefined,
      cuisine: activeCuisine,
      cookingMethod: activeCookingMethod,
      sortBy: activeSort as 'newest' | 'popular' | 'rating',
      timeFilter: activeTimeFilter as 'today' | 'week' | 'month' | 'all',
    };
    
    fetchCookbooks(filterOptions, true);
  }, [searchQuery, activeCuisine, activeCookingMethod, activeSort, activeTimeFilter]);

  // Infinite scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const filterOptions = {
            searchQuery: searchQuery || undefined,
            cuisine: activeCuisine,
            cookingMethod: activeCookingMethod,
            sortBy: activeSort as 'newest' | 'popular' | 'rating',
            timeFilter: activeTimeFilter as 'today' | 'week' | 'month' | 'all',
          };
          loadMoreCookbooks(filterOptions);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, searchQuery, activeCuisine, activeCookingMethod, activeSort, activeTimeFilter]);
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy mb-2">
          Discover the best cookbooks
        </h1>
        <p className="text-charcoal/70">
          Find and vote for your favorite cookbooks from the culinary community.
        </p>
      </div>
      
      <FilterBar activeSort={activeSort} setActiveSort={setActiveSort} activeTimeFilter={activeTimeFilter} setActiveTimeFilter={setActiveTimeFilter} activeCuisine={activeCuisine} setActiveCuisine={setActiveCuisine} activeCookingMethod={activeCookingMethod} setActiveCookingMethod={setActiveCookingMethod} />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cookbooks.map(cookbook => (
          <CookbookCard 
            key={cookbook.id} 
            cookbook={cookbook} 
            onClick={() => onCookbookSelect(cookbook)} 
            onFavoriteToggle={addToFavorites}
          />
        ))}
      </div>
      
      {/* Loading indicator */}
      {loading && cookbooks.length === 0 && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}
      
      {/* Load more trigger */}
      {hasMore && !loading && (
        <div ref={loadMoreRef} className="flex justify-center items-center py-8">
          <div className="text-gray-500 text-sm">Loading more cookbooks...</div>
        </div>
      )}
      
      {/* No more results */}
      {!hasMore && cookbooks.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No more cookbooks to load
        </div>
      )}
      
      {/* No results found */}
      {!loading && cookbooks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No cookbooks found</div>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>;
};