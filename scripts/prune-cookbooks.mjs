import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  deleteCookbook,
  listAllCookbooks,
  mergeCollections,
  setCookbookHasCover,
} from '../server/db.mjs';
import { bookHasCover } from '../server/covers.mjs';
import { dedupeBooks, dedupeKey, pickPreferredBook } from '../server/dedupe.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const CONCURRENCY = 8;

async function mapWithConcurrency(items, fn, limit) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function auditCovers(books) {
  console.log(`Checking covers for ${books.length} books…\n`);

  const results = await mapWithConcurrency(
    books,
    async (book) => {
      const hasCover = await bookHasCover(book);
      setCookbookHasCover(book.id, hasCover);
      console.log(`${hasCover ? '✓' : '✗'} ${book.title}`);
      return { book, hasCover };
    },
    CONCURRENCY
  );

  const withoutCovers = results.filter((r) => !r.hasCover).map((r) => r.book);
  return withoutCovers;
}

function mergeDuplicates(books) {
  const groups = new Map();

  for (const book of books) {
    const key = dedupeKey(book);
    const group = groups.get(key) ?? [];
    group.push(book);
    groups.set(key, group);
  }

  let removed = 0;

  for (const [, group] of groups) {
    if (group.length < 2) continue;

    let keeper = group[0];
    for (let i = 1; i < group.length; i++) {
      keeper = pickPreferredBook(keeper, group[i]);
    }

    for (const book of group) {
      if (book.id === keeper.id) continue;
      mergeCollections(book.id, keeper.id);
      deleteCookbook(book.id);
      removed++;
      console.log(`  merged duplicate: "${book.title}" (${book.id}) → ${keeper.id}`);
    }
  }

  return removed;
}

async function main() {
  let books = listAllCookbooks();
  console.log(`Starting prune: ${books.length} books in database\n`);

  const withoutCovers = await auditCovers(books);

  console.log(`\nRemoving ${withoutCovers.length} books without covers…`);
  for (const book of withoutCovers) {
    deleteCookbook(book.id);
    console.log(`  deleted: ${book.title}`);
  }

  books = listAllCookbooks({ displayableOnly: true });
  console.log(`\nMerging duplicates among ${books.length} remaining books…`);
  const duplicatesRemoved = mergeDuplicates(books);

  const remaining = listAllCookbooks({ displayableOnly: true });
  console.log(`\nDone.`);
  console.log(`  Removed (no cover): ${withoutCovers.length}`);
  console.log(`  Merged duplicates:  ${duplicatesRemoved}`);
  console.log(`  Remaining books:    ${remaining.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
