/** Convert Google Books HTML descriptions to plain text with line breaks. */
export function formatDescription(raw?: string): string {
  if (!raw) return '';

  let text = raw
    .replace(/<\s*br\s*\/?>/gi, '\n')
    .replace(/<\s*p[^>]*>/gi, '\n\n')
    .replace(/<\s*\/p\s*>/gi, '\n\n')
    .replace(/<\s*div[^>]*>/gi, '\n\n')
    .replace(/<\s*\/div\s*>/gi, '\n')
    .replace(/<\s*\/li\s*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&#10;|&#13;/g, '\n')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return insertPlainTextBreaks(text);
}

function insertPlainTextBreaks(text: string): string {
  if (text.includes('\n') || text.length < 250) return text;

  const suffixMatch = text.match(
    /^(.+?)\.\s+(Full-color[^\n]*|Includes[^\n]*|Illustrated[^\n]*|Photographs[^\n]*)$/i
  );
  if (suffixMatch) {
    return `${suffixMatch[1].trim()}.\n\n${suffixMatch[2].trim()}`;
  }

  const sentenceMatch = text.match(/^(.{40,280}?[.!?])(?:\s+)([\s\S]+)$/);
  if (sentenceMatch) {
    return `${sentenceMatch[1].trim()}\n\n${sentenceMatch[2].trim()}`;
  }

  return text;
}
