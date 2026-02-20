import React, { useState } from 'react';
import { Header } from './components/Header';
import { BookGrid } from './components/BookGrid';
import { Footer } from './components/Footer';
import { cookbookData } from './data/cookbooks';
import { ProductPage } from './components/ProductPage';
import { Cookbook } from './components/BookCard';
type TabId = 'all' | 'cuisines' | 'methods' | 'authors' | 'bestsellers';
interface SubcategoryItem {
  name: string;
  image: string;
}
const tabs: {
  id: TabId;
  label: string;
}[] = [
{
  id: 'all',
  label: 'All'
},
{
  id: 'cuisines',
  label: 'Cuisines'
},
{
  id: 'methods',
  label: 'Cooking Methods'
},
{
  id: 'authors',
  label: 'Authors'
},
{
  id: 'bestsellers',
  label: 'Best Sellers'
}];

const subcategories: Record<
  'cuisines' | 'methods' | 'authors',
  SubcategoryItem[]> =
{
  cuisines: [
  {
    name: 'All Cuisines',
    image:
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'French',
    image:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Asian',
    image:
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Italian',
    image:
    'https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mexican',
    image:
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mediterranean',
    image:
    'https://images.unsplash.com/photo-1523986390382-10f312ca0a17?auto=format&fit=crop&w=800&q=80'
  }],

  methods: [
  {
    name: 'All Methods',
    image:
    'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Baking',
    image:
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Grilling',
    image:
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Slow Cooking',
    image:
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Stir-Fry',
    image:
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Roasting',
    image:
    'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80'
  }],

  authors: [
  {
    name: 'All Authors',
    image:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Julia Child',
    image:
    'https://images.unsplash.com/photo-1583394293214-28ded15ee548?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Donna Hay',
    image:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Jill Dalton',
    image:
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Jamie Oliver',
    image:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Peter Reinhart',
    image:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Ming Tsai',
    image:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Terry Walters',
    image:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Ree Drummond',
    image:
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80'
  }]

};
const subCuisineFilters: Record<string, string[]> = {
  French: ['All French', 'Classic French', 'Provençal', 'Bistro', 'Pastry'],
  Asian: [
  'All Asian',
  'Chinese',
  'Japanese',
  'Korean',
  'Indian',
  'Thai',
  'Vietnamese',
  'Nepalese'],

  Italian: ['All Italian', 'Tuscan', 'Sicilian', 'Roman', 'Neapolitan'],
  Mexican: ['All Mexican', 'Oaxacan', 'Yucatecan', 'Baja', 'Street Food'],
  Mediterranean: [
  'All Mediterranean',
  'Greek',
  'Turkish',
  'Lebanese',
  'Moroccan']

};
const subMethodFilters: Record<string, string[]> = {
  Baking: ['All Baking', 'Bread', 'Pastries', 'Cakes', 'Cookies'],
  Grilling: ['All Grilling', 'Charcoal', 'Gas', 'Smoking', 'BBQ'],
  'Slow Cooking': ['All Slow Cooking', 'Braising', 'Stewing', 'Sous Vide'],
  'Stir-Fry': ['All Stir-Fry', 'Wok', 'Pan-Fry', 'Deep-Fry'],
  Roasting: ['All Roasting', 'Oven Roast', 'Spit Roast', 'Pan Roast']
};
function filterBooks(category: TabId, subcategory: string | null) {
  if (category === 'all') return cookbookData;
  if (category === 'bestsellers')
  return cookbookData.filter((b) => b.bestseller);
  if (!subcategory) return cookbookData;
  if (category === 'cuisines') {
    if (subcategory === 'All Cuisines') return cookbookData;
    const cuisineMap: Record<string, string[]> = {
      French: ['The Art of French Cooking'],
      Asian: ['Asian Flavors'],
      Italian: [],
      Mexican: [],
      Mediterranean: ['Clean Eating Cookbook']
    };
    const titles = cuisineMap[subcategory] || [];
    if (titles.length === 0) return [];
    return cookbookData.filter((b) => titles.includes(b.title));
  }
  if (category === 'methods') {
    if (subcategory === 'All Methods') return cookbookData;
    const methodMap: Record<string, string[]> = {
      Baking: ['baking'],
      Grilling: ['quick'],
      'Slow Cooking': ['international'],
      'Stir-Fry': ['international'],
      Roasting: ['quick']
    };
    const categories = methodMap[subcategory] || [];
    return cookbookData.filter((b) => categories.includes(b.category));
  }
  if (category === 'authors') {
    if (subcategory === 'All Authors') return cookbookData;
    return cookbookData.filter((b) => b.author === subcategory);
  }
  return cookbookData;
}
export function App() {
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Cookbook | null>(null);
  const filteredBooks = filterBooks(activeTab, activeSubcategory);
  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setActiveSubcategory(null);
    setActiveSubFilter(null);
  };
  const handleSubcategorySelect = (name: string) => {
    const isAllOption = name.startsWith('All ');
    setActiveSubcategory(isAllOption ? null : name);
    setActiveSubFilter(null);
  };
  const clearAll = () => {
    setActiveTab('all');
    setActiveSubcategory(null);
    setActiveSubFilter(null);
  };
  const hasSubcategories =
  activeTab === 'cuisines' ||
  activeTab === 'methods' ||
  activeTab === 'authors';
  const currentSubcategories = hasSubcategories ?
  subcategories[activeTab] :
  null;
  const getSubFilterPills = (): string[] | null => {
    if (!activeSubcategory) return null;
    if (activeTab === 'cuisines')
    return subCuisineFilters[activeSubcategory] || null;
    if (activeTab === 'methods')
    return subMethodFilters[activeSubcategory] || null;
    return null;
  };
  const subFilterPills = getSubFilterPills();
  const breadcrumbParts: string[] = [];
  if (activeTab !== 'all') {
    const tabLabel = tabs.find((t) => t.id === activeTab)?.label || '';
    breadcrumbParts.push(tabLabel);
    if (activeSubcategory) breadcrumbParts.push(activeSubcategory);
    if (activeSubFilter) breadcrumbParts.push(activeSubFilter);
  }
  const handleBookClick = (book: Cookbook) => {
    setSelectedBook(book);
    window.scrollTo(0, 0);
  };
  if (selectedBook) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="flex-grow">
          <ProductPage
            book={selectedBook}
            onBack={() => setSelectedBook(null)} />

        </main>
        <Footer />
      </div>);

  }
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10">
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav
              className="flex overflow-x-auto -mb-px space-x-8"
              role="tablist"
              aria-label="Browse categories">

              {tabs.map((tab) =>
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`whitespace-nowrap pb-3 text-base font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-amber-600 text-gray-900 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>

                  {tab.label}
                </button>
              )}
            </nav>
          </div>

          {/* Subcategory image cards */}
          {currentSubcategories &&
          <div className="mb-6" role="tabpanel">
              <div className="flex overflow-x-auto gap-3 py-1 pb-3 scrollbar-hide">
                {currentSubcategories.map((item) => {
                const isAllOption = item.name.startsWith('All ');
                const isActive = isAllOption ?
                !activeSubcategory :
                activeSubcategory === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleSubcategorySelect(item.name)}
                    className={`relative flex-shrink-0 w-[170px] h-[110px] rounded-lg overflow-hidden border-2 transition-all ${isActive ? 'border-amber-600' : 'border-transparent hover:opacity-90'}`}>

                      <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover" />

                      <div
                      className={`absolute inset-0 ${isActive ? 'bg-black/50' : 'bg-black/35'}`} />

                      <span className="relative z-10 flex items-center justify-center w-full h-full text-white text-base font-semibold text-center px-3 drop-shadow-sm">
                        {item.name}
                      </span>
                    </button>);

              })}
              </div>
            </div>
          }

          {/* Sub-filter pills */}
          {subFilterPills &&
          <div className="flex flex-wrap gap-2 mb-6">
              {subFilterPills.map((pill) => {
              const isAllOption = pill.startsWith('All ');
              const isActive = isAllOption ?
              !activeSubFilter :
              activeSubFilter === pill;
              return (
                <button
                  key={pill}
                  onClick={() =>
                  setActiveSubFilter(isAllOption ? null : pill)
                  }
                  className={`px-4 py-1.5 rounded-full text-base font-medium transition ${isActive ? 'bg-amber-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400'}`}>

                    {pill}
                  </button>);

            })}
            </div>
          }

          {/* Breadcrumb + result count */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-base text-gray-500">
              {breadcrumbParts.length > 0 ?
              <>
                  <span>
                    Browsing:{' '}
                    {breadcrumbParts.map((part, i) =>
                  <span key={part}>
                        {i > 0 && <span className="mx-1 text-gray-300">›</span>}
                        <span
                      className={
                      i === breadcrumbParts.length - 1 ?
                      'text-gray-900 font-medium' :
                      'text-gray-500'
                      }>

                          {part}
                        </span>
                      </span>
                  )}
                  </span>
                  <button
                  onClick={clearAll}
                  className="ml-3 text-amber-600 underline underline-offset-2 text-base hover:text-amber-700 transition">

                    Clear all
                  </button>
                </> :

              <span className="text-gray-900 font-medium">All Cookbooks</span>
              }
            </div>
            <span className="text-base text-gray-400">
              {filteredBooks.length}{' '}
              {filteredBooks.length === 1 ? 'cookbook' : 'cookbooks'}
            </span>
          </div>

          <BookGrid books={filteredBooks} onBookClick={handleBookClick} />
        </div>
      </main>
      <Footer />
    </div>);

}