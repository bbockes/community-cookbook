export type Cookbook = {
  id: string;
  title: string;
  authors: string[];
  publisher?: string;
  description?: string;
  pageCount?: number;
  image: string;
  isbn13?: string;
  isbn10?: string;
  category?: string;
  rating?: number;
  ratingsCount?: number;
  /** Community-submitted reviews (shown in UI instead of Google Books ratings). */
  communityReviewCount?: number;
  communityAverageRating?: number;
  bestseller?: boolean;
};

export function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return 'Unknown author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}
