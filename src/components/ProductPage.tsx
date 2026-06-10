import React, { useEffect, useState } from 'react';
import {
  Star,
  Heart,
  ChevronRight,
  Search,
  ShoppingBag } from
'lucide-react';
import { Cookbook, formatAuthors } from '../types/cookbook';
import { BrowseContext, getProductBreadcrumbLabel } from '../config/bookCollections';
import { CookbookCover } from './CookbookCover';
import { fetchCookbookById } from '../services/googleBooks';
import { ReviewSummary, buildReviewSummary } from './ReviewSummary';
import { RecipeCardModal, RecipeCardData } from './RecipeCardModal';

interface ProductPageProps {
  book: Cookbook;
  browseContext: BrowseContext | null;
  onBack: () => void;
}

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.';

const PLACEHOLDER_REVIEWS = [
  { id: 1, author: 'Lorem Ipsum', rating: 4.5, date: '2 weeks ago' },
  { id: 2, author: 'Dolor Sit', rating: 5.0, date: '1 month ago' },
  { id: 3, author: 'Amet Consectetur', rating: 4.0, date: '3 weeks ago' },
];

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

export const ProductPage = ({ book, browseContext, onBack }: ProductPageProps) => {
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

  const description = bookDetails.description?.replace(/<[^>]+>/g, '') ?? '';
  const truncatedDescription =
  description.length > 400 && !isDescriptionExpanded ?
  `${description.slice(0, 400).trim()}…` :
  description;

  const reviewSummary = buildReviewSummary(PLACEHOLDER_REVIEWS);
  const recipeCards = buildRecipeCards(bookDetails.title);
  const breadcrumbCategory = browseContext
    ? getProductBreadcrumbLabel(browseContext)
    : 'All Cookbooks';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-base text-gray-500 mb-8 flex items-center gap-2">
        <button
          onClick={onBack}
          className="hover:text-amber-600 hover:underline">

          home
        </button>
        <span>&gt;</span>
        <span className="text-gray-500">{breadcrumbCategory}</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium truncate max-w-[300px]">
          {bookDetails.title}
        </span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left: Images */}
        <div className="flex justify-center items-start">
          <div className="bg-gray-100 rounded-xl overflow-hidden max-h-[400px]">
            <CookbookCover
              book={bookDetails}
              imgClassName="max-h-[400px] w-auto object-contain"
            />
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {bookDetails.title}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            by {formatAuthors(bookDetails.authors)}
          </p>

          {bookDetails.publisher &&
          <p className="text-base text-gray-500 mb-2">
              Published by {bookDetails.publisher}
            </p>
          }

          {bookDetails.pageCount != null && bookDetails.pageCount > 0 &&
          <p className="text-base text-gray-500 mb-4">
              {bookDetails.pageCount} pages
            </p>
          }

          <div className="flex items-center gap-2 mb-8">
            {bookDetails.rating != null ?
            <>
                <Star className="fill-amber-400 text-amber-400" size={20} />
                <span className="text-base font-medium">
                  {Math.round(bookDetails.rating)} out of 5
                </span>
                {bookDetails.ratingsCount != null && bookDetails.ratingsCount > 0 &&
              <span className="text-base text-gray-500">
                    ({bookDetails.ratingsCount}{' '}
                    {bookDetails.ratingsCount === 1 ? 'review' : 'reviews'})
                  </span>
              }
              </> :

            <span className="text-base text-gray-500">No ratings yet</span>
            }
          </div>

          {isLoadingDetails ?
          <div className="space-y-3 mb-8 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div> :
          description ?
          <div className="mb-8">
              <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                {truncatedDescription}
              </p>
              {description.length > 400 &&
            <button
              onClick={() => setIsDescriptionExpanded((prev) => !prev)}
              className="text-amber-600 font-semibold hover:underline mt-2">

                  {isDescriptionExpanded ? 'Show less' : 'Read more'}
                </button>
            }
            </div> :

          <p className="text-gray-500 text-lg mb-8">
              No description available for this cookbook.
            </p>
          }

          <div className="space-y-3">
            <button className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Buy now
            </button>
            <button className="w-full bg-white text-black border-2 border-black py-4 rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <Heart size={20} />
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-lg font-semibold transition ${activeTab === 'reviews' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-800'}`}>

            Cookbook Reviews{' '}
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              3
            </span>
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`pb-4 text-lg font-semibold transition ${activeTab === 'recipes' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-800'}`}>

            Recipe Cards{' '}
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
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
              averageRating={reviewSummary.averageRating}
              totalRatings={reviewSummary.totalRatings}
              distribution={reviewSummary.distribution}
            />

            <div className="flex-1 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="relative w-full sm:flex-1 sm:max-w-none">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20} />
                  <input
                    type="text"
                    placeholder="Search reviews"
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <button className="flex items-center gap-2 text-gray-600 font-medium hover:text-gray-900 transition shrink-0 sm:ml-4">
                  Highest Rated <ChevronRight className="rotate-90" size={16} />
                </button>
              </div>

              <div className="space-y-0">
                {PLACEHOLDER_REVIEWS.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 py-6 text-left">
                    <div className="mb-4">
                      <p className="font-medium text-gray-900 mb-1">{review.author}</p>
                      <div className="flex items-center gap-2">
                        <Star className="fill-amber-400 text-amber-400" size={16} />
                        <span className="text-sm text-gray-500">
                          {Math.round(review.rating)} · {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{LOREM}</p>
                  </div>
                ))}
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