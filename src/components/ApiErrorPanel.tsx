import React from 'react';
import { GoogleBooksError } from '../services/googleBooks';

interface ApiErrorPanelProps {
  error: unknown;
  onRetry: () => void;
}

export function ApiErrorPanel({ error, onRetry }: ApiErrorPanelProps) {
  const isRateLimit =
    error instanceof GoogleBooksError && error.status === 429;
  const missingApiKey =
    isRateLimit &&
    error instanceof GoogleBooksError &&
    (error.usesSharedQuota || !__BOOKS_API_KEY_CONFIGURED__);
  const ownQuotaExceeded = isRateLimit && !missingApiKey;

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-4">
      <p className="text-gray-900 font-semibold text-lg mb-2">
        {missingApiKey ?
          'Google Books rate limit reached' :
          ownQuotaExceeded ?
            'Google Books daily quota exceeded' :
            'Could not load cookbooks'}
      </p>

      {missingApiKey ?
        <>
          <p className="text-gray-600 mb-6">
            Requests without your own API key share a global quota that gets
            exhausted quickly. Add a free Google Books API key to fix this.
          </p>
          <ol className="text-left text-sm text-gray-600 space-y-2 mb-6 list-decimal list-inside">
            <li>
              Enable the{' '}
              <a
                href="https://console.cloud.google.com/apis/library/books.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline">

                Books API
              </a>{' '}
              in Google Cloud Console
            </li>
            <li>
              Create an API key under{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 underline">

                Credentials
              </a>
            </li>
            <li>
              Copy{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.env.example</code>{' '}
              to{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">.env.local</code>
            </li>
            <li>
              Set{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">GOOGLE_BOOKS_API_KEY=your_key</code>
            </li>
            <li>Restart the dev server after changing env files</li>
          </ol>
        </> :
        ownQuotaExceeded ?
          <p className="text-gray-600 mb-6">
            Your API key is configured and being used, but its daily request
            limit has been reached. Quota resets at midnight Pacific Time. Try
            again tomorrow, or request a higher limit in Google Cloud Console.
          </p> :

          <p className="text-gray-600 mb-6">
            {error instanceof Error ?
              error.message :
              'Something went wrong while fetching cookbooks.'}
          </p>
      }

      <button
        onClick={onRetry}
        className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 transition">

        Try again
      </button>
    </div>);

}
