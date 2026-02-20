import React, { useEffect, useRef } from 'react';
import { XIcon } from 'lucide-react';
interface CategoryModalProps {
  title: string;
  items: {
    name: string;
    image: string;
  }[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: string) => void;
}
export function CategoryModal({
  title,
  items,
  isOpen,
  onClose,
  onSelect
}: CategoryModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}>

      <div
        ref={modalRef}
        className="bg-neutral-100 rounded-xl shadow-2xl w-[75%] overflow-hidden animate-[fadeScaleIn_0.2s_ease-out] max-h-[80vh] flex flex-col">

        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close modal">

            <XIcon size={24} />
          </button>
        </div>
        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) =>
            <button
              key={item.name}
              onClick={() => onSelect(item.name)}
              className="group relative h-40 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">

                <div className="absolute inset-0">
                  <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <span className="text-white text-xl font-bold text-center drop-shadow-md">
                    {item.name}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

}