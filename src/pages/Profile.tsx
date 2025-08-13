import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DbCookbook, DbReview, DbRecipeCard } from '../utils/types';
import { CookbookCard } from '../components/CookbookCard';
import { BookOpen, Heart, Bookmark, Star, Calendar, User } from 'lucide-react';

interface ReviewWithCookbook extends DbReview {
  cookbooks: DbCookbook;
}

interface RecipeCardWithCookbook extends DbRecipeCard {
  cookbooks: DbCookbook;
}

interface ProfileProps {
  onCookbookSelect: (cookbook: DbCookbook) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onCookbookSelect }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'reviews' | 'recipe-cards' | 'wishlist' | 'favorites'>('reviews');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userReviews, setUserReviews] = useState<ReviewWithCookbook[]>([]);
  const [userRecipeCards, setUserRecipeCards] = useState<RecipeCardWithCookbook[]>([]);
  const [wishlistCookbooks, setWishlistCookbooks] = useState<DbCookbook[]>([]);
  const [favoriteCookbooks, setFavoriteCookbooks] = useState<DbCookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch user reviews with cookbook info
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          cookbooks (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setUserReviews(reviews || []);

      // Fetch user recipe cards with cookbook info
      const { data: recipeCards, error: recipeCardsError } = await supabase
        .from('recipe_cards')
        .select(`
          *,
          cookbooks (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (recipeCardsError) throw recipeCardsError;
      setUserRecipeCards(recipeCards || []);

      // Fetch wishlist cookbooks
      if (profile.wishlist && profile.wishlist.length > 0) {
        const { data: wishlist, error: wishlistError } = await supabase
          .from('cookbooks')
          .select('*')
          .in('id', profile.wishlist);

        if (wishlistError) throw wishlistError;
        setWishlistCookbooks(wishlist || []);
      }

      // Fetch favorite cookbooks
      if (profile.favorite_cookbooks && profile.favorite_cookbooks.length > 0) {
        const { data: favorites, error: favoritesError } = await supabase
          .from('cookbooks')
          .select('*')
          .in('id', profile.favorite_cookbooks);

        if (favoritesError) throw favoritesError;
        setFavoriteCookbooks(favorites || []);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-charcoal/60">Please sign in to view your profile</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        {/* Profile Header Placeholder */}
        <div className="bg-cream border-b border-gray-200 mb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </div>
            
            {/* Stats Placeholder */}
            <div className="mt-6 flex gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-8 mx-auto mb-1 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Profile Header */}
      <div className="bg-cream border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-navy rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy mb-2">
                {userProfile?.username}
              </h1>
              <p className="text-charcoal/70 mb-1">{userProfile?.email}</p>
              <div className="flex items-center gap-1 text-sm text-charcoal/60">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(userProfile?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mt-6 flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">{userReviews.length}</div>
              <div className="text-sm text-charcoal/60">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">{userRecipeCards.length}</div>
              <div className="text-sm text-charcoal/60">Recipe Cards</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">{wishlistCookbooks.length}</div>
              <div className="text-sm text-charcoal/60">Wishlist</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-navy">{favoriteCookbooks.length}</div>
              <div className="text-sm text-charcoal/60">Favorites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="container mx-auto px-4 -mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-navy text-navy'
                : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
            }`}
          >
            <Star className="w-4 h-4" />
            Reviews
          </button>
          <button
            onClick={() => setActiveTab('recipe-cards')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'recipe-cards'
                ? 'border-navy text-navy'
                : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Recipe Cards
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'wishlist'
                ? 'border-navy text-navy'
                : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Wishlist
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'border-navy text-navy'
                : 'border-transparent text-charcoal/60 hover:text-charcoal hover:border-gray-300'
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorites
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4">
        {activeTab === 'reviews' && (
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-6">Your Reviews</h2>
            {userReviews.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {userReviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-md p-6">
                    <div className="flex gap-4">
                      <img 
                        src={review.cookbooks.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'} 
                        alt={review.cookbooks.title}
                        className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onCookbookSelect(review.cookbooks)}
                      />
                      <div className="flex-1">
                        <h3 
                          className="font-semibold text-charcoal mb-1 cursor-pointer hover:text-navy transition-colors"
                          onClick={() => onCookbookSelect(review.cookbooks)}
                        >
                          {review.cookbooks.title}
                        </h3>
                        <p className="text-sm text-charcoal/70 mb-2">by {review.cookbooks.author}</p>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-charcoal/60">
                            {review.rating}/5 stars
                          </span>
                          <span className="text-xs text-charcoal/50">
                            • {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {review.text && (
                          <p className="text-charcoal/80 text-sm leading-relaxed">
                            {review.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal/60">
                You haven't written any reviews yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'recipe-cards' && (
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-6">Your Recipe Cards</h2>
            {userRecipeCards.length > 0 ? (
              <div className="space-y-4 max-w-3xl">
                {userRecipeCards.map((card) => (
                  <div key={card.id} className="bg-white border border-gray-200 rounded-md p-6">
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-2">
                        <img 
                          src={card.cookbooks.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'} 
                          alt={card.cookbooks.title}
                          className="w-16 h-16 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => onCookbookSelect(card.cookbooks)}
                        />
                        {card.image_url && (
                          <img 
                            src={card.image_url} 
                            alt={card.recipe_title}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-charcoal mb-1">
                          {card.recipe_title}
                        </h3>
                        <p 
                          className="text-sm text-charcoal/70 mb-2 cursor-pointer hover:text-navy transition-colors"
                          onClick={() => onCookbookSelect(card.cookbooks)}
                        >
                          from {card.cookbooks.title}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          {renderStars(card.rating)}
                          <span className="text-sm text-charcoal/60">
                            {card.rating}/5 stars
                          </span>
                          <span className="text-xs text-charcoal/50">
                            • {new Date(card.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {card.overall_outcome_text && (
                          <p className="text-charcoal/80 text-sm leading-relaxed">
                            <strong>Overall outcome:</strong> {card.overall_outcome_text}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal/60">
                You haven't created any recipe cards yet
              </div>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-6">Your Wishlist</h2>
            {wishlistCookbooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistCookbooks.map(cookbook => (
                  <CookbookCard 
                    key={cookbook.id} 
                    cookbook={cookbook} 
                    onClick={() => onCookbookSelect(cookbook)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal/60">
                Your wishlist is empty
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-2xl font-bold text-charcoal mb-6">Your Favorites</h2>
            {favoriteCookbooks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {favoriteCookbooks.map(cookbook => (
                  <CookbookCard 
                    key={cookbook.id} 
                    cookbook={cookbook} 
                    onClick={() => onCookbookSelect(cookbook)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-charcoal/60">
                You haven't favorited any cookbooks yet
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};