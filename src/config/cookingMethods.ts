import methodsData from './cookingMethods.json';

export type CookingMethodConfig = {
  name: string;
  image: string;
  keywords: string[];
  pills: string[];
};

export const COOKING_METHODS = methodsData.methods as CookingMethodConfig[];

const ALL_METHODS_IMAGE =
  'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80';

export function buildMethodSubcategories() {
  return [
    { name: 'All Methods', image: ALL_METHODS_IMAGE },
    ...COOKING_METHODS.map(({ name, image }) => ({ name, image })),
  ];
}

export function buildMethodSubFilters(): Record<string, string[]> {
  const filters: Record<string, string[]> = {};
  for (const method of COOKING_METHODS) {
    if (method.pills.length === 0) continue;
    filters[method.name] = [`All ${method.name}`, ...method.pills];
  }
  return filters;
}

export function buildMethodCollectionConfig() {
  const nested: Record<string, { query: string }> = {
    default: { query: 'cooking technique cookbook' },
  };
  for (const method of COOKING_METHODS) {
    nested[method.name] = {
      query: `${method.keywords[0]} cookbook`,
    };
  }
  return nested;
}

export function buildMethodSubFilterQueries(): Record<string, string> {
  const queries: Record<string, string> = {};
  for (const method of COOKING_METHODS) {
    for (const pill of method.pills) {
      const key = `${method.name} > ${pill}`;
      queries[key] = `${pill.toLowerCase()} ${method.keywords[0]} cookbook`;
    }
  }
  return queries;
}
