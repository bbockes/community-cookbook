import React, { useState } from 'react';
import { HeartIcon } from 'lucide-react';
import { TagPill } from './TagPill';
import { Cookbook } from '../utils/types';
interface CookbookCardProps {
  cookbook: Cookbook;
  onClick: () => void;
}
export const CookbookCard: React.FC<CookbookCardProps> = ({
  cookbook,
  onClick
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };
  return <div className="bg-white rounded-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group" onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative aspect-square">
        {/* Cookbook Image */}
        <img src={cookbook.imageUrl} alt={cookbook.title} className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:grayscale-[30%]" />
        {/* Overlay with info on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-5">
          <h3 className="font-semibold text-lg text-white mb-1">
            {cookbook.title}
          </h3>
          <p className="text-sm text-gray-200">by {cookbook.author}</p>
        </div>
        {/* Heart/Upvote Button with Vote Count */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <span className="bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2.5 py-1">
            {cookbook.votes}
          </span>
          <button onClick={handleFavoriteClick} className={`bg-white rounded-full p-2 shadow-md transition-all duration-200 ${isFavorited ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500'}`}>
            <HeartIcon size={18} fill={isFavorited ? 'currentColor' : 'none'} className="transition-transform duration-200 group-hover:scale-110" />
          </button>
        </div>
        {/* Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
          {cookbook.tags.slice(0, 2).map(tag => <TagPill key={tag} tag={tag} />)}
          {cookbook.tags.length > 2 && <span className="text-xs bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full font-medium">
              +{cookbook.tags.length - 2}
            </span>}
        </div>
      </div>
    </div>;
};