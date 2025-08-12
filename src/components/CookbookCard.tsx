import React, { useState } from 'react';
import { HeartIcon } from 'lucide-react';
import { TagPill } from './TagPill';
import { DbCookbook } from '../utils/types';
import { useAuth } from '../hooks/useAuth';

interface CookbookCardProps {
  cookbook: DbCookbook;
  onClick: () => void;
  onFavoriteToggle: (cookbookId: string) => void;
}

export const CookbookCard: React.FC<CookbookCardProps> = ({
  cookbook,
  onClick,
  onFavoriteToggle
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      setIsFavorited(!isFavorited);
      onFavoriteToggle(cookbook.id);
    }
  };

  const tags = [cookbook.cuisine, cookbook.cooking_method].filter(Boolean);

  return <div className="bg-white rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-square">
        {/* Cookbook Image */}
        <img src={cookbook.image_url || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'} alt={cookbook.title} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:grayscale-[30%]" />
        {/* Overlay with info on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-5">
          <h3 className="font-semibold text-lg text-white mb-1">
            {cookbook.title}
          </h3>
          <p className="text-sm text-gray-200">by {cookbook.author}</p>
        </div>
        {/* Heart/Upvote Button with Vote Count */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2.5 py-1">
            {cookbook.favorites}
          </span>
          <button 
            onClick={handleFavoriteClick} 
            disabled={!user}
            className={`bg-white rounded-full p-2 shadow-md transition-all duration-200 ${!user ? 'opacity-50 cursor-not-allowed' : isFavorited ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}
          >
            <HeartIcon size={18} fill={isFavorited ? 'currentColor' : 'none'} className="transition-transform duration-200 group-hover:scale-110" />
          </button>
        </div>
      </div>
    </div>;
};