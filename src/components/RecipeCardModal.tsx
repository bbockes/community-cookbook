import React from 'react';
import { XIcon } from 'lucide-react';

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

interface RecipeCardModalProps {
  recipeCard: RecipeCardWithProfile;
  onClose: () => void;
}

export const RecipeCardModal: React.FC<RecipeCardModalProps> = ({
  recipeCard,
  onClose
}) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-charcoal">Recipe Card</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={20} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex gap-6 mb-6">
            {/* Recipe Image */}
            <div className="w-1/3">
              <img 
                src={recipeCard.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'} 
                alt={recipeCard.recipe_title}
                className="w-full aspect-square object-cover rounded-md"
              />
            </div>
            
            {/* Recipe Details */}
            <div className="w-2/3">
              <h3 className="text-2xl font-bold text-charcoal mb-2">
                {recipeCard.recipe_title}
              </h3>
              <p className="text-charcoal/70 mb-3">
                by {recipeCard.profiles.username}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {renderStars(recipeCard.rating)}
                <span className="text-sm text-charcoal/60 ml-2">
                  {recipeCard.rating}/5 stars
                </span>
              </div>
              <p className="text-xs text-charcoal/50 mb-4">
                Created {new Date(recipeCard.created_at).toLocaleDateString()}
              </p>
              
              {/* General Review Text */}
              {recipeCard.text && (
                <div className="mb-6">
                  <h4 className="font-semibold text-charcoal mb-2">General Notes</h4>
                  <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-md">
                    {recipeCard.text}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Detailed Questions */}
          <div className="space-y-6">
            {recipeCard.overall_outcome_text && (
              <div>
                <h4 className="font-semibold text-charcoal mb-2">
                  How did it turn out overall?
                </h4>
                <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-md">
                  {recipeCard.overall_outcome_text}
                </p>
              </div>
            )}
            
            {recipeCard.would_make_again_text && (
              <div>
                <h4 className="font-semibold text-charcoal mb-2">
                  Would you make it again?
                </h4>
                <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-md">
                  {recipeCard.would_make_again_text}
                </p>
              </div>
            )}
            
            {recipeCard.what_to_do_differently_text && (
              <div>
                <h4 className="font-semibold text-charcoal mb-2">
                  What would you do differently next time?
                </h4>
                <p className="text-charcoal/80 leading-relaxed bg-gray-50 p-4 rounded-md">
                  {recipeCard.what_to_do_differently_text}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};