import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cuisinesData = JSON.parse(
  readFileSync(path.join(ROOT, 'src/config/cuisines.json'), 'utf8')
);

export const CUISINE_RULES = cuisinesData.cuisines.map(({ name, keywords }) => ({
  name,
  keywords,
}));

export const cuisineSubFilterQueries = Object.fromEntries(
  cuisinesData.cuisines.flatMap((cuisine) =>
    cuisine.pills.map((pill) => [
      `${cuisine.name} > ${pill}`,
      `${pill.toLowerCase()} cookbook`,
    ])
  )
);
