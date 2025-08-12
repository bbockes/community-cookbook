import React from 'react';
import { useState } from 'react';
import { XIcon, HeartIcon, BookmarkIcon, ShoppingCartIcon } from 'lucide-react';
import { DbCookbook } from '../utils/types';
import { TagPill } from './TagPill';

interface CookbookModalProps {
  cookbook: DbCookbook;
  onClose: () => void;
}

export const CookbookModal: React.FC<CookbookModalProps> = ({
  cookbook,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipe-cards'>('reviews');
  const tags = [cookbook.cuisine, cookbook.cooking_method].filter(Boolean);
  const publishedDate = new Date(cookbook.created_at).toLocaleDateString();

  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md max-w-[80%] w-[80%] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-end items-center p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={20} />
          </button>
        </div>
        <div className="px-6 pt-0 pb-6">
          <div className="flex gap-6">
            <div className="w-1/3">
              <img src={cookbook.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} alt={cookbook.title} className="w-full aspect-[3/4] object-cover rounded-sm" />
            </div>
            <div className="w-2/3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {cookbook.title}
              </h1>
              <p className="text-gray-600 mb-4">by {cookbook.author}</p>
              <p className="text-gray-700 mb-6">{cookbook.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map(tag => <TagPill key={tag} tag={tag} />)}
              </div>
              <div className="flex gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors">
                    <HeartIcon size={18} />
                    <span>Favorite</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors">
                    <BookmarkIcon size={18} />
                    <span>Add to Wishlist</span>
                  </button>
                  {cookbook.affiliate_link && (
                    <a
                      href={cookbook.affiliate_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-sm hover:bg-indigo-700 transition-colors"
                    >
                      <ShoppingCartIcon size={18} />
                      Buy It
                    </a>
                  )}
              </div>
            </div>
          </div>
          <div className="mt-8">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('recipe-cards')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'recipe-cards'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recipe Cards
                </button>
              </nav>
            </div>
            
            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === 'reviews' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">User Reviews</h3>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
                      Write Review
                    </button>
                  </div>
                  <div className="text-gray-500 text-center py-8">
                    No reviews yet. Be the first to review this cookbook!
                  </div>
                </div>
              )}
              
              {activeTab === 'recipe-cards' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recipe Cards</h3>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm">
                      Add Recipe Card
                    </button>
                  </div>
                  <div className="text-gray-500 text-center py-8">
                    No recipe cards yet. Share your experience with specific recipes!
                  </div>
                </div>
              )}
              
              {/* Cookbook Info moved to bottom */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Published</p>
                    <p>{publishedDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Votes</p>
                    <p>{cookbook.favorites}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};