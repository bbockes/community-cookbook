import cuisinesData from './cuisines.json';

export type CuisineConfig = {
  name: string;
  image: string;
  keywords: string[];
  pills: string[];
};

export const CUISINES = cuisinesData.cuisines as CuisineConfig[];

const ALL_CUISINES_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

export function buildCuisineSubcategories() {
  return [
    { name: 'All Cuisines', image: ALL_CUISINES_IMAGE },
    ...CUISINES.map(({ name, image }) => ({ name, image })),
  ];
}

export function buildCuisineSubFilters(): Record<string, string[]> {
  const filters: Record<string, string[]> = {};
  for (const cuisine of CUISINES) {
    if (cuisine.pills.length === 0) continue;
    filters[cuisine.name] = [`All ${cuisine.name}`, ...cuisine.pills];
  }
  return filters;
}

export function buildCuisineCollectionConfig() {
  const nested: Record<string, { query: string }> = {
    default: { query: 'world cuisine cookbook' },
  };
  for (const cuisine of CUISINES) {
    nested[cuisine.name] = {
      query: `${cuisine.name.toLowerCase()} cuisine cookbook`,
    };
  }
  return nested;
}

export function buildCuisineSubFilterQueries(): Record<string, string> {
  const queries: Record<string, string> = {};
  for (const cuisine of CUISINES) {
    for (const pill of cuisine.pills) {
      const key = `${cuisine.name} > ${pill}`;
      queries[key] = `${pill.toLowerCase()} cookbook`;
    }
  }
  return queries;
}
