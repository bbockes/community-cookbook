import React from 'react';
import { ChevronDown, Star } from 'lucide-react';

type ReviewSummaryProps = {
  averageRating: number;
  totalRatings: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

function StarRating({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.floor(rating)
              ? 'fill-amber-400 text-amber-400'
              : star - rating <= 0.5 && star > rating
                ? 'fill-amber-200 text-amber-400'
                : 'fill-gray-200 text-gray-200'
          }
        />
      ))}
    </div>
  );
}

export function ReviewSummary({
  averageRating,
  totalRatings,
  distribution,
}: ReviewSummaryProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Cookbook reviews
      </h2>

      <div className="flex items-center gap-2 mb-1">
        <StarRating rating={averageRating} />
        <span className="text-base font-medium text-gray-900">
          {Math.round(averageRating)} out of 5
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-5">
        {totalRatings.toLocaleString()}{' '}
        {totalRatings === 1 ? 'rating' : 'ratings'}
      </p>

      <div className="space-y-2 mb-5">
        {([5, 4, 3, 2, 1] as const).map((star) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            <button
              type="button"
              className="text-gray-600 hover:text-amber-600 shrink-0 w-12 text-left transition"
            >
              {star} star
            </button>
            <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${distribution[star]}%` }}
              />
            </div>
            <span className="text-gray-500 w-8 text-right shrink-0">
              {distribution[star]}%
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-amber-600 transition mb-6"
      >
        How reviews and ratings work
        <ChevronDown size={14} />
      </button>

      <hr className="border-gray-200 mb-6" />

      <h3 className="font-semibold text-gray-900 mb-1">Review this cookbook</h3>
      <p className="text-sm text-gray-500 mb-4">
        Share your thoughts with the community
      </p>
      <button
        type="button"
        className="w-full py-2.5 px-4 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold transition"
      >
        Write a review
      </button>
    </aside>
  );
}

export function buildReviewSummary(reviews: { rating: number }[]) {
  const totalRatings = reviews.length;
  const averageRating =
    totalRatings === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const review of reviews) {
    const bucket = Math.min(5, Math.max(1, Math.round(review.rating))) as
      | 1
      | 2
      | 3
      | 4
      | 5;
    counts[bucket]++;
  }

  const distribution = {
    1: totalRatings ? Math.round((counts[1] / totalRatings) * 100) : 0,
    2: totalRatings ? Math.round((counts[2] / totalRatings) * 100) : 0,
    3: totalRatings ? Math.round((counts[3] / totalRatings) * 100) : 0,
    4: totalRatings ? Math.round((counts[4] / totalRatings) * 100) : 0,
    5: totalRatings ? Math.round((counts[5] / totalRatings) * 100) : 0,
  };

  return { averageRating, totalRatings, distribution };
}
