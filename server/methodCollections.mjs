import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const methodsData = JSON.parse(
  readFileSync(path.join(ROOT, 'src/config/cookingMethods.json'), 'utf8')
);

export const METHOD_RULES = methodsData.methods.map(({ name, keywords }) => ({
  name,
  keywords,
}));

export const methodSubFilterQueries = Object.fromEntries(
  methodsData.methods.flatMap((method) =>
    method.pills.map((pill) => [
      `${method.name} > ${pill}`,
      `${pill.toLowerCase()} ${method.keywords[0]} cookbook`,
    ])
  )
);
