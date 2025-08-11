import React from 'react';
import { XIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { Cookbook } from '../utils/types';
import { TagPill } from './TagPill';
interface CookbookModalProps {
  cookbook: Cookbook;
  onClose: () => void;
}
export const CookbookModal: React.FC<CookbookModalProps> = ({
  cookbook,
  onClose
}) => {
  return <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Cookbook Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex gap-6">
            <div className="w-1/3">
              <img src={cookbook.imageUrl} alt={cookbook.title} className="w-full aspect-[3/4] object-cover rounded-sm" />
            </div>
            <div className="w-2/3">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {cookbook.title}
              </h1>
              <p className="text-gray-600 mb-4">by {cookbook.author}</p>
              <p className="text-gray-700 mb-6">{cookbook.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {cookbook.tags.map(tag => <TagPill key={tag} tag={tag} />)}
              </div>
              <div className="flex gap-4">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors">
                  <HeartIcon size={18} />
                  <span>Favorite</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-sm hover:bg-gray-200 transition-colors">
                  <ShareIcon size={18} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">
              Additional Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Published</p>
                <p>{cookbook.publishedDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Votes</p>
                <p>{cookbook.votes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};