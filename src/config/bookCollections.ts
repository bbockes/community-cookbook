/**
 * Configure which books appear on each browse page.
 *
 * Curated lists are sourced from expert roundups (Food & Wine, Serious Eats,
 * David Lebovitz, etc.) and resolved to Google Books volume IDs in
 * curatedVolumeIds.ts. Regenerate with: node scripts/resolve-volume-ids.mjs
 */
import { curatedVolumeIds } from './curatedVolumeIds';
import { curatedAuthorVolumeIds } from './curatedAuthorVolumeIds';

export type BookCollectionConfig = {
  query?: string;
  volumeIds?: string[];
  maxResults?: number;
  orderBy?: 'relevance' | 'newest';
  bestsellerOnly?: boolean;
};

export type TabId = 'all' | 'cuisines' | 'methods' | 'authors' | 'bestsellers';

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

  bestsellers: {
    volumeIds: [...curatedVolumeIds.bestsellers],
  },

  cuisines: {
    default: {
      volumeIds: allCuisineIds,
    },
    French: {
      volumeIds: [...curatedVolumeIds.French],
    },
    Asian: {
      volumeIds: [...curatedVolumeIds.Asian],
    },
    Italian: {
      volumeIds: [...curatedVolumeIds.Italian],
    },
    Mexican: {
      volumeIds: [...curatedVolumeIds.Mexican],
    },
    Mediterranean: {
      volumeIds: [...curatedVolumeIds.Mediterranean],
    },
  },

  methods: {
    default: {
      volumeIds: allMethodIds,
    },
    Baking: {
      volumeIds: [...curatedVolumeIds.Baking],
    },
    Grilling: {
      volumeIds: [...curatedVolumeIds.Grilling],
    },
    'Slow Cooking': {
      volumeIds: [...curatedVolumeIds['Slow Cooking']],
    },
    'Stir-Fry': {
      volumeIds: [...curatedVolumeIds['Stir-Fry']],
    },
    Roasting: {
      volumeIds: [...curatedVolumeIds.Roasting],
    },
  },

  authors: {
    default: {
      volumeIds: [...curatedAuthorVolumeIds.default],
    },
    'Julia Child': {
      volumeIds: [...curatedAuthorVolumeIds['Julia Child']],
    },
    'Donna Hay': {
      volumeIds: [...curatedAuthorVolumeIds['Donna Hay']],
    },
    'Jill Dalton': {
      volumeIds: [...curatedAuthorVolumeIds['Jill Dalton']],
    },
    'Jamie Oliver': {
      volumeIds: [...curatedAuthorVolumeIds['Jamie Oliver']],
    },
    'Peter Reinhart': {
      volumeIds: [...curatedAuthorVolumeIds['Peter Reinhart']],
    },
    'Ming Tsai': {
      volumeIds: [...curatedAuthorVolumeIds['Ming Tsai']],
    },
    'Terry Walters': {
      volumeIds: [...curatedAuthorVolumeIds['Terry Walters']],
    },
    'Ree Drummond': {
      volumeIds: [...curatedAuthorVolumeIds['Ree Drummond']],
    },
  },
};

/** Optional sub-filter overrides (cuisine/method pills). Keyed by "Parent > Filter". */
export const subFilterCollections: Record<string, BookCollectionConfig> = {
  'French > Classic French': { query: 'classic french cuisine cookbook' },
  'French > Provençal': { query: 'provencal french cookbook' },
  'French > Bistro': { query: 'french bistro cookbook' },
  'French > Pastry': { query: 'french pastry cookbook' },
  'Asian > Chinese': { query: 'chinese cookbook' },
  'Asian > Japanese': { query: 'japanese cookbook' },
  'Asian > Korean': { query: 'korean cookbook' },
  'Asian > Indian': { query: 'indian cookbook' },
  'Asian > Thai': { query: 'thai cookbook' },
  'Asian > Vietnamese': { query: 'vietnamese cookbook' },
  'Asian > Nepalese': { query: 'nepalese cookbook' },
  'Italian > Tuscan': { query: 'tuscan italian cookbook' },
  'Italian > Sicilian': { query: 'sicilian cookbook' },
  'Italian > Roman': { query: 'roman italian cookbook' },
  'Italian > Neapolitan': { query: 'neapolitan cookbook' },
  'Mexican > Oaxacan': { query: 'oaxacan mexican cookbook' },
  'Mexican > Yucatecan': { query: 'yucatecan cookbook' },
  'Mexican > Baja': { query: 'baja mexican cookbook' },
  'Mexican > Street Food': { query: 'mexican street food cookbook' },
  'Mediterranean > Greek': { query: 'greek mediterranean cookbook' },
  'Mediterranean > Turkish': { query: 'turkish cookbook' },
  'Mediterranean > Lebanese': { query: 'lebanese cookbook' },
  'Mediterranean > Moroccan': { query: 'moroccan cookbook' },
  'Baking > Bread': { query: 'bread baking cookbook' },
  'Baking > Pastries': { query: 'pastry cookbook' },
  'Baking > Cakes': { query: 'cake baking cookbook' },
  'Baking > Cookies': { query: 'cookie baking cookbook' },
  'Grilling > Charcoal': { query: 'charcoal grilling cookbook' },
  'Grilling > Gas': { query: 'gas grilling cookbook' },
  'Grilling > Smoking': { query: 'smoking meat cookbook' },
  'Grilling > BBQ': { query: 'barbecue cookbook' },
  'Slow Cooking > Braising': { query: 'braising cookbook' },
  'Slow Cooking > Stewing': { query: 'stew cookbook' },
  'Slow Cooking > Sous Vide': { query: 'sous vide cookbook' },
  'Stir-Fry > Wok': { query: 'wok cookbook' },
  'Stir-Fry > Pan-Fry': { query: 'pan fry cookbook' },
  'Stir-Fry > Deep-Fry': { query: 'deep fry cookbook' },
  'Roasting > Oven Roast': { query: 'oven roasting cookbook' },
  'Roasting > Spit Roast': { query: 'spit roast cookbook' },
  'Roasting > Pan Roast': { query: 'pan roast cookbook' },
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

  if (tab === 'all' || tab === 'bestsellers') {
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
};

/** Middle breadcrumb segment for the product page (3 levels: home > this > title). */
export function getProductBreadcrumbLabel(context: BrowseContext): string {
  if (context.subFilter) return context.subFilter;

  if (context.subcategory) {
    if (context.tab === 'cuisines') return `${context.subcategory} cuisine`;
    return context.subcategory;
  }

  switch (context.tab) {
    case 'all':
      return 'All Cookbooks';
    case 'bestsellers':
      return 'Best Sellers';
    case 'cuisines':
      return 'All Cuisines';
    case 'methods':
      return 'All Methods';
    case 'authors':
      return 'All Authors';
  }
}
