import React, { useEffect, useState } from 'react';
import { XIcon, PlusIcon, Loader2Icon, ImageIcon } from 'lucide-react';
import { bulkLookupCookbooks, lookupCookbook } from '../services/cookbookApi';
import { Cookbook } from '../types/cookbook';

type AddCookbookModalProps = {
  onClose: () => void;
  onAdded: (book: Cookbook, meta?: { alreadyExists?: boolean }) => void;
};

type Tab = 'single' | 'bulk';

function parseBulkLine(line: string): {
  title?: string;
  author?: string;
  isbn13?: string;
  isbn10?: string;
} {
  const trimmed = line.trim();
  if (!trimmed) return {};

  const parts = trimmed.split('|').map((p) => p.trim());
  if (parts.length >= 2) {
    return { title: parts[0], author: parts[1], isbn13: parts[2] || undefined };
  }

  const isbnMatch = trimmed.match(/^(97[89]\d{10}|\d{9}[\dXx])$/);
  if (isbnMatch) {
    const isbn = isbnMatch[1];
    if (isbn.length === 13) return { isbn13: isbn };
    return { isbn10: isbn };
  }

  const byMatch = trimmed.match(/^(.+?)\s+by\s+(.+)$/i);
  if (byMatch) {
    return { title: byMatch[1].trim(), author: byMatch[2].trim() };
  }

  return { title: trimmed };
}

export function AddCookbookModal({ onClose, onAdded }: AddCookbookModalProps) {
  const [tab, setTab] = useState<Tab>('single');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkResults, setBulkResults] = useState<
    Array<{ title: string; status: string; error?: string }> | null
  >(null);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(null);
      return;
    }
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverFile(file);
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const isbnClean = isbn.replace(/[-\s]/g, '');
      const isbn13 = isbnClean.length === 13 ? isbnClean : undefined;
      const isbn10 = isbnClean.length === 10 ? isbnClean : undefined;

      const result = await lookupCookbook(
        {
          title: title.trim() || undefined,
          author: author.trim() || undefined,
          isbn13,
          isbn10,
        },
        coverFile ?? undefined
      );

      onAdded(result.book, { alreadyExists: result.alreadyExists });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add cookbook');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBulkResults(null);
    setIsLoading(true);

    try {
      const lines = bulkText.split('\n').filter((l) => l.trim());
      const entries = lines.map(parseBulkLine).filter((e) => Object.keys(e).length > 0);

      if (entries.length === 0) {
        setError('Add at least one line');
        return;
      }

      const result = await bulkLookupCookbooks({ entries, delayMs: 300 });
      setBulkResults(result.results);

      const created = result.results.find((r) => r.status === 'created' || r.status === 'existing');
      if (created?.book) onAdded(created.book);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk import failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div
        role="dialog"
        aria-labelledby="add-cookbook-title"
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="add-cookbook-title" className="text-xl font-semibold text-gray-900">
            Add Cookbook
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <XIcon size={22} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex gap-2 mb-4">
            {(['single', 'bulk'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                  tab === t
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t === 'single' ? 'Single' : 'Bulk import'}
              </button>
            ))}
          </div>

          {tab === 'single' ? (
            <form onSubmit={handleSingleSubmit} className="space-y-4 pb-6">
              <p className="text-sm text-gray-500">
                Enter a title, author, and/or ISBN. Optionally upload a cover image —
                otherwise we use Google Books. Categories are assigned automatically.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Mastering the Art of French Cooking"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Julia Child"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="9780394721781"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover image <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <div className="flex items-start gap-4">
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 hover:border-amber-400 hover:bg-amber-50/50 transition">
                    <ImageIcon size={18} className="shrink-0 text-gray-400" />
                    <span>{coverFile ? coverFile.name : 'Choose an image…'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleCoverChange}
                      className="sr-only"
                    />
                  </label>
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="h-24 w-24 shrink-0 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || (!title.trim() && !author.trim() && !isbn.trim())}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <Loader2Icon size={18} className="animate-spin" />
                ) : (
                  <PlusIcon size={18} />
                )}
                {isLoading ? 'Looking up…' : 'Add cookbook'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleBulkSubmit} className="space-y-4 pb-6">
              <p className="text-sm text-gray-500">
                One book per line. Formats:{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">Title by Author</code>,{' '}
                <code className="text-xs bg-gray-100 px-1 rounded">Title | Author | ISBN</code>, or
                just an ISBN.
              </p>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={8}
                placeholder={'Salt Fat Acid Heat by Samin Nosrat\n9781476753836\nThe Food Lab | Kenji Lopez-Alt'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              {bulkResults && (
                <div className="text-sm space-y-1 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {bulkResults.map((r, i) => (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="truncate">{r.title}</span>
                      <span
                        className={
                          r.status === 'created'
                            ? 'text-green-600 shrink-0'
                            : r.status === 'existing' || r.status === 'cached'
                              ? 'text-amber-600 shrink-0'
                              : r.status === 'not_found'
                                ? 'text-amber-600 shrink-0'
                                : 'text-red-600 shrink-0'
                        }
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !bulkText.trim()}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white py-2.5 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <Loader2Icon size={18} className="animate-spin" />
                ) : (
                  <PlusIcon size={18} />
                )}
                {isLoading ? 'Importing…' : 'Import all'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
