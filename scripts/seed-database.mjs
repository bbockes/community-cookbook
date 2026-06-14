import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  assignToCollections,
  clearFoodTypeCollections,
  clearCuisineCollections,
  clearMethodCollections,
  getCookbookById,
  listAllCookbooks,
  upsertCookbook,
} from '../server/db.mjs';
import { fetchVolumeById } from '../server/googleBooks.mjs';
import { getCollectionKey } from '../server/collections.mjs';
import { inferCollections } from '../server/autoCollections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env.local') });
dotenv.config({ path: path.join(ROOT, '.env') });

const VOLUME_IDS_FILE = path.join(ROOT, 'src/config/curatedVolumeIds.ts');
const AUTHORS_FILE = path.join(ROOT, 'src/config/curatedAuthorVolumeIds.ts');
const STATIC_CATALOG = path.join(ROOT, 'src/data/staticBookCatalog.json');

function loadTsConst(filePath, exportName) {
  const text = fs.readFileSync(filePath, 'utf8');
  const match = text.match(
    new RegExp(`export const ${exportName}[^=]*= ([\\s\\S]*?) as const;`)
  );
  if (!match) throw new Error(`Could not parse ${filePath}`);
  return Function(`"use strict"; return (${match[1]});`)();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function categoryToCollectionKey(category, volumeIds) {
  const mappings = {
    French: getCollectionKey('cuisines', 'European', null),
    Asian: getCollectionKey('cuisines', 'Asian', null),
    Italian: getCollectionKey('cuisines', 'European', null),
    Mexican: getCollectionKey('cuisines', 'Latin American', null),
    Mediterranean: getCollectionKey('cuisines', 'Middle Eastern', null),
    Baking: getCollectionKey('methods', 'Roasting/Baking', null),
    Grilling: getCollectionKey('methods', 'Grilling/Barbecuing', null),
    'Slow Cooking': getCollectionKey('methods', 'Stewing', null),
    'Stir-Fry': getCollectionKey('methods', 'Sautéing/Stir-frying', null),
    Roasting: getCollectionKey('methods', 'Roasting/Baking', null),
  };

  return { category, key: mappings[category], volumeIds };
}

async function ensureCookbook(volumeId, staticEntry) {
  const existing = getCookbookById(volumeId);
  if (existing) return existing;

  try {
    const fetched = await fetchVolumeById(volumeId);
    if (fetched) {
      return upsertCookbook(fetched);
    }
  } catch (error) {
    console.warn(`  Google fetch failed for ${volumeId}: ${error.message}`);
  }

  if (staticEntry) {
    return upsertCookbook({
      id: staticEntry.id,
      title: staticEntry.title,
      authors: staticEntry.authors,
      image: staticEntry.image,
      isbn13: staticEntry.isbn13,
      isbn10: staticEntry.isbn10,
    });
  }

  return null;
}

async function main() {
  const volumeIdsByCategory = loadTsConst(VOLUME_IDS_FILE, 'curatedVolumeIds');
  const authorVolumeIds = loadTsConst(AUTHORS_FILE, 'curatedAuthorVolumeIds');
  const staticCatalog = JSON.parse(fs.readFileSync(STATIC_CATALOG, 'utf8'));

  const categoryMappings = Object.entries(volumeIdsByCategory).map(
    ([category, ids]) => categoryToCollectionKey(category, ids)
  );

  let created = 0;
  let cached = 0;
  let failed = 0;

  console.log('Seeding cookbooks from Google Books API...\n');

  for (const { category, key, volumeIds } of categoryMappings) {
    if (!key || !volumeIds?.length) continue;
    console.log(`Category: ${category} (${volumeIds.length} books)`);

    for (const volumeId of volumeIds) {
      const staticEntry = staticCatalog[volumeId];
      const before = getCookbookById(volumeId);
      const book = await ensureCookbook(volumeId, staticEntry);

      if (!book) {
        failed++;
        console.warn(`  ✗ ${volumeId}`);
        continue;
      }

      if (before) cached++;
      else created++;

      const keys = new Set([
        getCollectionKey('all', null, null),
        key,
      ]);

      assignToCollections(book.id, [...keys]);
      console.log(`  ✓ ${book.title}`);
      await sleep(250);
    }
  }

  console.log('\nAssigning author collections...');
  for (const [author, ids] of Object.entries(authorVolumeIds)) {
    if (author === 'default') continue;
    const authorKey = getCollectionKey('authors', author, null);
    for (const volumeId of ids) {
      if (getCookbookById(volumeId)) {
        assignToCollections(volumeId, [
          getCollectionKey('authors', null, null),
          authorKey,
        ]);
      }
    }
    console.log(`  ${author}: ${ids.length} books`);
  }

  const allIds = new Set(Object.values(volumeIdsByCategory).flat());
  for (const volumeId of allIds) {
    if (getCookbookById(volumeId)) {
      assignToCollections(volumeId, [getCollectionKey('all', null, null)]);
    }
  }

  console.log('\nRe-inferring browse collections from metadata...');
  for (const book of listAllCookbooks()) {
    clearFoodTypeCollections(book.id);
    clearCuisineCollections(book.id);
    clearMethodCollections(book.id);
    assignToCollections(book.id, inferCollections(book));
  }

  console.log(`\nDone. Created: ${created}, already cached: ${cached}, failed: ${failed}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
