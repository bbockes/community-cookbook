const CACHE_PREFIX = 'community-cookbook:resolved-covers:v1:';

export function getResolvedCover(volumeId: string): string | null {
  try {
    return localStorage.getItem(`${CACHE_PREFIX}${volumeId}`);
  } catch {
    return null;
  }
}

export function saveResolvedCover(volumeId: string, url: string): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${volumeId}`, url);
  } catch {
    // Ignore quota errors
  }
}
