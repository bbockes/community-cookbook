import React from 'react';
import { useState, useEffect } from 'react';
import { XIcon, HeartIcon, BookmarkIcon, ShoppingCartIcon } from 'lucide-react';
import { DbCookbook } from '../utils/types';
import { TagPill } from './TagPill';
import { RecipeCardModal } from './RecipeCardModal';
import { ImageUpload } from './ImageUpload';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

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
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipe-cards'>('reviews');
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [recipeCards, setRecipeCards] = useState<RecipeCardWithProfile[]>([]);
  const [loadingRecipeCards, setLoadingRecipeCards] = useState(true);
  const [recipeCardsError, setRecipeCardsError] = useState<string | null>(null);
  const [selectedRecipeCard, setSelectedRecipeCard] = useState<RecipeCardWithProfile | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(1);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [userReview, setUserReview] = useState<ReviewWithProfile | null>(null);
  const [showRecipeCardForm, setShowRecipeCardForm] = useState(false);
  const [recipeCardData, setRecipeCardData] = useState({
    recipe_title: '',
    rating: 1,
    image_url: '',
    overall_outcome_text: '',
    would_make_again_text: '',
    what_to_do_differently_text: ''
  });
  const [submittingRecipeCard, setSubmittingRecipeCard] = useState(false);
  const [recipeCardHoverRating, setRecipeCardHoverRating] = useState(0);
  
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
        
        // Check if current user has already reviewed this cookbook
        if (user) {
          const userReview = data?.find(review => review.user_id === user.id);
          setUserHasReviewed(!!userReview);
          setUserReview(userReview || null);
        }
      } catch (err) {
        setReviewsError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [cookbook.id, user]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submittingReview) return;

    setSubmittingReview(true);
    try {
      if (isEditingReview && userReview) {
        // Update existing review
        const { data, error } = await supabase
          .from('reviews')
          .update({
            rating: reviewRating,
            text: reviewText.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', userReview.id)
          .select(`
            *,
            profiles (
              username
            )
          `)
          .single();

        if (error) throw error;
        
        // Update the review in the list
        setReviews(prev => 
          prev.map(review => 
            review.id === userReview.id ? data : review
          )
        );
        setUserReview(data);
      } else {
        // Create new review
        const { data, error } = await supabase
          .from('reviews')
          .insert([
            {
              user_id: user.id,
              cookbook_id: cookbook.id,
              rating: reviewRating,
              text: reviewText.trim(),
            }
          ])
          .select(`
            *,
            profiles (
              username
            )
          `)
          .single();

        if (error) throw error;
        
        // Add new review to the list
        setReviews(prev => [data, ...prev]);
        setUserHasReviewed(true);
        setUserReview(data);
      }
      
      setShowReviewForm(false);
      setIsEditingReview(false);
      setReviewText('');
      setReviewRating(1);
    } catch (err) {
      setReviewsError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewRating(userReview.rating);
      setReviewText(userReview.text || '');
      setIsEditingReview(true);
      setShowReviewForm(true);
    }
  };

  const handleCancelEdit = () => {
    setShowReviewForm(false);
    setIsEditingReview(false);
    setReviewText('');
    setReviewRating(1);
  };

  const handleRecipeCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submittingRecipeCard) return;

    setSubmittingRecipeCard(true);
    try {
      const { data, error } = await supabase
        .from('recipe_cards')
        .insert([
          {
            user_id: user.id,
            cookbook_id: cookbook.id,
            recipe_title: recipeCardData.recipe_title.trim(),
            rating: recipeCardData.rating,
            text: '',
            image_url: recipeCardData.image_url.trim(),
            overall_outcome_text: recipeCardData.overall_outcome_text.trim(),
            would_make_again_text: recipeCardData.would_make_again_text.trim(),
            what_to_do_differently_text: recipeCardData.what_to_do_differently_text.trim(),
          }
        ])
        .select(`
          *,
          profiles (
            username
          )
        `)
        .single();

      if (error) throw error;
      
      // Add new recipe card to the list
      setRecipeCards(prev => [data, ...prev]);
      handleRecipeCardCancel();
    } catch (err) {
      setRecipeCardsError(err instanceof Error ? err.message : 'Failed to submit recipe card');
    } finally {
      setSubmittingRecipeCard(false);
    }
  };

  const handleRecipeCardCancel = () => {
    setShowRecipeCardForm(false);
    setRecipeCardData({
      recipe_title: '',
      rating: 1,
      image_url: '',
      overall_outcome_text: '',
      would_make_again_text: '',
      what_to_do_differently_text: ''
    });
  };

  const renderRecipeCardStars = (rating: number) => {
    const displayRating = recipeCardHoverRating > 0 ? recipeCardHoverRating : rating;
    
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setRecipeCardData(prev => ({ ...prev, rating: i + 1 }))}
        onMouseEnter={() => setRecipeCardHoverRating(i + 1)}
        onMouseLeave={() => setRecipeCardHoverRating(0)}
        className={`text-2xl transition-colors hover:text-yellow-400 ${
          i < displayRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ));
  };

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

  const handleStarClick = (rating: number) => {
    setReviewRating(rating);
  };

  const renderInteractiveStars = (rating: number, onStarClick: (rating: number) => void) => {
    const displayRating = hoverRating > 0 ? hoverRating : rating;
    
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onStarClick(i + 1)}
        onMouseEnter={() => setHoverRating(i + 1)}
        onMouseLeave={() => setHoverRating(0)}
        className={`text-2xl transition-colors hover:text-yellow-400 ${
          i < displayRating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </button>
    ));
  };

  return <div 
    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4"
    onClick={onClose}
  >
      <div 
        className="bg-white rounded-md max-w-[85%] w-[85%] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
                    <div className="flex items-center gap-3">
                      {user && !userHasReviewed && (
                        <button 
                          onClick={() => setShowReviewForm(true)}
                          className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm"
                        >
                          Write Review
                        </button>
                      )}
                      {user && userHasReviewed && (
                        <>
                          <div className="text-sm text-charcoal/60">
                            You've already reviewed this cookbook
                          </div>
                          <button 
                            onClick={handleEditReview}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm"
                          >
                            Edit Review
                          </button>
                        </>
                      )}
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-sm text-charcoal/60 text-right">
                          Sign in to write a review
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Review Form */}
                  {showReviewForm && user && (
                    <div className="bg-gray-50 rounded-md p-6 mb-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-charcoal mb-4">
                        {isEditingReview ? 'Edit Your Review' : 'Write Your Review'}
                      </h4>
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-2">
                            Rating
                          </label>
                          <div className="flex items-center gap-1">
                            {renderInteractiveStars(reviewRating, handleStarClick)}
                            <span className="text-sm text-charcoal/60 ml-2">
                              {reviewRating}/5 stars
                            </span>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="reviewText" className="block text-sm font-medium text-charcoal mb-2">
                            Review (optional)
                          </label>
                          <textarea
                            id="reviewText"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                            placeholder="Share your thoughts about this cookbook..."
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingReview ? 
                              (isEditingReview ? 'Updating...' : 'Submitting...') : 
                              (isEditingReview ? 'Update Review' : 'Submit Review')
                            }
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="bg-gray-200 text-charcoal px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
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
                        <div key={review.id} className="border border-gray-200 rounded-md p-4 bg-gray-50 max-w-2xl">
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
                    {user ? (
                      <button 
                        onClick={() => setShowRecipeCardForm(true)}
                        className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm"
                      >
                        Add Recipe Card
                      </button>
                    ) : (
                      <div className="text-sm text-charcoal/60">
                        Sign in to add a recipe card
                      </div>
                    )}
                  </div>
                  
                  {/* Recipe Card Form */}
                  {showRecipeCardForm && user && (
                    <div className="bg-gray-50 rounded-md p-6 mb-6 border border-gray-200">
                      <h4 className="text-lg font-semibold text-charcoal mb-4">
                        Add Your Recipe Card
                      </h4>
                      <form onSubmit={handleRecipeCardSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="recipeTitle" className="block text-sm font-medium text-charcoal mb-2">
                            Recipe Title *
                          </label>
                          <input
                            type="text"
                            id="recipeTitle"
                            value={recipeCardData.recipe_title}
                            onChange={(e) => setRecipeCardData(prev => ({ ...prev, recipe_title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent"
                            placeholder="What recipe did you make?"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-2">
                            Rating *
                          </label>
                          <div className="flex items-center gap-1">
                            {renderRecipeCardStars(recipeCardData.rating)}
                            <span className="text-sm text-charcoal/60 ml-2">
                              {recipeCardData.rating}/5 stars
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-charcoal mb-2">
                            Recipe Image
                          </label>
                          <ImageUpload
                            value={recipeCardData.image_url}
                            onChange={(url) => setRecipeCardData(prev => ({ ...prev, image_url: url }))}
                            placeholder="Upload a photo of your recipe"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="overallOutcome" className="block text-sm font-medium text-charcoal mb-2">
                            How did it turn out overall? *
                          </label>
                          <textarea
                            id="overallOutcome"
                            value={recipeCardData.overall_outcome_text}
                            onChange={(e) => setRecipeCardData(prev => ({ ...prev, overall_outcome_text: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                            placeholder="Describe the final result..."
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="makeAgain" className="block text-sm font-medium text-charcoal mb-2">
                            Would you make it again? *
                          </label>
                          <textarea
                            id="makeAgain"
                            value={recipeCardData.would_make_again_text}
                            onChange={(e) => setRecipeCardData(prev => ({ ...prev, would_make_again_text: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                            placeholder="Would you make this again? Why or why not?"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="doDifferently" className="block text-sm font-medium text-charcoal mb-2">
                            What would you do differently next time? *
                          </label>
                          <textarea
                            id="doDifferently"
                            value={recipeCardData.what_to_do_differently_text}
                            onChange={(e) => setRecipeCardData(prev => ({ ...prev, what_to_do_differently_text: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent resize-none"
                            placeholder="Any changes or improvements for next time?"
                            required
                          />
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submittingRecipeCard || !recipeCardData.recipe_title.trim() || !recipeCardData.overall_outcome_text.trim() || !recipeCardData.would_make_again_text.trim() || !recipeCardData.what_to_do_differently_text.trim()}
                            className="bg-navy text-white px-4 py-2 rounded-md hover:bg-navy/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {submittingRecipeCard ? 'Submitting...' : 'Submit Recipe Card'}
                          </button>
                          <button
                            type="button"
                            onClick={handleRecipeCardCancel}
                            className="bg-gray-200 text-charcoal px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {loadingRecipeCards ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                    </div>
                  ) : recipeCardsError ? (
                    <div className="text-red-600 text-center py-8 bg-red-50 rounded-md p-4">
                      {recipeCardsError}
                    </div>
                  ) : recipeCards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {recipeCards.map((card) => (
                        <div 
                          key={card.id} 
                          onClick={() => setSelectedRecipeCard(card)}
                          className="bg-white rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group"
                        >
                          <div className="relative aspect-square">
                            {/* Recipe Image */}
                            <img 
                              src={card.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                              alt={card.recipe_title}
                              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                            />
                            {/* Overlay with info on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4">
                              <h4 className="font-semibold text-lg text-white mb-1 text-center">
                                {card.recipe_title}
                              </h4>
                              <p className="text-sm text-gray-200 text-center mb-2">
                                by {card.profiles.username}
                              </p>
                              <div className="flex items-center justify-center gap-1">
                                {renderStars(card.rating)}
                                <span className="text-sm text-white ml-2">
                                  {card.rating}/5
                                </span>
                              </div>
                            </div>
                            {/* Date stamp */}
                            <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2 py-1">
                              {new Date(card.created_at).toLocaleDateString()}
                            </div>
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
      
      {/* Recipe Card Detail Modal */}
      {selectedRecipeCard && (
        <RecipeCardModal 
          recipeCard={selectedRecipeCard} 
          onClose={() => setSelectedRecipeCard(null)} 
        />
      )}
    </div>;
};