import React, { useEffect, useState } from 'react';
import {
  X,
  Smile,
  Clock,
  Utensils,
  RefreshCw,
  ThumbsUp,
  MessageCircle,
  Send,
} from 'lucide-react';

export interface RecipeCardData {
  id: number;
  title: string;
  user: string;
  userAvatar: string;
  image: string;
  bookTitle: string;
  ratings: {
    taste: number;
    time: number;
    difficulty: number;
  };
  reviews: {
    taste: string;
    time: string;
    ingredients: string;
  };
  comments: Array<{
    id: number;
    user: string;
    avatar: string;
    text: string;
    timeAgo: string;
  }>;
}

interface RecipeCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: RecipeCardData | null;
}

function formatRating(score: number): string {
  return String(Math.round(score));
}

const RatingBar = ({ score, max = 5 }: { score: number; max?: number }) => {
  const percentage = (score / max) * 100;
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${percentage}%`,
          background:
            percentage >= 80
              ? '#16a34a'
              : percentage >= 60
                ? '#f59e0b'
                : '#ef4444',
        }}
      />
    </div>
  );
};

const RatingSummaryCard = ({
  icon: Icon,
  label,
  score,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  score: number;
  iconBg: string;
}) => (
  <div className="flex-1 bg-white rounded-xl p-5 border border-gray-100">
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
    <div className="flex items-end gap-2 mb-2">
      <span className="text-3xl font-bold text-gray-900">
        {formatRating(score)}
      </span>
      <span className="text-sm text-gray-400 pb-1">/ 5</span>
    </div>
    <RatingBar score={score} />
  </div>
);

export const RecipeCardModal = ({
  isOpen,
  onClose,
  recipe,
}: RecipeCardModalProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('taste');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setExpandedSection('taste');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !recipe) return null;

  const avgRating = formatRating(
    (recipe.ratings.taste + recipe.ratings.time + recipe.ratings.difficulty) / 3
  );

  const reviewSections = [
    {
      id: 'taste',
      icon: Smile,
      question: 'How did it taste?',
      score: recipe.ratings.taste,
      answer: recipe.reviews.taste,
      iconBg: 'bg-amber-500',
    },
    {
      id: 'ease',
      icon: Clock,
      question: 'Was it easy to follow?',
      score: recipe.ratings.time,
      answer: recipe.reviews.time,
      iconBg: 'bg-blue-500',
    },
    {
      id: 'ingredients',
      icon: Utensils,
      question: 'Were the ingredients easy to find?',
      score: recipe.ratings.difficulty,
      answer: recipe.reviews.ingredients,
      iconBg: 'bg-emerald-500',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-neutral-50 w-[90%] h-[90%] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-[fadeScaleIn_0.2s_ease-out]">
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <img
              src={recipe.userAvatar}
              alt={recipe.user}
              className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-amber-100"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {recipe.user}'s review
              </p>
              <p className="text-xs text-gray-400 truncate">
                from {recipe.bookTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="relative">
            <div className="w-full h-[340px] overflow-hidden bg-gray-100">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {recipe.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2">
                  <span className="text-amber-300 text-lg">★</span>
                  <span className="text-white font-bold text-lg">{avgRating}</span>
                  <span className="text-white/70 text-sm">avg rating</span>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2">
                  <MessageCircle size={16} className="text-white/80" />
                  <span className="text-white font-medium text-sm">
                    {recipe.comments.length} comments
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="flex gap-4 mb-8">
              <RatingSummaryCard
                icon={Smile}
                label="Taste"
                score={recipe.ratings.taste}
                iconBg="bg-amber-500"
              />
              <RatingSummaryCard
                icon={Clock}
                label="Ease"
                score={recipe.ratings.time}
                iconBg="bg-blue-500"
              />
              <RatingSummaryCard
                icon={Utensils}
                label="Ingredients"
                score={recipe.ratings.difficulty}
                iconBg="bg-emerald-500"
              />
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-4 mb-8">
              <div className="bg-emerald-100 p-3 rounded-full">
                <RefreshCw size={22} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-900">Would make again</p>
                <p className="text-sm text-emerald-700">
                  This reviewer would definitely cook this recipe again
                </p>
              </div>
              <div className="ml-auto">
                <ThumbsUp size={28} className="text-emerald-500" />
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">Detailed Review</h2>
            <div className="space-y-3 mb-10">
              {reviewSections.map((section) => {
                const isExpanded = expandedSection === section.id;
                return (
                  <div
                    key={section.id}
                    className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedSection(isExpanded ? null : section.id)
                      }
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${section.iconBg}`}>
                          <section.icon size={18} className="text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {section.question}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatRating(section.score)}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-gray-50">
                        <div className="flex items-start gap-4 pt-4">
                          <div
                            className="w-1 h-full bg-gray-200 rounded-full shrink-0 self-stretch"
                            style={{
                              background: section.iconBg.includes('amber')
                                ? '#f59e0b'
                                : section.iconBg.includes('blue')
                                  ? '#3b82f6'
                                  : '#10b981',
                            }}
                          />
                          <p className="text-gray-600 leading-relaxed">
                            {section.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle size={20} className="text-gray-400" />
                {recipe.comments.length} Comments
              </h2>

              {recipe.comments.length > 0 ? (
                <div className="space-y-5 mb-6">
                  {recipe.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <img
                        src={comment.avatar}
                        alt={comment.user}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">
                            {comment.user}
                          </span>
                          <span className="text-xs text-gray-400">
                            {comment.timeAgo}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-6">
                  No comments yet. Be the first to share your thoughts!
                </p>
              )}

              <div className="flex gap-3 items-start pt-4 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <button className="bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-full transition shrink-0">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
