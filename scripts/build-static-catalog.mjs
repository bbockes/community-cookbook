import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOKS_INPUT = path.join(ROOT, 'scripts/curated-books.json');
const VOLUME_IDS_FILE = path.join(ROOT, 'src/config/curatedVolumeIds.ts');
const META_FILE = path.join(ROOT, 'src/config/curatedBookMeta.ts');
const OVERRIDES_FILE = path.join(ROOT, 'src/config/curatedBookMetaOverrides.ts');
const CATALOG_OUTPUT = path.join(ROOT, 'src/data/staticBookCatalog.json');
const AUTHORS_OUTPUT = path.join(ROOT, 'src/config/curatedAuthorVolumeIds.ts');

const AUTHOR_NAMES = [
  'Julia Child',
  'Donna Hay',
  'Jill Dalton',
  'Jamie Oliver',
  'Peter Reinhart',
  'Ming Tsai',
  'Terry Walters',
  'Ree Drummond',
];

function loadCuratedVolumeIds() {
  const text = fs.readFileSync(VOLUME_IDS_FILE, 'utf8');
  const match = text.match(
    /export const curatedVolumeIds = (\{[\s\S]*\}) as const;/
  );
  if (!match) throw new Error('Could not parse curatedVolumeIds.ts');
  return JSON.parse(match[1]);
}

function loadTsRecord(filePath, exportName) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(
    new RegExp(`export const ${exportName}[^=]*= ([\\s\\S]*?);\\s*(?:\\n|$)`)
  );
  if (!match) throw new Error(`Could not parse ${path.basename(filePath)}`);
  return Function(`"use strict"; return (${match[1]});`)();
}

function loadCuratedBookMeta() {
  return loadTsRecord(META_FILE, 'curatedBookMeta');
}

function loadCuratedBookMetaOverrides() {
  return loadTsRecord(OVERRIDES_FILE, 'curatedBookMetaOverrides');
}

function resolveMeta(volumeId, metaByVolumeId, overridesByVolumeId) {
  const override = overridesByVolumeId[volumeId];
  const meta = metaByVolumeId[volumeId];
  return {
    isbn13: override?.isbn13 ?? meta?.isbn13,
    isbn10: override?.isbn10 ?? meta?.isbn10,
    title: override?.title ?? meta?.title,
  };
}

function googleCoverUrl(volumeId) {
  const url = new URL('https://books.google.com/books/content');
  url.searchParams.set('id', volumeId);
  url.searchParams.set('printsec', 'frontcover');
  url.searchParams.set('img', '1');
  url.searchParams.set('zoom', '0');
  url.searchParams.set('source', 'gbs_api');
  return url.toString();
}

function openLibraryCover(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

function buildBook(volumeId, bookEntry, meta) {
  const isbn13 = meta?.isbn13;
  const isbn10 = meta?.isbn10;
  const image = isbn13
    ? openLibraryCover(isbn13)
    : isbn10
      ? openLibraryCover(isbn10)
      : googleCoverUrl(volumeId);

  return {
    id: volumeId,
    title: bookEntry?.title ?? meta?.title ?? 'Untitled',
    authors: bookEntry?.author ? [bookEntry.author] : ['Unknown author'],
    image,
    isbn13,
    isbn10,
  };
}

function authorMatches(bookAuthor, authorName) {
  const normalizedBook = bookAuthor.toLowerCase();
  const normalizedName = authorName.toLowerCase();
  const lastName = authorName.split(/\s+/).pop()?.toLowerCase() ?? '';
  return (
    normalizedBook.includes(normalizedName) ||
    normalizedBook.includes(lastName)
  );
}

function main() {
  const curatedBooks = JSON.parse(fs.readFileSync(BOOKS_INPUT, 'utf8'));
  const volumeIdsByCategory = loadCuratedVolumeIds();
  const metaByVolumeId = loadCuratedBookMeta();
  const overridesByVolumeId = loadCuratedBookMetaOverrides();
  const catalog = {};

  for (const [category, books] of Object.entries(curatedBooks)) {
    const volumeIds = volumeIdsByCategory[category] ?? [];
    const count = Math.min(books.length, volumeIds.length);

    for (let i = 0; i < count; i++) {
      const volumeId = volumeIds[i];
      if (catalog[volumeId]) continue;
      const meta = resolveMeta(volumeId, metaByVolumeId, overridesByVolumeId);
      catalog[volumeId] = buildBook(volumeId, books[i], meta);
    }
  }

  const allIds = Object.keys(catalog);
  const authorVolumeIds = {
    default: allIds.slice(0, 40),
  };

  for (const authorName of AUTHOR_NAMES) {
    const ids = [];
    for (const [category, books] of Object.entries(curatedBooks)) {
      const volumeIds = volumeIdsByCategory[category] ?? [];
      books.forEach((book, index) => {
        if (authorMatches(book.author, authorName) && volumeIds[index]) {
          ids.push(volumeIds[index]);
        }
      });
    }
    authorVolumeIds[authorName] = [...new Set(ids)];
  }

  fs.mkdirSync(path.dirname(CATALOG_OUTPUT), { recursive: true });
  fs.writeFileSync(CATALOG_OUTPUT, `${JSON.stringify(catalog, null, 2)}\n`);

  const authorsFile = `/**
 * Author browse lists — generated from curated cookbook lists.
 * Regenerate: node scripts/build-static-catalog.mjs
 */
export const curatedAuthorVolumeIds = ${JSON.stringify(authorVolumeIds, null, 2)} as const;

export type CuratedAuthor = keyof typeof curatedAuthorVolumeIds;
`;

  fs.writeFileSync(AUTHORS_OUTPUT, authorsFile);

  console.log(`Wrote ${allIds.length} books to ${CATALOG_OUTPUT}`);
  console.log(`Wrote author lists to ${AUTHORS_OUTPUT}`);
}

main();
