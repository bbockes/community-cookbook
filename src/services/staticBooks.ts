import { Cookbook } from '../types/cookbook';
import { curatedBookMeta } from '../config/curatedBookMeta';
import { curatedBookMetaOverrides } from '../config/curatedBookMetaOverrides';
import { volumesWithoutCovers } from '../config/volumesWithoutCovers';
import { getResolvedCover } from './coverCache';
import { googleCoverUrl } from './coverUrls';
import staticBookCatalog from '../data/staticBookCatalog.json';

const catalog = staticBookCatalog as Record<string, Cookbook>;

function isDisplayableBook(book: Cookbook): boolean {
  return !volumesWithoutCovers.has(book.id);
}

function resolveIsbns(
  volumeId: string,
  isbn13?: string,
  isbn10?: string
): { isbn13?: string; isbn10?: string } {
  const override = curatedBookMetaOverrides[volumeId];
  const meta = curatedBookMeta[volumeId];

  return {
    isbn13: override?.isbn13 ?? isbn13 ?? meta?.isbn13,
    isbn10: override?.isbn10 ?? isbn10 ?? meta?.isbn10,
  };
}

function enrichBook(book: Cookbook): Cookbook {
  const { isbn13, isbn10 } = resolveIsbns(book.id, book.isbn13, book.isbn10);
  const cachedCover = getResolvedCover(book.id);
  const image = cachedCover ?? googleCoverUrl(book.id);

  return {
    ...book,
    isbn13,
    isbn10,
    image,
  };
}

export function getStaticBook(id: string): Cookbook | null {
  if (volumesWithoutCovers.has(id)) return null;
  const book = catalog[id];
  if (!book) return null;
  const enriched = enrichBook(book);
  return isDisplayableBook(enriched) ? enriched : null;
}

export function getStaticBooks(ids: readonly string[]): Cookbook[] {
  const seen = new Set<string>();
  const books: Cookbook[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;
    const book = getStaticBook(id);
    if (book) {
      seen.add(id);
      books.push(book);
    }
  }

  return books;
}

export function hasStaticCatalog(): boolean {
  return Object.keys(catalog).length > 0;
}

export function getAllStaticBooks(): Cookbook[] {
  return Object.values(catalog).map(enrichBook).filter(isDisplayableBook);
}
