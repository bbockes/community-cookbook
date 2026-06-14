import React, { useCallback, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Cookbook, formatAuthors } from '../types/cookbook';
import { saveResolvedCover } from '../services/coverCache';
import { buildCoverSources } from '../services/coverUrls';

type CookbookCoverProps = {
  book: Pick<Cookbook, 'id' | 'title' | 'authors' | 'image' | 'isbn13' | 'isbn10'>;
  className?: string;
  imgClassName?: string;
};

/** Google often returns a gray "image not available" PNG that still loads with HTTP 200. */
function isPlaceholderCover(img: HTMLImageElement): boolean {
  const width = Math.min(64, img.naturalWidth);
  const height = Math.min(64, img.naturalHeight);
  if (width === 0 || height === 0) return true;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return false;

  ctx.drawImage(img, 0, 0, width, height);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, width, height).data;
  } catch {
    // Cross-origin images (Google Books, etc.) can't be pixel-checked without
    // CORS headers. Treat a loaded image as valid rather than skipping it.
    return false;
  }

  let lightDesaturated = 0;
  let grayscale = 0;
  let totalLuminance = 0;
  const colors = new Set<string>();
  const pixels = width * height;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += luminance;
    if (luminance > 175 && saturation < 0.2) lightDesaturated++;
    if (saturation < 0.08) grayscale++;
    colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
  }

  const avgLuminance = totalLuminance / pixels;
  const lightDesaturatedRatio = lightDesaturated / pixels;
  const grayscaleRatio = grayscale / pixels;

  return (
    lightDesaturatedRatio > 0.55 ||
    (grayscaleRatio > 0.9 && avgLuminance > 220) ||
    (colors.size <= 12 && avgLuminance > 200)
  );
}

function PlaceholderCover({
  title,
  authors,
  className,
}: {
  title: string;
  authors: string[];
  className?: string;
}) {
  const initials = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-neutral-100 to-amber-100 text-center p-6 ${className ?? ''}`}
      aria-label={`Cover unavailable for ${title}`}
    >
      <BookOpen className="text-amber-700/40 mb-3" size={40} strokeWidth={1.5} />
      {initials && (
        <span className="text-3xl font-bold text-amber-800/70 mb-2 font-serif">
          {initials}
        </span>
      )}
      <p className="text-sm font-semibold text-gray-800 line-clamp-3 leading-snug">
        {title}
      </p>
      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
        {formatAuthors(authors)}
      </p>
    </div>
  );
}

export function CookbookCover({
  book,
  className,
  imgClassName,
}: CookbookCoverProps) {
  const sources = useMemo(() => buildCoverSources(book), [book]);
  const [sourceIndex, setSourceIndex] = useState(0);

  const advance = useCallback(() => {
    setSourceIndex((index) => index + 1);
  }, []);

  const exhausted = sourceIndex >= sources.length;
  const currentSrc = sources[sourceIndex];

  const handleLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      if (isPlaceholderCover(img)) {
        advance();
        return;
      }
      saveResolvedCover(book.id, img.currentSrc);
    },
    [advance, book.id]
  );

  if (exhausted || !currentSrc) {
    return (
      <PlaceholderCover
        title={book.title}
        authors={book.authors}
        className={className ?? imgClassName}
      />
    );
  }

  const useCrossOrigin = currentSrc.includes('openlibrary.org');

  return (
    <img
      key={currentSrc}
      src={currentSrc}
      alt={`Cover of ${book.title}`}
      className={imgClassName ?? className}
      crossOrigin={useCrossOrigin ? 'anonymous' : undefined}
      referrerPolicy="no-referrer"
      onLoad={handleLoad}
      onError={advance}
    />
  );
}
