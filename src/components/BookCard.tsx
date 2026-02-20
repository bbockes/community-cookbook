import React from 'react';
import { ShoppingCartIcon, HeartIcon } from 'lucide-react';
export type Cookbook = {
  id: number;
  title: string;
  author: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  bestseller?: boolean;
};
interface BookCardProps {
  book: Cookbook;
  onClick?: () => void;
}
export const BookCard = ({ book, onClick }: BookCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer">

      <div className="relative h-64">
        <img
          src={book.image}
          alt={book.title}
          className="w-full h-full object-cover" />

        {book.bestseller &&
        <div className="absolute top-2 left-2 bg-amber-600 text-white text-xs px-2 py-1 rounded">
            Bestseller
          </div>
        }
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-gray-600 mb-2">by {book.author}</p>
        <div className="flex items-center mb-3">
          {[...Array(5)].map((_, i) =>
          <span
            key={i}
            className={`text-sm ${i < book.rating ? 'text-amber-400' : 'text-gray-300'}`}>

              ★
            </span>
          )}
          <span className="text-xs text-gray-500 ml-1">
            ({book.rating.toFixed(1)})
          </span>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex space-x-2">
            <button
              className="p-2 rounded-full text-gray-500 hover:text-amber-600 hover:bg-amber-50"
              onClick={(e) => {
                e.stopPropagation();
                // Add wishlist logic here
              }}>

              <HeartIcon size={18} />
            </button>
            <button
              className="p-2 bg-amber-600 rounded-full text-white hover:bg-amber-700"
              onClick={(e) => {
                e.stopPropagation();
                // Add cart logic here
              }}>

              <ShoppingCartIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>);

};