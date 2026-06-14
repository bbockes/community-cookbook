/** First-letter bucket for author browse tabs (A–Z, or # for non-alpha). */
export function getAuthorSortLetter(name) {
  const first = name.trim()[0]?.toUpperCase() ?? '';
  return /[A-Z]/.test(first) ? first : '#';
}
