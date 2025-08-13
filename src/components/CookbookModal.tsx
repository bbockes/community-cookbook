import React from 'react';
import { useState, useEffect } from 'react';
import { XIcon, HeartIcon, BookmarkIcon, ShoppingCartIcon } from 'lucide-react';
import { DbCookbook } from '../utils/types';
import { TagPill } from './TagPill';
import { supabase } from '../lib/supabase';

interface ReviewWithProfile {
  id: string;
  user_id: string;
  cookbook_id: string;
  rating: number;
  text: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
  };
}

interface RecipeCardWithProfile {
  id: string;
  user_id: string;
  cookbook_id: string;
  recipe_title: string;
  rating: number;
  text: string;
  image_url: string;
  overall_outcome_text: string;
  would_make_again_text: string;
  what_to_do_differently_text: string;
  created_at: string;
  updated_at: string;
  profiles: {
    username: string;
  };
}

interface CookbookModalProps {
  cookbook: DbCookbook;
  onClose: () => void;
}

export const CookbookModal: React.FC<CookbookModalProps> = ({
  cookbook,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipe-cards'>('reviews');
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [recipeCards, setRecipeCards] = useState<RecipeCardWithProfile[]>([]);
  const [loadingRecipeCards, setLoadingRecipeCards] = useState(true);
  const [recipeCardsError, setRecipeCardsError] = useState<string | null>(null);
  
  const tags = [cookbook.cuisine, cookbook.cooking_method].filter(Boolean);
  const publishedDate = new Date(cookbook.created_at).toLocaleDateString();

  // Fetch reviews when cookbook changes
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      setReviewsError(null);
      
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (
              username
            )
          `)
          .eq('cookbook_id', cookbook.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setReviews(data || []);
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [cookbook.id]);

  // Fetch recipe cards when cookbook changes
  useEffect(() => {
    const fetchRecipeCards = async () => {
      setLoadingRecipeCards(true);
      setRecipeCardsError(null);
      
      try {
        const { data, error } = await supabase
          .from('recipe_cards')
          .select(`
            *,
            profiles (
              username
            )
          `)
          .eq('cookbook_id', cookbook.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setRecipeCards(data || []);
      } catch (err) {
        setRecipeCardsError(err instanceof Error ? err.message : 'Failed to fetch recipe cards');
      } finally {
        setLoadingRecipeCards(false);
      }
    };

    fetchRecipeCards();
  }, [cookbook.id]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

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
              <h1 className="text-2xl font-bold text-charcoal mb-1">
                {cookbook.title}
              </h1>
              <p className="text-charcoal/70 mb-4">by {cookbook.author}</p>
              <p className="text-charcoal/80 mb-6">{cookbook.description}</p>
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
                      className="flex items-center gap-2 bg-coral text-white px-4 py-2 rounded-sm hover:bg-coral/90 transition-colors"
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
                      ? 'border-navy text-navy'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab('recipe-cards')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'recipe-cards'
                      ? 'border-navy text-navy'
                      : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
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
                    <button className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm">
                      Write Review
                    </button>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                    </div>
                  ) : reviewsError ? (
                    <div className="text-red-600 text-center py-8 bg-red-50 rounded-md p-4">
                      {reviewsError}
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-charcoal text-sm">
                                {review.profiles.username}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {renderStars(review.rating)}
                                <span className="text-sm text-charcoal/60 ml-2">
                                  {review.rating}/5
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-charcoal/50">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.text && (
                            <p className="text-charcoal/80 text-sm leading-relaxed">
                              {review.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-charcoal/60 text-center py-8">
                      No reviews yet. Be the first to review this cookbook!
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'recipe-cards' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recipe Cards</h3>
                    <button className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm">
                      Add Recipe Card
                    </button>
                  </div>
                  
                  {loadingRecipeCards ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                    </div>
                  ) : recipeCardsError ? (
                    <div className="text-red-600 text-center py-8 bg-red-50 rounded-md p-4">
                      {recipeCardsError}
                    </div>
                  ) : recipeCards.length > 0 ? (
                    <div className="space-y-6">
                      {recipeCards.map((card) => (
                        <div key={card.id} className="border border-gray-200 rounded-md p-6 bg-gray-50">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-semibold text-lg text-charcoal mb-1">
                                {card.recipe_title}
                              </h4>
                              <p className="text-sm text-charcoal/60 mb-2">
                                by {card.profiles.username}
                              </p>
                              <div className="flex items-center gap-1">
                                {renderStars(card.rating)}
                                <span className="text-sm text-charcoal/60 ml-2">
                                  {card.rating}/5
                                </span>
                              </div>
                            </div>
                            <span className="text-xs text-charcoal/50">
                              {new Date(card.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {card.image_url && (
                            <div className="mb-4">
                              <img 
                                src={card.image_url} 
                                alt={card.recipe_title}
                                className="w-full max-w-md h-48 object-cover rounded-md"
                              />
                            </div>
                          )}
                          
                          {card.text && (
                            <div className="mb-4">
                              <p className="text-charcoal/80 text-sm leading-relaxed">
                                {card.text}
                              </p>
                            </div>
                          )}
                          
                          <div className="space-y-3">
                            {card.overall_outcome_text && (
                              <div>
                                <h5 className="font-medium text-sm text-charcoal mb-1">
                                  How did it turn out overall?
                                </h5>
                                <p className="text-sm text-charcoal/80 leading-relaxed">
                                  {card.overall_outcome_text}
                                </p>
                              </div>
                            )}
                            
                            {card.would_make_again_text && (
                              <div>
                                <h5 className="font-medium text-sm text-charcoal mb-1">
                                  Would you make it again?
                                </h5>
                                <p className="text-sm text-charcoal/80 leading-relaxed">
                                  {card.would_make_again_text}
                                </p>
                              </div>
                            )}
                            
                            {card.what_to_do_differently_text && (
                              <div>
                                <h5 className="font-medium text-sm text-charcoal mb-1">
                                  What would you do differently next time?
                                </h5>
                                <p className="text-sm text-charcoal/80 leading-relaxed">
                                  {card.what_to_do_differently_text}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-charcoal/60 text-center py-8">
                      No recipe cards yet. Share your experience with specific recipes!
                    </div>
                  )}
                </div>
              )}
              
              {/* Cookbook Info moved to bottom */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-charcoal/60">Published</p>
                    <p>{publishedDate}</p>
                  </div>
                  <div>
                    <p className="text-charcoal/60">Votes</p>
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