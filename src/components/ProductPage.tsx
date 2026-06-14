import React, { useEffect, useState } from 'react';
import {
  Star,
  ChevronRight,
  Search } from
'lucide-react';
import { Cookbook, formatAuthors } from '../types/cookbook';
import { BrowseContext, getProductBreadcrumbLabel } from '../config/bookCollections';
import { CookbookCover } from './CookbookCover';
import { formatDescription } from '../utils/formatDescription';
import { fetchCookbookById } from '../services/cookbookApi';
import { ReviewSummary, buildReviewSummary } from './ReviewSummary';
import { RecipeCardModal, RecipeCardData } from './RecipeCardModal';

interface ProductPageProps {
  book: Cookbook;
  browseContext: BrowseContext | null;
  onBackHome: () => void;
  onBackToBrowse: () => void;
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

const PLACEHOLDER_RECIPE_CARDS = [
  { id: 1, author: 'Lorem Ipsum', rating: 4.6, comments: 2 },
  { id: 2, author: 'Dolor Sit', rating: 4.8, comments: 0 },
  { id: 3, author: 'Amet Consectetur', rating: 4.2, comments: 5 },
];

const RECIPE_TITLES = [
  'Lorem ipsum dolor plate',
  'Consectetur elit bowl',
  'Adipiscing sed amet stew',
];

const AVATAR_URL =
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80';

function roundRating(value: number): number {
  return Math.round(value);
}

function buildRecipeCards(bookTitle: string): RecipeCardData[] {
  return PLACEHOLDER_RECIPE_CARDS.map((card, index) => {
    const taste = roundRating(card.rating);
    const time = roundRating(Math.min(5, card.rating + 0.1));
    const difficulty = roundRating(Math.max(1, card.rating - 0.2));

    const comments =
      card.comments === 0
        ? []
        : Array.from({ length: Math.min(card.comments, 3) }, (_, i) => ({
            id: i + 1,
            user: i === 0 ? 'Lorem Ipsum' : i === 1 ? 'Dolor Sit' : 'Amet Consectetur',
            avatar: AVATAR_URL,
            text: LOREM,
            timeAgo: i === 0 ? '2 weeks ago' : i === 1 ? '5 days ago' : '1 day ago',
          }));

    return {
      id: card.id,
      title: RECIPE_TITLES[index],
      user: card.author,
      userAvatar: AVATAR_URL,
      image: '',
      bookTitle,
      ratings: { taste, time, difficulty },
      reviews: {
        taste: LOREM,
        time: LOREM,
        ingredients: LOREM,
      },
      comments,
    };
  });
}

const coverShadow =
  'drop-shadow-[-4px_6px_8px_rgba(0,0,0,0.12)] drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)]';

export const ProductPage = ({
  book,
  browseContext,
  onBackHome,
  onBackToBrowse,
}: ProductPageProps) => {
  const [bookDetails, setBookDetails] = useState<Cookbook>(book);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipes'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeCardData | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBookDetails(book);
    setIsLoadingDetails(true);
    fetchCookbookById(book.id)
      .then((details) => {
        if (!cancelled && details) setBookDetails(details);
      })
      .catch(() => {
        if (!cancelled) setBookDetails(book);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetails(false);
      });
    return () => {
      cancelled = true;
    };
  }, [book]);

  const description = formatDescription(bookDetails.description);
  const truncatedDescription =
  description.length > 400 && !isDescriptionExpanded ?
  `${description.slice(0, 400).trim()}…` :
  description;

  const communityReviews: { rating: number }[] = [];
  const reviewSummary = buildReviewSummary(communityReviews);
  const recipeCards = buildRecipeCards(bookDetails.title);
  const breadcrumbCategory = browseContext
    ? getProductBreadcrumbLabel(browseContext)
    : 'All Cookbooks';

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex items-center gap-1.5 text-sm text-gray-400"
      >
        <button
          onClick={onBackHome}
          className="hover:text-amber-600 transition-colors"
        >
          Home
        </button>
        <ChevronRight size={14} className="shrink-0 text-gray-300" aria-hidden />
        {browseContext ? (
          <button
            onClick={onBackToBrowse}
            className="font-medium text-gray-600 hover:text-amber-600 transition-colors"
          >
            {breadcrumbCategory}
          </button>
        ) : (
          <span className="font-medium text-gray-600">{breadcrumbCategory}</span>
        )}
        <ChevronRight size={14} className="shrink-0 text-gray-300" aria-hidden />
        <span className="truncate font-medium text-gray-700">{bookDetails.title}</span>
      </nav>

      <div className="mb-12 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
        <div className="shrink-0">
          <div className="w-[240px] sm:w-[260px] lg:w-[280px]">
            <CookbookCover
              book={bookDetails}
              className={`w-full ${coverShadow}`}
              imgClassName={`w-full object-contain ${coverShadow}`}
            />
          </div>
        </div>

        <div className="w-full min-w-0 sm:flex-1 sm:pt-1 sm:pl-3 lg:pl-4">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-[2rem] lg:leading-tight">
            {bookDetails.title}
          </h1>
          <p className="mt-1.5 text-base text-gray-500 sm:text-lg">
            by {formatAuthors(bookDetails.authors)}
          </p>

          {isLoadingDetails ? (
            <div className="mt-5 space-y-2.5 animate-pulse">
              <div className="h-4 rounded bg-gray-200 w-full" />
              <div className="h-4 rounded bg-gray-200 w-full" />
              <div className="h-4 rounded bg-gray-200 w-4/5" />
            </div>
          ) : description ? (
            <div className="mt-5">
              <p className="text-[15px] leading-relaxed text-gray-600 whitespace-pre-line sm:text-base">
                {truncatedDescription}
              </p>
              {description.length > 400 && (
                <button
                  onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                  className="mt-2 text-sm font-semibold text-amber-600 hover:underline"
                >
                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          ) : (
            <p className="mt-5 text-base text-gray-400">
              No description available for this cookbook.
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5 sm:max-w-sm">
            <button
              type="button"
              className="w-full rounded-lg bg-[#394282] py-3 text-sm font-semibold text-white transition hover:bg-[#2f3668] sm:text-base"
            >
              Buy now
            </button>
            <button
              type="button"
              className="w-full rounded-lg border border-orange-400 bg-orange-50 py-3 text-sm font-semibold text-[#394282] transition hover:bg-orange-100 sm:text-base"
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-6 sm:gap-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`relative pb-3.5 text-base font-semibold transition sm:text-lg ${
              activeTab === 'reviews'
                ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#394282]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Cookbook Reviews
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              {reviewSummary.totalRatings}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`relative pb-3.5 text-base font-semibold transition sm:text-lg ${
              activeTab === 'recipes'
                ? 'text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#394282]'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            Recipe Cards
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              3
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'recipes' &&
      <div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-96">
              <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20} />

              <input
              type="text"
              placeholder="Search within cards"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />

            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <button className="flex items-center gap-2 text-gray-600 font-medium">
                Highest Rated <ChevronRight className="rotate-90" size={16} />
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition">
                Add Card
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipeCards.map((card) => (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedRecipe(card)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedRecipe(card);
                  }
                }}
                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer"
              >
                <div className="h-48 bg-gray-100" />
                <div className="p-4">
                  <p className="text-gray-900 font-medium mb-1">{card.title}</p>
                  <p className="text-gray-500 text-sm mb-1">{card.user}</p>
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{LOREM}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="fill-amber-400 text-amber-400" size={18} />
                      <span className="font-medium">
                        {Math.round(
                          (card.ratings.taste +
                            card.ratings.time +
                            card.ratings.difficulty) /
                            3
                        )}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {card.comments.length}{' '}
                      {card.comments.length === 1 ? 'comment' : 'comments'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      }

      {activeTab === 'reviews' &&
      <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-start">
            <ReviewSummary
              averageRating={
                reviewSummary.totalRatings > 0 ? reviewSummary.averageRating : undefined
              }
              totalRatings={reviewSummary.totalRatings}
              distribution={
                reviewSummary.totalRatings > 0 ? reviewSummary.distribution : undefined
              }
            />

            <div className="flex-1 min-w-0 w-full">
              <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                <p className="text-gray-900 font-medium mb-1.5">
                  No reviews yet
                </p>
                <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
                  Be the first to share your thoughts on this cookbook with the
                  community.
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <RecipeCardModal
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        recipe={selectedRecipe}
      />

    </div>);

};