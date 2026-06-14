function normalizeText(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTitle(title) {
  return normalizeText(title)
    .replace(/\s*,?\s*(volume|vol\.?)\s+[a-z0-9]+.*$/i, '')
    .replace(/\s*,?\s*(revised|updated|expanded)\s*(edition)?.*$/i, '')
    .trim();
}

function primaryAuthorLastName(authors) {
  const name = authors?.[0] ?? '';
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1]?.toLowerCase() ?? '';
}

/** Same title + primary author = duplicate (different editions/ISBNs). */
export function dedupeKey(book) {
  return `${normalizeTitle(book.title)}::${primaryAuthorLastName(book.authors)}`;
}

function completenessScore(book) {
  let score = 0;
  if (book.hasCover) score += 1000;
  if (book.description) score += Math.min(book.description.length, 500);
  score += (book.ratingsCount ?? 0) * 2;
  score += (book.rating ?? 0) * 10;
  if (book.publisher) score += 5;
  if (book.pageCount) score += 3;
  if (book.isbn13) score += 2;
  return score;
}

export function pickPreferredBook(a, b) {
  const scoreA = completenessScore(a);
  const scoreB = completenessScore(b);
  if (scoreA !== scoreB) return scoreA > scoreB ? a : b;
  return a.id < b.id ? a : b;
}

export function dedupeBooks(books) {
  const byKey = new Map();

  for (const book of books) {
    const key = dedupeKey(book);
    const existing = byKey.get(key);
    byKey.set(key, existing ? pickPreferredBook(existing, book) : book);
  }

  return [...byKey.values()].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  );
}

export function findDuplicateInList(book, books) {
  const key = dedupeKey(book);
  return books.find((candidate) => candidate.id !== book.id && dedupeKey(candidate) === key);
}
