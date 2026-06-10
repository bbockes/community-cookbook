import { Cookbook } from '../types/cookbook';
import { BookCollectionConfig } from '../config/bookCollections';
import { curatedBookMeta } from '../config/curatedBookMeta';
import { curatedBookMetaOverrides } from '../config/curatedBookMetaOverrides';
import {
  getAllStaticBooks,
  getStaticBook,
  getStaticBooks,
  hasStaticCatalog,
} from './staticBooks';

type GoogleBooksVolume = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    publisher?: string;
    description?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: Array<{
      type?: string;
      identifier?: string;
    }>;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
      extraLarge?: string;
    };
  };
};

type GoogleBooksResponse = {
  items?: GoogleBooksVolume[];
};

/** GCP project used when no API key is sent (shared anonymous quota). */
const SHARED_QUOTA_PROJECT = '624717413613';

export class GoogleBooksError extends Error {
  status: number;
  /** True when the request hit Google's shared anonymous quota (no API key). */
  usesSharedQuota: boolean;

  constructor(status: number, message: string, usesSharedQuota = false) {
    super(message);
    this.status = status;
    this.usesSharedQuota = usesSharedQuota;
    this.name = 'GoogleBooksError';
  }
}

const CACHE_PREFIX = 'community-cookbook:books:v6:';
const CACHE_TTL_MS = 60 * 60 * 1000;
const USE_LIVE_API = import.meta.env.VITE_USE_GOOGLE_BOOKS_API === 'true';

function useDevProxy(): boolean {
  return import.meta.env.DEV;
}

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
}

function buildUrl(path: string, params: Record<string, string>): string {
  const base = useDevProxy() ?
  '/api/google-books' :
  'https://www.googleapis.com/books/v1/volumes';

  const url = useDevProxy() ?
  new URL(`${base}${path}`, window.location.origin) :
  new URL(`${base}${path}`);

  Object.entries(params).forEach(([key, value]) =>
  url.searchParams.set(key, value)
  );

  if (!useDevProxy()) {
    const apiKey = getApiKey();
    if (apiKey) url.searchParams.set('key', apiKey);
  }

  return useDevProxy() ? `${url.pathname}${url.search}` : url.toString();
}

function secureImageUrl(url: string): string {
  return url.replace(/^http:\/\//i, 'https://');
}

type ImageLinks = NonNullable<GoogleBooksVolume['volumeInfo']['imageLinks']>;

/** Prefer the largest cover URL Google provides, then upgrade to full size. */
function getCoverImageUrl(
  imageLinks: ImageLinks | undefined,
  volumeId: string
): string | undefined {
  const best =
  imageLinks?.extraLarge ??
  imageLinks?.large ??
  imageLinks?.medium ??
  imageLinks?.small ??
  imageLinks?.thumbnail ??
  imageLinks?.smallThumbnail;

  if (best) {
    const hasHighResMetadata = !!(
      imageLinks?.small ||
      imageLinks?.medium ||
      imageLinks?.large ||
      imageLinks?.extraLarge
    );
    const url = secureImageUrl(best);
    // zoom=0 on thumbnail-only volumes often returns a gray "image not available" PNG.
    return hasHighResMetadata ? upgradeCoverUrl(url) : url;
  }

  return buildHighResCoverUrl(volumeId);
}

/** zoom=0 requests the largest available cover; edge=none drops the curled-page effect. */
function upgradeCoverUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('zoom', '0');
    parsed.searchParams.set('edge', 'none');
    return parsed.toString();
  } catch {
    return url.
      replace(/([?&])zoom=\d+/i, '$1zoom=0').
      replace(/([?&])edge=curl/i, '$1edge=none');
  }
}

function buildHighResCoverUrl(volumeId: string): string {
  const url = new URL('https://books.google.com/books/content');
  url.searchParams.set('id', volumeId);
  url.searchParams.set('printsec', 'frontcover');
  url.searchParams.set('img', '1');
  url.searchParams.set('zoom', '0');
  url.searchParams.set('source', 'gbs_api');
  return url.toString();
}

function extractIsbns(
  identifiers: GoogleBooksVolume['volumeInfo']['industryIdentifiers']
) {
  let isbn13: string | undefined;
  let isbn10: string | undefined;

  for (const id of identifiers ?? []) {
    if (id.type === 'ISBN_13' && id.identifier) isbn13 = id.identifier;
    if (id.type === 'ISBN_10' && id.identifier) isbn10 = id.identifier;
  }

  return { isbn13, isbn10 };
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
  if (isbn13 === book.isbn13 && isbn10 === book.isbn10) return book;

  return { ...book, isbn13, isbn10 };
}

function mapVolumeToCookbook(volume: GoogleBooksVolume): Cookbook | null {
  const info = volume.volumeInfo;
  if (!info.title?.trim()) return null;

  const apiIsbns = extractIsbns(info.industryIdentifiers);
  const { isbn13, isbn10 } = resolveIsbns(
    volume.id,
    apiIsbns.isbn13,
    apiIsbns.isbn10
  );
  const image = getCoverImageUrl(info.imageLinks, volume.id) ?? buildHighResCoverUrl(volume.id);

  const rating = info.averageRating;
  const ratingsCount = info.ratingsCount ?? 0;

  return {
    id: volume.id,
    title: info.title,
    authors: info.authors?.length ? info.authors : ['Unknown author'],
    publisher: info.publisher,
    description: info.description,
    pageCount: info.pageCount,
    image,
    isbn13,
    isbn10,
    category: info.categories?.[0],
    rating,
    ratingsCount,
    bestseller: ratingsCount >= 50 && (rating ?? 0) >= 4.5,
  };
}

async function fetchGoogleBooks(url: string): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok) {
    let message = `Google Books API error: ${response.status}`;
    let usesSharedQuota = false;

    if (response.status === 429) {
      try {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        const apiMessage = body.error?.message ?? '';
        if (apiMessage) message = apiMessage;
        usesSharedQuota = apiMessage.includes(SHARED_QUOTA_PROJECT);
      } catch {
        // ignore JSON parse errors
      }
    }

    throw new GoogleBooksError(response.status, message, usesSharedQuota);
  }
  return response;
}

function readCache(cacheKey: string): Cookbook[] | null {
  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const { expiresAt, books } = JSON.parse(raw) as {
      expiresAt: number;
      books: Cookbook[];
    };
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(`${CACHE_PREFIX}${cacheKey}`);
      return null;
    }
    return books.map(enrichBook);
  } catch {
    return null;
  }
}

function writeCache(cacheKey: string, books: Cookbook[]): void {
  try {
    sessionStorage.setItem(
      `${CACHE_PREFIX}${cacheKey}`,
      JSON.stringify({
        expiresAt: Date.now() + CACHE_TTL_MS,
        books,
      })
    );
  } catch {
    // Ignore quota errors
  }
}

function searchStaticCatalog(
  query: string,
  maxResults = 40
): Cookbook[] {
  const normalizedQuery = query.
    toLowerCase().
    replace(/inauthor:"([^"]+)"/g, '$1').
    replace(/intitle:"([^"]+)"/g, '$1');

  const terms = normalizedQuery.
    split(/\s+/).
    filter(
      (term) =>
        term.length > 2 &&
        !['cookbook', 'inauthor', 'intitle', 'subject', 'or', 'and'].includes(
          term
        )
    );

  if (terms.length === 0) {
    return getAllStaticBooks().slice(0, maxResults);
  }

  return getAllStaticBooks().
    filter((book) => {
      const haystack =
        `${book.title} ${book.authors.join(' ')} ${book.category ?? ''}`.
          toLowerCase();
      return terms.every((term) => haystack.includes(term));
    }).
    slice(0, maxResults);
}

function resolveStaticCollection(config: BookCollectionConfig): Cookbook[] {
  if (config.volumeIds?.length) {
    return getStaticBooks(config.volumeIds);
  }

  if (config.query && hasStaticCatalog()) {
    return searchStaticCatalog(config.query, config.maxResults ?? 40);
  }

  return [];
}

function applyCollectionFilters(
  books: Cookbook[],
  config: BookCollectionConfig
): Cookbook[] {
  let result = books.filter((book) => book.title.trim().length > 0);

  if (config.bestsellerOnly) {
    result = result.filter((book) => book.bestseller);
  }

  return result.map(enrichBook);
}

function dedupeBooks(books: Cookbook[]): Cookbook[] {
  const seen = new Set<string>();
  return books.filter((book) => {
    if (seen.has(book.id)) return false;
    seen.add(book.id);
    return true;
  });
}

async function searchByQuery(
  query: string,
  maxResults: number,
  orderBy: 'relevance' | 'newest'
): Promise<Cookbook[]> {
  const url = buildUrl('', {
    q: query,
    printType: 'books',
    maxResults: String(Math.min(maxResults, 40)),
    orderBy,
  });

  const response = await fetchGoogleBooks(url);
  const data: GoogleBooksResponse = await response.json();
  return (data.items ?? []).
    map(mapVolumeToCookbook).
    filter((book): book is Cookbook => book !== null);
}

export async function fetchCookbookById(id: string): Promise<Cookbook | null> {
  const staticBook = getStaticBook(id);
  if (staticBook) return staticBook;

  if (!USE_LIVE_API) return null;

  const url = buildUrl(`/${id}`, {});
  const response = await fetchGoogleBooks(url);
  const data: GoogleBooksVolume = await response.json();
  const book = mapVolumeToCookbook(data);
  return book ? enrichBook(book) : null;
}

async function fetchByVolumeIds(ids: string[]): Promise<Cookbook[]> {
  const batchSize = 10;
  const results: Cookbook[] = [];

  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((id) => fetchCookbookById(id))
    );
    results.push(
      ...batchResults.filter((book): book is Cookbook => book !== null)
    );
  }

  return results;
}

export async function fetchBookCollection(
  config: BookCollectionConfig,
  cacheKey: string
): Promise<Cookbook[]> {
  const staticBooks = resolveStaticCollection(config);
  if (staticBooks.length > 0) {
    return applyCollectionFilters(staticBooks, config);
  }

  const cached = readCache(cacheKey);
  if (cached) return cached;

  if (!USE_LIVE_API) {
    return [];
  }

  if (!config.query && !config.volumeIds?.length) {
    throw new Error('Book collection must have a query or volumeIds');
  }

  const maxResults = config.maxResults ?? 40;
  const orderBy = config.orderBy ?? 'relevance';

  const [pinnedBooks, searchResults] = await Promise.all([
    config.volumeIds?.length ?
      fetchByVolumeIds(config.volumeIds) :
      Promise.resolve([]),
    config.query ?
      searchByQuery(config.query, maxResults, orderBy) :
      Promise.resolve([]),
  ]);

  let books = dedupeBooks([...pinnedBooks, ...searchResults]).filter(
    (book) => book.title.trim().length > 0
  );

  if (config.bestsellerOnly) {
    books = books.filter((book) => book.bestseller);
  }

  books = books.map(enrichBook);
  if (books.length > 0) writeCache(cacheKey, books);
  return books;
}

/** @deprecated Use fetchBookCollection via bookCollections config */
export async function searchCookbooks(maxResults = 40): Promise<Cookbook[]> {
  return fetchBookCollection(
    {
      query: 'subject:cooking OR subject:cookery OR cookbook',
      maxResults,
    },
    'legacy:all'
  );
}
