/**
 * Configure which books appear on each browse page.
 *
 * Curated lists are sourced from expert roundups (Food & Wine, Serious Eats,
 * David Lebovitz, etc.) and resolved to Google Books volume IDs in
 * curatedVolumeIds.ts. Regenerate with: node scripts/resolve-volume-ids.mjs
 */
import { curatedVolumeIds } from './curatedVolumeIds';
import { curatedAuthorVolumeIds } from './curatedAuthorVolumeIds';
import {
  buildMethodCollectionConfig,
  buildMethodSubFilterQueries,
} from './cookingMethods';
import {
  buildCuisineCollectionConfig,
  buildCuisineSubFilterQueries,
} from './cuisines';

export type BookCollectionConfig = {
  query?: string;
  volumeIds?: string[];
  maxResults?: number;
  orderBy?: 'relevance' | 'newest';
  bestsellerOnly?: boolean;
};

export type TabId = 'all' | 'cuisines' | 'methods' | 'authors' | 'foodTypes';

function uniqueIds(...groups: readonly string[][]): string[] {
  return [...new Set(groups.flat())];
}

const allCuisineIds = uniqueIds(
  curatedVolumeIds.French,
  curatedVolumeIds.Asian,
  curatedVolumeIds.Italian,
  curatedVolumeIds.Mexican,
  curatedVolumeIds.Mediterranean
);

const allMethodIds = uniqueIds(
  curatedVolumeIds.Baking,
  curatedVolumeIds.Grilling,
  curatedVolumeIds['Slow Cooking'],
  curatedVolumeIds['Stir-Fry'],
  curatedVolumeIds.Roasting
);

export const bookCollections: Record<
  TabId,
  BookCollectionConfig | Record<string, BookCollectionConfig>
> = {
  all: {
    volumeIds: uniqueIds(
      curatedVolumeIds.bestsellers,
      allCuisineIds.slice(0, 10),
      allMethodIds.slice(0, 10)
    ),
  },

  foodTypes: {
    default: {
      query: 'cookbook',
    },
    Breakfast: {
      query: 'breakfast cookbook',
    },
    Desserts: {
      query: 'dessert cookbook',
    },
    'Soups & Stews': {
      query: 'soup stew cookbook',
    },
    Vegetarian: {
      query: 'vegetarian cookbook',
    },
    Seafood: {
      query: 'seafood cookbook',
    },
    'Pasta & Noodles': {
      query: 'pasta noodle cookbook',
    },
    Salads: {
      query: 'salad cookbook',
    },
    'Snacks & Appetizers': {
      query: 'appetizer snack cookbook',
    },
    'Sandwiches & Burgers': {
      query: 'sandwich burger cookbook',
    },
    BBQ: {
      query: 'barbecue bbq cookbook',
    },
    Pizza: {
      query: 'pizza cookbook',
    },
    'Ice Cream': {
      query: 'ice cream cookbook',
    },
    'Bread & Baking': {
      query: 'bread baking cookbook',
    },
    Tacos: {
      query: 'taco cookbook',
    },
    'Chicken & Poultry': {
      query: 'chicken poultry cookbook',
    },
    'Cookies & Candy': {
      query: 'cookie candy cookbook',
    },
    Vegan: {
      query: 'vegan cookbook',
    },
    'Drinks & Cocktails': {
      query: 'cocktail drink cookbook',
    },
  },

  cuisines: buildCuisineCollectionConfig(),

  methods: buildMethodCollectionConfig(),

  authors: {
    default: {
      volumeIds: [...curatedAuthorVolumeIds.default],
    },
  },
};

/** Optional sub-filter overrides (cuisine/method pills). Keyed by "Parent > Filter". */
export const subFilterCollections: Record<string, BookCollectionConfig> = {
  ...Object.fromEntries(
    Object.entries(buildCuisineSubFilterQueries()).map(([key, query]) => [
      key,
      { query },
    ])
  ),
  ...Object.fromEntries(
    Object.entries(buildMethodSubFilterQueries()).map(([key, query]) => [
      key,
      { query },
    ])
  ),
};

export function getCollectionConfig(
  tab: TabId,
  subcategory: string | null,
  subFilter: string | null
): BookCollectionConfig {
  if (subFilter && subcategory && !subFilter.startsWith('All ')) {
    const subFilterKey = `${subcategory} > ${subFilter}`;
    const subFilterConfig = subFilterCollections[subFilterKey];
    if (subFilterConfig) return subFilterConfig;
  }

  const tabConfig = bookCollections[tab];

  if (tab === 'all') {
    return tabConfig as BookCollectionConfig;
  }

  const nested = tabConfig as Record<string, BookCollectionConfig>;
  if (!subcategory || subcategory.startsWith('All ')) {
    return nested.default;
  }

  return nested[subcategory] ?? nested.default;
}

export function getCollectionCacheKey(
  tab: TabId,
  subcategory: string | null,
  subFilter: string | null
): string {
  return [tab, subcategory ?? 'none', subFilter ?? 'none'].join(':');
}

export type BrowseContext = {
  tab: TabId;
  subcategory: string | null;
  subFilter: string | null;
  authorLetter?: string | null;
};

/** Middle breadcrumb segment for the product page (3 levels: home > this > title). */
export function getProductBreadcrumbLabel(context: BrowseContext): string {
  if (context.subFilter) return context.subFilter;

  if (context.subcategory) {
    if (context.tab === 'cuisines') return `${context.subcategory} cuisine`;
    return context.subcategory;
  }

  if (context.tab === 'authors' && context.authorLetter) {
    return context.authorLetter;
  }

  switch (context.tab) {
    case 'all':
      return 'All Cookbooks';
    case 'foodTypes':
      return 'All Food Types';
    case 'cuisines':
      return 'All Cuisines';
    case 'methods':
      return 'All Methods';
    case 'authors':
      return 'All Author';
  }
}
