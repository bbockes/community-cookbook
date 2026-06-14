import { Cookbook } from '../types/cookbook';
import { TabId } from '../config/bookCollections';

export class ApiError extends Error {
  status: number;
  usesSharedQuota?: boolean;
  apiKeyConfigured?: boolean;

  constructor(
    status: number,
    message: string,
    extras?: { usesSharedQuota?: boolean; apiKeyConfigured?: boolean }
  ) {
    super(message);
    this.status = status;
    this.usesSharedQuota = extras?.usesSharedQuota;
    this.apiKeyConfigured = extras?.apiKeyConfigured;
    this.name = 'ApiError';
  }
}

export type LookupResult = {
  book: Cookbook;
  source: 'cache' | 'google';
  created: boolean;
  alreadyExists?: boolean;
};

export type BulkLookupResult = {
  results: Array<{
    title: string;
    status: 'created' | 'existing' | 'cached' | 'not_found' | 'error';
    book?: Cookbook;
    error?: string;
  }>;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let body: {
      error?: string;
      usesSharedQuota?: boolean;
      apiKeyConfigured?: boolean;
    } = {};
    try {
      body = await response.json();
    } catch {
      // ignore
    }
    throw new ApiError(response.status, body.error ?? response.statusText, {
      usesSharedQuota: body.usesSharedQuota,
      apiKeyConfigured: body.apiKeyConfigured,
    });
  }

  return response.json() as Promise<T>;
}

export async function fetchBookCollection(
  tab: TabId,
  subcategory: string | null,
  subFilter: string | null,
  authorLetter: string | null = null
): Promise<Cookbook[]> {
  const params = new URLSearchParams({ tab });
  if (subcategory) params.set('subcategory', subcategory);
  if (subFilter) params.set('subFilter', subFilter);
  if (authorLetter) params.set('authorLetter', authorLetter);
  return apiFetch<Cookbook[]>(`/api/collections?${params}`);
}

export type AuthorSummary = {
  name: string;
  bookCount: number;
  image: string;
  letter: string;
};

export function getAuthorSortLetter(name: string): string {
  const first = name.trim()[0]?.toUpperCase() ?? '';
  return /[A-Z]/.test(first) ? first : '#';
}

export async function fetchAuthors(): Promise<AuthorSummary[]> {
  return apiFetch<AuthorSummary[]>('/api/authors');
}

export function buildAuthorTabsFromBooks(books: Cookbook[]): AuthorSummary[] {
  const byName = new Map<string, AuthorSummary>();

  for (const book of books) {
    for (const author of book.authors ?? []) {
      const name = author.trim();
      if (!name || name === 'Unknown author') continue;

      const existing = byName.get(name);
      if (existing) {
        existing.bookCount += 1;
      } else {
        byName.set(name, {
          name,
          bookCount: 1,
          image: book.image,
          letter: getAuthorSortLetter(name),
        });
      }
    }
  }

  return [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );
}

export async function fetchCookbookById(id: string): Promise<Cookbook | null> {
  try {
    return await apiFetch<Cookbook>(`/api/cookbooks/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function lookupCookbook(
  input: {
    title?: string;
    author?: string;
    isbn13?: string;
    isbn10?: string;
  },
  coverFile?: File
): Promise<LookupResult> {
  if (coverFile) {
    const form = new FormData();
    if (input.title) form.append('title', input.title);
    if (input.author) form.append('author', input.author);
    if (input.isbn13) form.append('isbn13', input.isbn13);
    if (input.isbn10) form.append('isbn10', input.isbn10);
    form.append('cover', coverFile);

    const response = await fetch('/api/cookbooks/lookup', {
      method: 'POST',
      body: form,
    });

    if (!response.ok) {
      let body: { error?: string; usesSharedQuota?: boolean; apiKeyConfigured?: boolean } = {};
      try {
        body = await response.json();
      } catch {
        // ignore
      }
      throw new ApiError(response.status, body.error ?? response.statusText, {
        usesSharedQuota: body.usesSharedQuota,
        apiKeyConfigured: body.apiKeyConfigured,
      });
    }

    return response.json() as Promise<LookupResult>;
  }

  return apiFetch<LookupResult>('/api/cookbooks/lookup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function bulkLookupCookbooks(input: {
  entries: Array<{
    title?: string;
    author?: string;
    isbn13?: string;
    isbn10?: string;
  }>;
  delayMs?: number;
}): Promise<BulkLookupResult> {
  return apiFetch<BulkLookupResult>('/api/cookbooks/bulk', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listAllCookbooks(): Promise<Cookbook[]> {
  return apiFetch<Cookbook[]>('/api/cookbooks');
}

/** @deprecated Use fetchBookCollection with tab params */
export async function searchCookbooks(maxResults = 40): Promise<Cookbook[]> {
  void maxResults;
  return fetchBookCollection('all', null, null);
}

// Re-export for ApiErrorPanel compatibility
export { ApiError as GoogleBooksError };
