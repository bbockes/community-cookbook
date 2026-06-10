import { Cookbook } from '../types/cookbook';
import { curatedBookMeta } from '../config/curatedBookMeta';
import { curatedBookMetaOverrides } from '../config/curatedBookMetaOverrides';
import staticBookCatalog from '../data/staticBookCatalog.json';

const catalog = staticBookCatalog as Record<string, Cookbook>;

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
  if (isbn13 === book.isbn13 && isbn10 === book.isbn10) return book;

  return { ...book, isbn13, isbn10 };
}

export function getStaticBook(id: string): Cookbook | null {
  const book = catalog[id];
  return book ? enrichBook(book) : null;
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
  return Object.values(catalog).map(enrichBook);
}
