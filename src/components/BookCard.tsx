import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Cookbook, formatAuthors } from '../types/cookbook';
import { CookbookCover } from './CookbookCover';

interface BookCardProps {
  book: Cookbook;
  onClick?: () => void;
}

const coverShadow =
  'drop-shadow-[-4px_6px_8px_rgba(0,0,0,0.12)] drop-shadow-[0_14px_24px_rgba(0,0,0,0.18)]';

export const BookCard = ({ book, onClick }: BookCardProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const rating = book.rating ?? 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
    >
      <div className="relative flex justify-center bg-[#f6f6f6] py-3 px-2">
        {book.bestseller && (
          <div className="absolute top-3 left-3 z-10 bg-amber-600 text-white text-xs px-2 py-1 rounded">
            Bestseller
          </div>
        )}

        <div className="relative h-[300px] w-[300px] shrink-0">
          <CookbookCover
            book={book}
            className={`h-full w-full object-contain object-center ${coverShadow}`}
            imgClassName={`h-full w-full object-contain object-center ${coverShadow}`}
          />
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-1">
          {book.title}
        </h3>
        <p className="text-gray-600 mb-2 line-clamp-1">
          by {formatAuthors(book.authors)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {book.rating != null ? (
              <>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-base ${i < Math.round(rating) ? 'text-amber-400' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-500 ml-1">
                  ({Math.round(rating)})
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No ratings yet</span>
            )}
          </div>
          <button
            type="button"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1 shrink-0 transition-colors ${
              isFavorited
                ? 'text-red-500'
                : 'text-gray-500 hover:text-amber-600'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited((prev) => !prev);
            }}
          >
            <Heart
              size={24}
              fill={isFavorited ? '#ef4444' : 'none'}
              stroke={isFavorited ? '#ef4444' : '#6b7280'}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export type { Cookbook };
