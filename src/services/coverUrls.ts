import { getResolvedCover } from './coverCache';

type CoverBook = {
  id: string;
  image?: string;
  isbn13?: string;
  isbn10?: string;
};

export function isGoogleCoverUrl(url: string): boolean {
  return url.includes('books.google') || url.includes('googleusercontent');
}

export function isUploadedCoverUrl(url: string): boolean {
  return url.startsWith('/api/uploads/covers/');
}

export function googleCoverUrl(volumeId: string): string {
  const url = new URL('https://books.google.com/books/content');
  url.searchParams.set('id', volumeId);
  url.searchParams.set('printsec', 'frontcover');
  url.searchParams.set('img', '1');
  url.searchParams.set('zoom', '0');
  url.searchParams.set('edge', 'none');
  url.searchParams.set('source', 'gbs_api');
  return url.toString();
}

function openLibraryCover(isbn: string, size: 'L' | 'M' = 'L'): string {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;
}

function abeBooksCover(isbn: string): string {
  return `https://pictures.abebooks.com/isbn/${isbn}-us-300.jpg`;
}

function addIsbnSources(urls: string[], isbn: string): void {
  urls.push(openLibraryCover(isbn, 'L'));
  urls.push(abeBooksCover(isbn));
  urls.push(openLibraryCover(isbn, 'M'));
}

/** Uploaded cover first, then cache, ISBN fallbacks, then Google. */
export function buildCoverSources(book: CoverBook): string[] {
  const urls: string[] = [];

  if (book.image && isUploadedCoverUrl(book.image)) {
    urls.push(book.image);
  }

  const cached = getResolvedCover(book.id);
  if (cached) urls.push(cached);

  if (book.isbn13) addIsbnSources(urls, book.isbn13);
  if (book.isbn10 && book.isbn10 !== book.isbn13) {
    addIsbnSources(urls, book.isbn10);
  }

  if (book.image && !isUploadedCoverUrl(book.image)) urls.push(book.image);
  urls.push(googleCoverUrl(book.id));

  return [...new Set(urls)];
}
