const SHARED_QUOTA_PROJECT = '624717413613';

export class GoogleBooksError extends Error {
  constructor(status, message, usesSharedQuota = false) {
    super(message);
    this.status = status;
    this.usesSharedQuota = usesSharedQuota;
    this.name = 'GoogleBooksError';
  }
}

function getApiKey() {
  return process.env.GOOGLE_BOOKS_API_KEY || process.env.VITE_GOOGLE_BOOKS_API_KEY;
}

function secureImageUrl(url) {
  return url.replace(/^http:\/\//i, 'https://');
}

function upgradeCoverUrl(url) {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('zoom', '0');
    parsed.searchParams.set('edge', 'none');
    return parsed.toString();
  } catch {
    return url
      .replace(/([?&])zoom=\d+/i, '$1zoom=0')
      .replace(/([?&])edge=curl/i, '$1edge=none');
  }
}

function buildHighResCoverUrl(volumeId) {
  const url = new URL('https://books.google.com/books/content');
  url.searchParams.set('id', volumeId);
  url.searchParams.set('printsec', 'frontcover');
  url.searchParams.set('img', '1');
  url.searchParams.set('zoom', '0');
  url.searchParams.set('source', 'gbs_api');
  return url.toString();
}

function getCoverImageUrl(imageLinks, volumeId) {
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
    return hasHighResMetadata ? upgradeCoverUrl(url) : url;
  }

  return buildHighResCoverUrl(volumeId);
}

function extractIsbns(identifiers) {
  let isbn13;
  let isbn10;
  for (const id of identifiers ?? []) {
    if (id.type === 'ISBN_13' && id.identifier) isbn13 = id.identifier;
    if (id.type === 'ISBN_10' && id.identifier) isbn10 = id.identifier;
  }
  return { isbn13, isbn10 };
}

export function mapVolumeToCookbook(volume) {
  const info = volume.volumeInfo ?? {};
  if (!info.title?.trim()) return null;

  const { isbn13, isbn10 } = extractIsbns(info.industryIdentifiers);
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
    categories: info.categories,
    rating,
    ratingsCount,
    bestseller: ratingsCount >= 50 && (rating ?? 0) >= 4.5,
    googleRaw: JSON.stringify(volume),
  };
}

async function fetchGoogleBooks(url) {
  const response = await fetch(url);
  if (!response.ok) {
    let message = `Google Books API error: ${response.status}`;
    let usesSharedQuota = false;

    if (response.status === 429) {
      try {
        const body = await response.json();
        const apiMessage = body.error?.message ?? '';
        if (apiMessage) message = apiMessage;
        usesSharedQuota = apiMessage.includes(SHARED_QUOTA_PROJECT);
      } catch {
        // ignore
      }
    }

    throw new GoogleBooksError(response.status, message, usesSharedQuota);
  }
  return response;
}

function buildUrl(path, params) {
  const url = new URL(`https://www.googleapis.com/books/v1/volumes${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== '') url.searchParams.set(key, value);
  });
  const apiKey = getApiKey();
  if (apiKey) url.searchParams.set('key', apiKey);
  return url.toString();
}

export async function fetchVolumeById(volumeId) {
  const url = buildUrl(`/${volumeId}`, {});
  const response = await fetchGoogleBooks(url);
  const data = await response.json();
  return mapVolumeToCookbook(data);
}

export async function searchVolumes(query, maxResults = 8) {
  const url = buildUrl('', {
    q: query,
    printType: 'books',
    maxResults: String(Math.min(maxResults, 40)),
  });
  const response = await fetchGoogleBooks(url);
  const data = await response.json();
  return (data.items ?? [])
    .map(mapVolumeToCookbook)
    .filter((book) => book !== null);
}

function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function buildLookupQueries({ title, author, isbn13, isbn10 }) {
  const queries = [];

  if (isbn13) queries.push(`isbn:${isbn13}`);
  if (isbn10) queries.push(`isbn:${isbn10}`);

  if (title && author) {
    const t = normalize(title);
    const a = normalize(author.split(' ')[0]);
    queries.push(`intitle:"${t}" inauthor:"${a}"`);
    queries.push(`${t} ${author} cookbook`);
  }

  if (title) {
    queries.push(`intitle:"${normalize(title)}"`);
    queries.push(`${normalize(title)} cookbook`);
  }

  if (author) {
    queries.push(`inauthor:"${normalize(author)}" cookbook`);
  }

  return [...new Set(queries)];
}

function pickBestMatch(items, title) {
  const normalizedTitle = normalize(title ?? '').toLowerCase();
  const scored = items.map((item) => {
    const itemTitle = normalize(item.title ?? '').toLowerCase();
    let score = 0;
    if (item.image) score += 10;
    if (
      normalizedTitle &&
      (itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle))
    ) {
      score += 20;
    }
    if (item.title?.toLowerCase().includes('cookbook')) score += 2;
    if (item.ratingsCount) score += Math.min(item.ratingsCount / 10, 5);
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item ?? null;
}

export async function lookupCookbook({ title, author, isbn13, isbn10 }) {
  if (!title && !author && !isbn13 && !isbn10) {
    throw new Error('Provide at least one of title, author, or ISBN');
  }

  const queries = buildLookupQueries({ title, author, isbn13, isbn10 });

  for (const q of queries) {
    const results = await searchVolumes(q, 8);
    if (results.length === 0) continue;

    const best = title ? pickBestMatch(results, title) : results[0];
    if (best) return best;
  }

  return null;
}

export function isApiKeyConfigured() {
  return Boolean(getApiKey());
}
