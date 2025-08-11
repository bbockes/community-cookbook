import React from 'react';
import { cookingMethodImages } from '../utils/data';
interface MethodCardProps {
  method: string;
  active: boolean;
  onClick: () => void;
}
export const MethodCard: React.FC<MethodCardProps> = ({
  method,
  active,
  onClick
}) => {
  const backgroundImage = cookingMethodImages[method as keyof typeof cookingMethodImages] || cookingMethodImages.All;
  return <button onClick={onClick} className={`relative overflow-hidden rounded-md w-full aspect-[3/2] transition-all duration-300 ${active ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 shadow-md' : 'hover:scale-105 hover:shadow-md'}`}>
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${backgroundImage})`
    }} />
      {/* Overlay */}
      <div className={`absolute inset-0 ${active ? 'bg-indigo-700/70' : 'bg-black/60 hover:bg-indigo-800/60'} transition-colors duration-300`} />
      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-medium text-lg text-center px-2">
          {method}
        </span>
      </div>
    </button>;
};