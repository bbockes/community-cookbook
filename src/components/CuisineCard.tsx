import React from 'react';
import { cuisineImages } from '../utils/data';
interface CuisineCardProps {
  cuisine: string;
  active: boolean;
  onClick: () => void;
}
export const CuisineCard: React.FC<CuisineCardProps> = ({
  cuisine,
  active,
  onClick
}) => {
  const backgroundImage = cuisineImages[cuisine as keyof typeof cuisineImages] || cuisineImages.All;
  return <button onClick={onClick} className={`relative overflow-hidden rounded-md w-full aspect-[3/2] transition-all duration-300 ${active ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 shadow-md' : 'hover:scale-105 hover:shadow-md'}`}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${backgroundImage})`
    }} />
      {/* Overlay */}
      <div className={`absolute inset-0 ${active ? 'bg-navy/70' : 'bg-black/60 hover:bg-navy/60'} transition-colors duration-300`} />
      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-medium text-lg">{cuisine}</span>
      </div>
    </button>;
};