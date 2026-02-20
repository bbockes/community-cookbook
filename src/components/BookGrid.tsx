import React from 'react';
import { BookCard, Cookbook } from './BookCard';
interface BookGridProps {
  books: Cookbook[];
  onBookClick?: (book: Cookbook) => void;
}
export const BookGrid = ({ books, onBookClick }: BookGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) =>
      <BookCard
        key={book.id}
        book={book}
        onClick={() => onBookClick?.(book)} />

      )}
    </div>);

};