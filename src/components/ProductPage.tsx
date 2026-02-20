import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Clock,
  Utensils,
  Smile,
  User,
  ShoppingBag } from
'lucide-react';
import { Cookbook } from './BookCard';
import { RecipeCardModal, RecipeCardData } from './RecipeCardModal';
interface ProductPageProps {
  book: Cookbook;
  onBack: () => void;
}
const MOCK_RECIPE_CARDS: RecipeCardData[] = [
{
  id: 1,
  title: 'Goat Curry with Yogurt',
  user: 'Isabella Santos',
  userAvatar:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  image:
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80',
  bookTitle: 'Foods & Flavors of Nepal',
  ratings: {
    taste: 4.7,
    time: 5.0,
    difficulty: 4.2
  },
  reviews: {
    taste:
    'YESSS!! The tender, smoky chicken paired with the creamy tomato gravy creates an unforgettable flavor sensation.',
    time: 'This recipe was really easy to follow. The instructions were clear and the photos helped a lot.',
    ingredients:
    'Yes, the ingredients for this recipe were easily accessible; however, I did find it slightly challenging to locate one of the spices used.'
  },
  comments: [
  {
    id: 1,
    user: 'Maria Santos',
    avatar:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    text: 'Sounds like an amazing dish!!',
    timeAgo: '5 months ago'
  },
  {
    id: 2,
    user: 'Ahmed Khan',
    avatar:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    text: "Can't wait to try this one!",
    timeAgo: '2 weeks ago'
  },
  {
    id: 3,
    user: 'Anna Petrovna',
    avatar:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    text: 'Agreed. There are SO many great recipes in this cookbook. Excited to try them all.',
    timeAgo: '1 day ago'
  }]

},
{
  id: 2,
  title: 'Chicken Chowelaa',
  user: 'Isabella Santos',
  userAvatar:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
  image:
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  bookTitle: 'Foods & Flavors of Nepal',
  ratings: {
    taste: 4.8,
    time: 4.8,
    difficulty: 4.8
  },
  reviews: {
    taste:
    'Absolutely delicious! The spices were perfectly balanced and the chicken was so tender.',
    time: 'Instructions were straightforward. Took about 45 minutes total.',
    ingredients:
    'Found everything at my local grocery store except the fenugreek seeds.'
  },
  comments: []
},
{
  id: 3,
  title: 'Green Jackfruit Curry',
  user: 'Ayaan Patel',
  userAvatar:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
  image:
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
  bookTitle: 'Foods & Flavors of Nepal',
  ratings: {
    taste: 4.8,
    time: 4.3,
    difficulty: 2.0
  },
  reviews: {
    taste:
    'Surprisingly meaty texture for a vegetarian dish. Very satisfying.',
    time: 'Prep took longer than expected due to cutting the jackfruit.',
    ingredients:
    'Canned jackfruit was easy to find, but fresh is better if you can get it.'
  },
  comments: []
}];

export const ProductPage = ({ book, onBack }: ProductPageProps) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipes'>('recipes');
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeCardData | null>(
    null
  );
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <button
          onClick={onBack}
          className="hover:text-amber-600 hover:underline">

          home
        </button>
        <span>&gt;</span>
        <span className="capitalize">{book.category} cookbooks</span>
        <span>&gt;</span>
        <span className="text-gray-900 font-medium truncate max-w-[300px]">
          {book.title.toLowerCase()}
        </span>
      </div>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group">
            <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition z-10">
              <ChevronLeft size={24} />
            </button>
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover" />

            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md hover:bg-white transition z-10">
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) =>
            <div
              key={i}
              className={`aspect-square rounded-lg overflow-hidden cursor-pointer ${i === 0 ? 'ring-2 ring-amber-600' : 'opacity-70 hover:opacity-100'}`}>

                <img
                src={book.image}
                alt="Thumbnail"
                className="w-full h-full object-cover" />

              </div>
            )}
          </div>
        </div>

        {/* Right: Info */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {book.title}
          </h1>
          <p className="text-xl text-gray-600 mb-6">by {book.author}</p>

          <div className="flex items-center gap-6 mb-8">
            <span className="text-3xl font-bold text-gray-900">
              ${book.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-2">
              <Star className="fill-amber-400 text-amber-400" size={24} />
              <span className="text-lg font-medium">
                {book.rating} out of 5
              </span>
              <span className="text-gray-500">(70 reviews)</span>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-8">
              <button className="pb-2 border-b-2 border-black font-semibold">
                Description
              </button>
              <button className="pb-2 border-b-2 border-transparent text-gray-500 hover:text-gray-800">
                Dimensions
              </button>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-4">
            This new cookbook brings the foods and flavors of {book.category}{' '}
            cooking alive with color photographs throughout, notes about
            important customs, festivals and holidays, and a collection of 185
            recipes that spans traditional fare to popular fusion dishes, street
            foods and the modern table.
          </p>
          <button className="text-amber-600 font-semibold hover:underline mb-8">
            More...
          </button>

          <div className="space-y-3">
            <button className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">
              <ShoppingBag size={20} />
              Add to Cart
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

            Cookbook Reviews
          </button>
          <button
            onClick={() => setActiveTab('recipes')}
            className={`pb-4 text-lg font-semibold transition ${activeTab === 'recipes' ? 'border-b-2 border-black text-black' : 'text-gray-500 hover:text-gray-800'}`}>

            Recipe Cards{' '}
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              12
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
            {MOCK_RECIPE_CARDS.map((card) =>
          <div
            key={card.id}
            onClick={() => setSelectedRecipe(card)}
            className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition cursor-pointer">

                <div className="h-48 overflow-hidden">
                  <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover hover:scale-105 transition duration-500" />

                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{card.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{card.user}</p>

                  <div className="flex justify-between gap-2">
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                      <Smile size={14} className="text-amber-600" />
                      <span>{card.ratings.taste}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                      <Clock size={14} className="text-amber-600" />
                      <span>{card.ratings.time}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                      <Utensils size={14} className="text-amber-600" />
                      <span>{card.ratings.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
          )}
          </div>
        </div>
      }

      {activeTab === 'reviews' &&
      <div className="text-center py-12 text-gray-500">
          <p>No reviews yet. Be the first to review this cookbook!</p>
        </div>
      }

      <RecipeCardModal
        isOpen={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        recipe={selectedRecipe} />

    </div>);

};