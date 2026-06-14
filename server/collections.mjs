import { cuisineSubFilterQueries } from './cuisineCollections.mjs';
import { methodSubFilterQueries } from './methodCollections.mjs';

/** Collection keys mirror frontend: tab:subcategory:subFilter */

export function getCollectionKey(tab, subcategory, subFilter) {
  return [tab, subcategory ?? 'none', subFilter ?? 'none'].join(':');
}

export function getParentCollectionKey(tab, subcategory) {
  if (!subcategory || subcategory.startsWith('All ')) {
    return getCollectionKey(tab, null, null);
  }
  return getCollectionKey(tab, subcategory, null);
}

/** Sub-filter search queries (ported from bookCollections.ts). */
export const subFilterQueries = {
  ...cuisineSubFilterQueries,
  ...methodSubFilterQueries,
};

export function resolveCollectionRequest(tab, subcategory, subFilter) {
  const collectionKey = getCollectionKey(tab, subcategory, subFilter);

  let subFilterQuery = null;
  if (subFilter && subcategory && !subFilter.startsWith('All ')) {
    const subFilterKey = `${subcategory} > ${subFilter}`;
    subFilterQuery = subFilterQueries[subFilterKey] ?? null;
  }

  const parentKey =
    subFilter && subcategory && !subcategory.startsWith('All ')
      ? getParentCollectionKey(tab, subcategory)
      : null;

  return {
    collectionKey,
    parentKey,
    subFilterQuery,
  };
}
