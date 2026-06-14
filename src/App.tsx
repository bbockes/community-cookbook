import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { Header } from './components/Header';
import { BookGrid } from './components/BookGrid';
import { Footer } from './components/Footer';
import { ProductPage } from './components/ProductPage';
import { Cookbook } from './types/cookbook';
import { fetchBookCollection, fetchAuthors, buildAuthorTabsFromBooks, listAllCookbooks, getAuthorSortLetter } from './services/cookbookApi';
import { AddCookbookModal } from './components/AddCookbookModal';
import { ApiErrorPanel } from './components/ApiErrorPanel';
import {
  getProductBreadcrumbLabel,
  TabId,
  BrowseContext,
} from './config/bookCollections';
import {
  buildMethodSubcategories,
  buildMethodSubFilters,
} from './config/cookingMethods';
import {
  buildCuisineSubcategories,
  buildCuisineSubFilters,
} from './config/cuisines';
interface SubcategoryItem {
  name: string;
  image: string;
}

function sortWithAllFirst(items: SubcategoryItem[]): SubcategoryItem[] {
  const allItems = items.filter((item) => item.name.startsWith('All '));
  const rest = items
    .filter((item) => !item.name.startsWith('All '))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  return [...allItems, ...rest];
}

function sortFilterPills(pills: string[]): string[] {
  const allPills = pills.filter((pill) => pill.startsWith('All '));
  const rest = pills
    .filter((pill) => !pill.startsWith('All '))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  return [...allPills, ...rest];
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
  id: 'foodTypes',
  label: 'Food Type'
},
{
  id: 'authors',
  label: 'Author'
}];

const ALL_AUTHOR_IMAGE =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80';

const AUTHOR_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const subcategories: Record<
  'cuisines' | 'methods' | 'foodTypes',
  SubcategoryItem[]> =
{
  cuisines: buildCuisineSubcategories(),

  methods: buildMethodSubcategories(),

  foodTypes: [
  {
    name: 'All Food Types',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  },
  {
    name: 'Breakfast',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
  },
  {
    name: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
  },
  {
    name: 'Soups & Stews',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&q=80',
  },
  {
    name: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  },
  {
    name: 'Vegan',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  },
  {
    name: 'Seafood',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
  },
  {
    name: 'Pasta & Noodles',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
  },
  {
    name: 'Salads',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  },
  {
    name: 'Snacks & Appetizers',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
  },
  {
    name: 'Sandwiches & Burgers',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
  },
  {
    name: 'BBQ',
    image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
  },
  {
    name: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
  },
  {
    name: 'Ice Cream',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
  },
  {
    name: 'Bread & Baking',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  },
  {
    name: 'Tacos',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
  },
  {
    name: 'Chicken & Poultry',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80',
  },
  {
    name: 'Cookies & Candy',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80',
  },
  {
    name: 'Drinks & Cocktails',
    image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=80',
  },
  ],

};
const subCuisineFilters = buildCuisineSubFilters();
const subMethodFilters = buildMethodSubFilters();
export function App() {
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(
    null
  );
  const [activeSubFilter, setActiveSubFilter] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Cookbook | null>(null);
  const [productBrowseContext, setProductBrowseContext] =
    useState<BrowseContext | null>(null);
  const [showAddCookbook, setShowAddCookbook] = useState(false);
  const [addBookNotice, setAddBookNotice] = useState<string | null>(null);
  const [authorTabs, setAuthorTabs] = useState<SubcategoryItem[]>([]);
  const [activeAuthorLetter, setActiveAuthorLetter] = useState('A');

  const authorLetters = useMemo(() => {
    const letters = new Set(AUTHOR_LETTERS);
    for (const author of authorTabs) {
      letters.add(getAuthorSortLetter(author.name));
    }
    const ordered = AUTHOR_LETTERS.filter((letter) => letters.has(letter));
    if (letters.has('#')) ordered.push('#');
    return ordered;
  }, [authorTabs]);

  const authorPillsForLetter = useMemo(
    () =>
      authorTabs
        .filter((author) => getAuthorSortLetter(author.name) === activeAuthorLetter)
        .map((author) => author.name)
        .sort((a, b) =>
          a.localeCompare(b, undefined, { sensitivity: 'base' })
        ),
    [authorTabs, activeAuthorLetter]
  );

  const loadAuthors = useCallback(async () => {
    const toTabs = (authors: { name: string; image: string }[]) =>
      authors.map((author) => ({
        name: author.name,
        image: author.image || ALL_AUTHOR_IMAGE,
      }));

    try {
      setAuthorTabs(toTabs(await fetchAuthors()));
    } catch {
      try {
        setAuthorTabs(toTabs(buildAuthorTabsFromBooks(await listAllCookbooks())));
      } catch {
        setAuthorTabs([]);
      }
    }
  }, []);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const books = await fetchBookCollection(
        activeTab,
        activeSubcategory,
        activeSubFilter,
        activeTab === 'authors' && !activeSubcategory ? activeAuthorLetter : null
      );
      setCookbooks(books);
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, activeSubcategory, activeSubFilter, activeAuthorLetter]);

  const refreshLibrary = useCallback(async () => {
    await Promise.all([loadAuthors(), loadBooks()]);
  }, [loadAuthors, loadBooks]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  useEffect(() => {
    loadAuthors();
  }, [loadAuthors]);

  useEffect(() => {
    if (
      activeTab === 'authors' &&
      activeSubcategory &&
      !authorTabs.some((author) => author.name === activeSubcategory)
    ) {
      setActiveSubcategory(null);
    }
  }, [activeTab, activeSubcategory, authorTabs]);

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    setActiveSubcategory(null);
    setActiveSubFilter(null);
    if (tabId === 'authors') {
      setActiveAuthorLetter('A');
      loadAuthors();
    }
  };
  const handleAuthorLetterChange = (letter: string) => {
    setActiveAuthorLetter(letter);
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
    setActiveAuthorLetter('A');
  };
  const hasSubcategories =
  activeTab === 'cuisines' ||
  activeTab === 'methods' ||
  activeTab === 'foodTypes';
  const currentSubcategories = hasSubcategories
    ? sortWithAllFirst(subcategories[activeTab])
    : null;
  const getSubFilterPills = (): string[] | null => {
    if (!activeSubcategory) return null;
    if (activeTab === 'cuisines') {
      const pills = subCuisineFilters[activeSubcategory];
      return pills ? sortFilterPills(pills) : null;
    }
    if (activeTab === 'methods') {
      const pills = subMethodFilters[activeSubcategory];
      return pills ? sortFilterPills(pills) : null;
    }
    return null;
  };
  const subFilterPills = getSubFilterPills();
  const breadcrumbParts: string[] = [];
  if (activeTab !== 'all') {
    const tabLabel = tabs.find((t) => t.id === activeTab)?.label || '';
    breadcrumbParts.push(tabLabel);
    if (activeTab === 'authors') {
      if (activeSubcategory) breadcrumbParts.push(activeSubcategory);
      else if (activeAuthorLetter) breadcrumbParts.push(activeAuthorLetter);
    } else {
      if (activeSubcategory) breadcrumbParts.push(activeSubcategory);
      if (activeSubFilter) breadcrumbParts.push(activeSubFilter);
    }
  }
  const handleBookClick = (book: Cookbook) => {
    setProductBrowseContext({
      tab: activeTab,
      subcategory: activeSubcategory,
      subFilter: activeSubFilter,
      authorLetter: activeTab === 'authors' ? activeAuthorLetter : null,
    });
    setSelectedBook(book);
    window.scrollTo(0, 0);
  };

  const restoreBrowseContext = (context: BrowseContext) => {
    setActiveTab(context.tab);
    setActiveSubcategory(context.subcategory);
    setActiveSubFilter(context.subFilter);
    setActiveAuthorLetter(context.authorLetter ?? 'A');
    setSelectedBook(null);
    setProductBrowseContext(null);
    window.scrollTo(0, 0);
  };

  const handleBackHome = () => {
    setActiveTab('all');
    setActiveSubcategory(null);
    setActiveSubFilter(null);
    setActiveAuthorLetter('A');
    setSelectedBook(null);
    setProductBrowseContext(null);
    window.scrollTo(0, 0);
  };

  const handleBackToBrowse = () => {
    if (productBrowseContext) {
      restoreBrowseContext(productBrowseContext);
    } else {
      handleBackHome();
    }
  };

  if (selectedBook) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Header />
        <main className="flex-grow">
          <ProductPage
            book={selectedBook}
            browseContext={productBrowseContext}
            onBackHome={handleBackHome}
            onBackToBrowse={handleBackToBrowse}
          />

        </main>
        <Footer />
      </div>);

  }
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />
      {showAddCookbook && (
        <AddCookbookModal
          onClose={() => setShowAddCookbook(false)}
          onAdded={(book, meta) => {
            setShowAddCookbook(false);
            if (meta?.alreadyExists) {
              setAddBookNotice(`"${book.title}" is already in your library.`);
            } else {
              setAddBookNotice(null);
            }
            refreshLibrary();
          }}
        />
      )}
      <main className="flex-grow">
        {addBookNotice && (
          <div className="container mx-auto px-4 pt-6">
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {addBookNotice}
            </p>
          </div>
        )}
        <div className="container mx-auto px-4 py-10">
          {/* Tab navigation */}
          <div className="border-b border-gray-200 mb-6 flex items-end justify-between gap-4">
            <nav
              className="flex overflow-x-auto -mb-px space-x-8 min-w-0 flex-1"
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
            <button
              type="button"
              onClick={() => setShowAddCookbook(true)}
              className="flex shrink-0 items-center gap-1.5 mb-2 text-sm font-medium text-amber-700 hover:text-amber-800 border border-amber-300 rounded-lg px-3 py-1.5 bg-white hover:bg-amber-50 transition"
            >
              <PlusIcon size={16} />
              Add Cookbook
            </button>
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
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
                      }}
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

          {activeTab === 'authors' && (
            <>
              <div
                className="mb-4 flex overflow-x-auto gap-1 border-b border-gray-200 pb-3 scrollbar-hide"
                role="tablist"
                aria-label="Author alphabet"
              >
                {authorLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    role="tab"
                    aria-selected={activeAuthorLetter === letter}
                    onClick={() => handleAuthorLetterChange(letter)}
                    className={`min-w-[2.25rem] shrink-0 rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${
                      activeAuthorLetter === letter
                        ? 'bg-amber-600 text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {authorPillsForLetter.length > 0 ? (
                <div className="mb-6 flex flex-wrap gap-2">
                  {authorPillsForLetter.map((authorName) => (
                    <button
                      key={authorName}
                      type="button"
                      onClick={() => {
                        setActiveSubcategory(
                          activeSubcategory === authorName ? null : authorName
                        );
                        setActiveSubFilter(null);
                      }}
                      className={`rounded-full px-4 py-1.5 text-base font-medium transition ${
                        activeSubcategory === authorName
                          ? 'bg-amber-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {authorName}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mb-6 text-sm text-gray-500">
                  No authors found for {activeAuthorLetter}.
                </p>
              )}
            </>
          )}

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
              {cookbooks.length}{' '}
              {cookbooks.length === 1 ? 'cookbook' : 'cookbooks'}
            </span>
          </div>

          {isLoading &&
          <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
          }

          {!isLoading && loadError != null &&
          <ApiErrorPanel error={loadError} onRetry={loadBooks} />
          }

          {!isLoading && !loadError &&
          (cookbooks.length > 0 ? (
            <BookGrid books={cookbooks} onBookClick={handleBookClick} />
          ) : (
            <div className="text-center py-20 px-4">
              <p className="text-gray-900 font-semibold text-lg mb-2">No cookbooks yet</p>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Add books with the button above, or run{' '}
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">npm run seed</code>{' '}
                to import the curated collection from Google Books.
              </p>
              <button
                type="button"
                onClick={() => setShowAddCookbook(true)}
                className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition"
              >
                Add your first cookbook
              </button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>);

}