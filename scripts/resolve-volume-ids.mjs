import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INPUT = path.join(ROOT, 'scripts/curated-books.json');
const OUTPUT = path.join(ROOT, 'src/config/curatedVolumeIds.ts');

function loadApiKey() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return process.env.GOOGLE_BOOKS_API_KEY;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key === 'GOOGLE_BOOKS_API_KEY' || key === 'VITE_GOOGLE_BOOKS_API_KEY') {
      return rest.join('=').trim();
    }
  }
  return process.env.GOOGLE_BOOKS_API_KEY;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}

function buildQueries(title, author) {
  const t = normalize(title);
  const a = normalize(author.split(' ')[0]);
  return [
    `intitle:"${t}" inauthor:"${a}"`,
    `${t} ${author} cookbook`,
    `${t} cookbook`,
  ];
}

async function fetchWithRetry(url, retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(url);
    if (response.status === 429 && attempt < retries) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    return response;
  }
  throw new Error('Max retries exceeded');
}

function pickBestMatch(items, title) {
  const normalizedTitle = normalize(title).toLowerCase();
  const scored = items.map((item) => {
    const info = item.volumeInfo ?? {};
    const itemTitle = normalize(info.title ?? '').toLowerCase();
    const hasCover =
      info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail;
    let score = 0;
    if (hasCover) score += 10;
    if (itemTitle.includes(normalizedTitle) || normalizedTitle.includes(itemTitle)) {
      score += 20;
    }
    if (info.title?.toLowerCase().includes('cookbook')) score += 2;
    return { item, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.item;
}

async function lookupVolumeId(title, author, apiKey) {
  for (const q of buildQueries(title, author)) {
    const url = new URL('https://www.googleapis.com/books/v1/volumes');
    url.searchParams.set('q', q);
    url.searchParams.set('printType', 'books');
    url.searchParams.set('maxResults', '8');
    if (apiKey) url.searchParams.set('key', apiKey);

    const response = await fetchWithRetry(url.toString());
    if (!response.ok) continue;

    const data = await response.json();
    const match = pickBestMatch(data.items ?? [], title);
    if (match?.id) return match.id;
    await sleep(250);
  }
  return null;
}

async function resolveCategory(name, books, apiKey) {
  const volumeIds = [];
  const failed = [];

  for (const book of books) {
    try {
      const id = await lookupVolumeId(book.title, book.author, apiKey);
      await sleep(300);
      if (id && !volumeIds.includes(id)) {
        volumeIds.push(id);
      } else {
        failed.push(book);
      }
    } catch (error) {
      failed.push({ ...book, error: String(error) });
    }
  }

  console.log(
    `${name}: ${volumeIds.length}/${books.length} resolved` +
    (failed.length ? ` (${failed.length} failed)` : '')
  );
  if (failed.length) {
    failed.forEach((book) =>
      console.warn(`  ✗ ${book.title} — ${book.author}`)
    );
  }

  return volumeIds;
}

async function main() {
  const apiKey = loadApiKey();
  if (!apiKey) {
    console.error('No GOOGLE_BOOKS_API_KEY found in .env.local');
    process.exit(1);
  }

  const curated = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const output = {};

  for (const [category, books] of Object.entries(curated)) {
    output[category] = await resolveCategory(category, books, apiKey);
  }

  const fileContent = `/**
 * Curated cookbook volume IDs — generated from scripts/curated-books.json
 * Sources: Food & Wine, Serious Eats, David Lebovitz, and other expert lists.
 * Regenerate: node scripts/resolve-volume-ids.mjs
 */
export const curatedVolumeIds = ${JSON.stringify(output, null, 2)} as const;

export type CuratedCategory = keyof typeof curatedVolumeIds;
`;

  fs.writeFileSync(OUTPUT, fileContent);
  console.log(`\nWrote ${OUTPUT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
