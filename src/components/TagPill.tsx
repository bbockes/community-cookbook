import React from 'react';
interface TagPillProps {
  tag: string;
  onClick?: () => void;
  active?: boolean;
  variant?: 'rounded' | 'square';
}
export const TagPill: React.FC<TagPillProps> = ({
  tag,
  onClick,
  active = false,
  variant = 'rounded'
}) => {
  const roundedClass = variant === 'rounded' ? 'rounded-full' : 'rounded-sm';
  return <button onClick={onClick} className={`text-xs px-2.5 py-1 ${roundedClass} transition-all duration-200 ${active ? 'bg-navy text-white font-medium' : 'bg-white/80 backdrop-blur-sm text-charcoal hover:bg-white hover:shadow-sm'}`}>
      {tag}
    </button>;
};