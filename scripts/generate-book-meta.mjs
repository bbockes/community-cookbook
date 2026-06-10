import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS_INPUT = path.join(ROOT, 'scripts/curated-books.json');
const VOLUME_IDS_FILE = path.join(ROOT, 'src/config/curatedVolumeIds.ts');
const OUTPUT = path.join(ROOT, 'src/config/curatedBookMeta.ts');
const OVERRIDES_FILE = path.join(ROOT, 'src/config/curatedBookMetaOverrides.ts');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCuratedVolumeIds() {
  const text = fs.readFileSync(VOLUME_IDS_FILE, 'utf8');
  const match = text.match(
    /export const curatedVolumeIds = (\{[\s\S]*\}) as const;/
  );
  if (!match) throw new Error('Could not parse curatedVolumeIds.ts');
  return JSON.parse(match[1]);
}

function pickIsbns(isbns) {
  const unique = [...new Set(isbns ?? [])];
  const isbn13 = unique.find((value) => /^\d{13}$/.test(value));
  const isbn10 = unique.find((value) => /^\d{10}$/.test(value));
  return { isbn13, isbn10 };
}

async function searchOpenLibrary(params) {
  const url = new URL('https://openlibrary.org/search.json');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set('limit', '5');
  url.searchParams.set('fields', 'title,author_name,isbn');

  const response = await fetch(url);
  if (!response.ok) return null;
  return response.json();
}

function matchDoc(title, docs) {
  const normalizedTitle = title.toLowerCase();
  for (const doc of docs ?? []) {
    const docTitle = (doc.title ?? '').toLowerCase();
    if (
      docTitle.includes(normalizedTitle) ||
      normalizedTitle.includes(docTitle)
    ) {
      const isbns = pickIsbns(doc.isbn);
      if (isbns.isbn13 || isbns.isbn10) {
        return { ...isbns, title: doc.title };
      }
    }
  }

  const fallback = pickIsbns(docs?.[0]?.isbn);
  if (fallback.isbn13 || fallback.isbn10) {
    return { ...fallback, title: docs?.[0]?.title };
  }

  return null;
}

async function lookupIsbnOpenLibrary(title, author) {
  const withAuthor = await searchOpenLibrary({
    title,
    author: author.split(/\s+/)[0],
  });
  const authorMatch = matchDoc(title, withAuthor?.docs);
  if (authorMatch) return authorMatch;

  const titleOnly = await searchOpenLibrary({ title });
  return matchDoc(title, titleOnly?.docs);
}

async function main() {
  const curatedBooks = JSON.parse(fs.readFileSync(BOOKS_INPUT, 'utf8'));
  const volumeIdsByCategory = loadCuratedVolumeIds();
  const meta = {};
  let resolved = 0;
  let total = 0;

  for (const [category, books] of Object.entries(curatedBooks)) {
    const volumeIds = volumeIdsByCategory[category] ?? [];
    const count = Math.min(books.length, volumeIds.length);
    total += count;

    for (let i = 0; i < count; i++) {
      const book = books[i];
      const volumeId = volumeIds[i];
      const entry = await lookupIsbnOpenLibrary(book.title, book.author);
      await sleep(150);

      if (entry) {
        meta[volumeId] = {
          isbn13: entry.isbn13,
          isbn10: entry.isbn10,
          title: book.title,
        };
        resolved++;
      } else {
        console.warn(`  ✗ ${category}: ${book.title}`);
      }
    }
  }

  const overrides = loadOverrides();
  for (const [volumeId, entry] of Object.entries(overrides)) {
    meta[volumeId] = { ...meta[volumeId], ...entry };
  }

  const fileContent = `/**
 * ISBN metadata for curated volume IDs — used for reliable cover fallbacks.
 * Regenerate: node scripts/generate-book-meta.mjs
 */
export type CuratedBookMeta = {
  isbn13?: string;
  isbn10?: string;
  title?: string;
};

export const curatedBookMeta: Record<string, CuratedBookMeta> = ${JSON.stringify(meta, null, 2)};
`;

  fs.writeFileSync(OUTPUT, fileContent);
  console.log(
    `\nWrote ${resolved}/${total} auto-resolved entries` +
      ` (+${Object.keys(overrides).length} overrides) → ${Object.keys(meta).length} total in ${OUTPUT}`
  );
}

function loadOverrides() {
  if (!fs.existsSync(OVERRIDES_FILE)) return {};
  const text = fs.readFileSync(OVERRIDES_FILE, 'utf8');
  const match = text.match(
    /export const curatedBookMetaOverrides[^=]*=\s*(\{[\s\S]*?\n\});/
  );
  if (!match) return {};
  return Function(`"use strict"; return (${match[1]});`)();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
