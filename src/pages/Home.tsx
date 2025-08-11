import React, { useMemo, useState } from 'react';
import { CookbookCard } from '../components/CookbookCard';
import { FilterBar } from '../components/FilterBar';
import { cookbooks } from '../utils/data';
import { Cookbook } from '../utils/types';
interface HomeProps {
  onCookbookSelect: (cookbook: Cookbook) => void;
}
export const Home: React.FC<HomeProps> = ({
  onCookbookSelect
}) => {
  const [activeSort, setActiveSort] = useState('popular');
  const [activeTimeFilter, setActiveTimeFilter] = useState('week');
  const [activeCuisine, setActiveCuisine] = useState('All');
  const [activeCookingMethod, setActiveCookingMethod] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCookbooks = useMemo(() => {
    let filtered = [...cookbooks];
    // Filter by cuisine
    if (activeCuisine !== 'All') {
      filtered = filtered.filter(cookbook => cookbook.tags.includes(activeCuisine));
    }
    // Filter by cooking method (assuming we would add this data to cookbooks)
    if (activeCookingMethod !== 'All') {
      // This is a placeholder - in a real app, cookbooks would have cooking method tags
      // filtered = filtered.filter((cookbook) =>
      //   cookbook.cookingMethods.includes(activeCookingMethod),
      // )
    }
    // Sort by newest or popular
    if (activeSort === 'newest') {
      filtered.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
    } else {
      filtered.sort((a, b) => b.votes - a.votes);
    }
    return filtered;
  }, [activeSort, activeTimeFilter, activeCuisine, activeCookingMethod]);
  return <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Discover Cookbooks
        </h1>
        <p className="text-gray-600">
          Find and vote for your favorite cookbooks from the culinary community.
        </p>
      </div>
      <FilterBar activeSort={activeSort} setActiveSort={setActiveSort} activeTimeFilter={activeTimeFilter} setActiveTimeFilter={setActiveTimeFilter} activeCuisine={activeCuisine} setActiveCuisine={setActiveCuisine} activeCookingMethod={activeCookingMethod} setActiveCookingMethod={setActiveCookingMethod} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCookbooks.map(cookbook => <CookbookCard key={cookbook.id} cookbook={cookbook} onClick={() => onCookbookSelect(cookbook)} />)}
      </div>
    </div>;
};