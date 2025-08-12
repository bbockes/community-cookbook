import React, { useState } from 'react';
import { TagPill } from './TagPill';
import { CuisineCard } from './CuisineCard';
import { MethodCard } from './MethodCard';
import { cuisineTags, cookingMethodTags, subcuisines } from '../utils/data';
import { ChevronDownIcon, SlidersIcon, FilterIcon, ClockIcon, UtensilsIcon, ArrowDownAZIcon } from 'lucide-react';
interface FilterBarProps {
  activeSort: string;
  setActiveSort: (sort: string) => void;
  activeTimeFilter: string;
  setActiveTimeFilter: (filter: string) => void;
  activeCuisine: string;
  setActiveCuisine: (cuisine: string) => void;
  activeCookingMethod: string;
  setActiveCookingMethod: (method: string) => void;
}
export const FilterBar: React.FC<FilterBarProps> = ({
  activeSort,
  setActiveSort,
  activeTimeFilter,
  setActiveTimeFilter,
  activeCuisine,
  setActiveCuisine,
  activeCookingMethod,
  setActiveCookingMethod
}) => {
  const [isCuisineOpen, setIsCuisineOpen] = useState(false);
  const [isCookingMethodOpen, setIsCookingMethodOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showSubcuisines, setShowSubcuisines] = useState<string | null>(null);
  const [parentCuisine, setParentCuisine] = useState<string | null>(null);
  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    if (sort === 'popular') {
      setActiveTimeFilter('all');
    }
  };

  const handleCuisineClick = (cuisine: string) => {
    if (cuisine === 'All') {
      setActiveCuisine(cuisine);
      setShowSubcuisines(null);
      setParentCuisine(null);
    } else if (subcuisines[cuisine as keyof typeof subcuisines]) {
      // Show subcuisines for this main cuisine
      setShowSubcuisines(cuisine);
      setParentCuisine(null);
    } else {
      // This is a subcuisine, select it
      setActiveCuisine(cuisine);
      setShowSubcuisines(null);
      // Find the parent cuisine for this subcuisine
      const parent = Object.keys(subcuisines).find(key => 
        subcuisines[key as keyof typeof subcuisines].includes(cuisine)
      );
      setParentCuisine(parent || null);
    }
  };

  const handleBackToCuisines = () => {
    setShowSubcuisines(null);
    setParentCuisine(null);
  };

  return <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button onClick={() => {
          setIsCuisineOpen(!isCuisineOpen);
          if (!isCuisineOpen) {
            setIsSortOpen(false);
            setIsCookingMethodOpen(false);
          }
        }} className={`flex items-center gap-2 px-4 py-2 bg-white rounded-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 ${isCuisineOpen ? 'ring-2 ring-indigo-600 ring-offset-2 shadow-md bg-indigo-50' : ''}`}>
            <FilterIcon size={16} />
            <span>Cuisine</span>
            <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isCuisineOpen ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => {
          setIsCookingMethodOpen(!isCookingMethodOpen);
          if (!isCookingMethodOpen) {
            setIsSortOpen(false);
            setIsCuisineOpen(false);
          }
        }} className={`flex items-center gap-2 px-4 py-2 bg-white rounded-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-all duration-300 ml-2 ${isCookingMethodOpen ? 'ring-2 ring-indigo-600 ring-offset-2 shadow-md bg-indigo-50' : ''}`}>
            <UtensilsIcon size={16} />
            <span>Cooking Methods</span>
            <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isCookingMethodOpen ? 'rotate-180' : ''}`} />
          </button>
          {(activeCuisine !== 'All' || activeCookingMethod !== 'All') && <div className="ml-4 flex items-center flex-wrap gap-2">
              <span className="text-sm text-gray-500 mr-1">Filtered by:</span>
              {activeCuisine !== 'All' && (
                <TagPill 
                  tag={parentCuisine ? `${parentCuisine} - ${activeCuisine}` : activeCuisine} 
                  active={true} 
                  onClick={() => {
                    setActiveCuisine('All');
                    setParentCuisine(null);
                  }} 
                  variant="square" 
                />
              )}
              {activeCookingMethod !== 'All' && <TagPill tag={activeCookingMethod} active={true} onClick={() => setActiveCookingMethod('All')} variant="square" />}
            </div>}
        </div>
        <div className="relative">
          <button onClick={() => {
          setIsSortOpen(!isSortOpen);
          if (!isSortOpen) {
            setIsCuisineOpen(false);
            setIsCookingMethodOpen(false);
          }
        }} className="flex items-center gap-2 px-4 py-2 bg-white rounded-sm border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
            <ArrowDownAZIcon size={16} />
            <span>Sort: {activeSort === 'popular' ? 'Popular' : 'Newest'}</span>
            <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
          </button>
          {/* Sort Dropdown */}
          {isSortOpen && <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md border border-gray-200 shadow-md p-4 z-20 animate-fadeIn">
              <div className="flex flex-col gap-2 mb-4">
                <label className="text-sm font-medium text-gray-700">
                  Sort by
                </label>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleSortChange('newest')} className={`text-left px-3 py-2 rounded-sm transition-colors ${activeSort === 'newest' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Newest
                  </button>
                  <button onClick={() => handleSortChange('popular')} className={`text-left px-3 py-2 rounded-sm transition-colors ${activeSort === 'popular' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Popular
                  </button>
                </div>
              </div>
              {/* Time Period (only shown when Popular is selected) */}
              {activeSort === 'popular' && <div className="border-t border-gray-200 pt-4 mt-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                    <ClockIcon size={16} />
                    Time Period
                  </label>
                  <div className="flex flex-col gap-2">
                    {['all', 'year', 'month', 'week'].map(period => <button key={period} onClick={() => setActiveTimeFilter(period)} className={`text-left px-3 py-2 rounded-sm transition-colors ${activeTimeFilter === period ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                        {period === 'year' && 'This Year'}
                        {period === 'week' && 'This Week'}
                        {period === 'month' && 'This Month'}
                        {period === 'all' && 'All Time'}
                      </button>)}
                  </div>
                </div>}
            </div>}
        </div>
      </div>
      
      {/* Cuisine Dropdown */}
      {isCuisineOpen && <div className="bg-white rounded-md border border-gray-200 shadow-md p-8 mb-6 animate-fadeIn transition-all duration-300">
          {showSubcuisines && (
            <div className="mb-6 transition-all duration-300">
              <button 
                onClick={handleBackToCuisines}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4 flex items-center gap-1"
              >
                ← Back to cuisines
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Optional: Pick a sub-cuisine</h3>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 transition-all duration-300">
            {showSubcuisines ? (
              subcuisines[showSubcuisines as keyof typeof subcuisines]?.map(subcuisine => (
                <CuisineCard 
                  key={subcuisine} 
                  cuisine={subcuisine} 
                  active={activeCuisine === subcuisine} 
                  onClick={() => handleCuisineClick(subcuisine)} 
                />
              ))
            ) : (
              cuisineTags.map(tag => (
                <CuisineCard 
                  key={tag} 
                  cuisine={tag} 
                  active={activeCuisine === tag} 
                  onClick={() => handleCuisineClick(tag)} 
                />
              ))
            )}
          </div>
        </div>}
      
      {/* Cooking Methods Dropdown */}
      {isCookingMethodOpen && <div className="bg-white rounded-md border border-gray-200 shadow-md p-8 mb-6 animate-fadeIn transition-all duration-300">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {cookingMethodTags.map(method => <MethodCard key={method} method={method} active={activeCookingMethod === method} onClick={() => setActiveCookingMethod(method)} />)}
          </div>
        </div>}
    </div>;
};