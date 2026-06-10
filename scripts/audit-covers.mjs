import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = path.join(ROOT, 'src/data/staticBookCatalog.json');
const OUTPUT = path.join(ROOT, 'src/config/volumesWithoutCovers.ts');

function openLibraryCover(isbn) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
}

function abeBooksCover(isbn) {
  return `https://pictures.abebooks.com/isbn/${isbn}-us-300.jpg`;
}

async function urlHasImage(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!response.ok) return false;
    const type = response.headers.get('content-type') ?? '';
    return type.startsWith('image/');
  } catch {
    return false;
  }
}

async function bookHasCover(book) {
  const isbns = [...new Set([book.isbn13, book.isbn10].filter(Boolean))];
  for (const isbn of isbns) {
    if (await urlHasImage(openLibraryCover(isbn))) return true;
    if (await urlHasImage(abeBooksCover(isbn))) return true;
  }
  if (book.image && !book.image.includes('books.google.com/books/content')) {
    return urlHasImage(book.image);
  }
  return false;
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf8'));
  const withoutCovers = [];

  for (const [id, book] of Object.entries(catalog)) {
    const hasCover = await bookHasCover(book);
    if (!hasCover) {
      withoutCovers.push(id);
      console.warn(`  ✗ ${book.title}`);
    }
  }

  const fileContent = `/**
 * Volume IDs with no working cover image — excluded from browse grids.
 * Regenerate: node scripts/audit-covers.mjs
 */
export const volumesWithoutCovers = new Set<string>(${JSON.stringify(withoutCovers, null, 2)});
`;

  fs.writeFileSync(OUTPUT, fileContent);
  console.log(`\n${withoutCovers.length}/${Object.keys(catalog).length} without covers`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
