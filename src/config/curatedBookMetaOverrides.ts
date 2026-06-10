/**
 * Hand-verified ISBN overrides for curated volumes where Open Library search
 * misses or returns the wrong edition (e.g. Joy of Cooking).
 */
import type { CuratedBookMeta } from './curatedBookMeta';

export const curatedBookMetaOverrides: Record<string, CuratedBookMeta> = {
  '4iTwAAAACAAJ': {
    isbn13: '9781586420550',
    title: 'The French Farmhouse Table',
  },
  fby2Er0seMMC: {
    isbn13: '9784770030498',
    isbn10: '4770030495',
    title: 'Japanese Cooking: A Simple Art',
  },
  '4wpwDwAAQBAJ': {
    isbn13: '9780847831470',
    isbn10: '0847831477',
    title: 'La Cucina: The Regional Cooking of Italy',
  },
  EmM_HQAACAAJ: {
    isbn13: '9780517503874',
    isbn10: '0517503875',
    title: 'The Talisman Italian Cookbook',
  },
  XPALsJ3Rp1YC: {
    isbn13: '9780307587725',
    isbn10: '030758772X',
    title: 'The Essential Cuisines of Mexico',
  },
  RPqPDwAAQBAJ: {
    isbn13: '9781524763923',
    title: 'Dinner in Mexico',
  },
  eTvtDwAAQBAJ: {
    isbn13: '9781581571783',
    title: "The King Arthur Baking Company's All-Purpose Baker's Companion",
  },
  '2WOXPAAACAAJ': {
    isbn13: '9780848732653',
    isbn10: '0848732650',
    title: "South's Best Ribs",
  },
  fATqBAAAQBAJ: {
    isbn13: '9781612433639',
    isbn10: '1612433639',
    title: 'The Kamado Smoker and Grill Cookbook',
  },
  Jp4eEAAAQBAJ: {
    isbn13: '9781524760120',
    title: 'The New York Times Cooking No-Recipe Recipes',
  },
  kpfSAAAACAAJ: {
    isbn13: '9780743246262',
    isbn10: '0743246262',
    title: 'Joy of Cooking',
  },
};
