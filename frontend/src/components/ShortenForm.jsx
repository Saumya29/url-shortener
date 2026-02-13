'use client';

import { useState } from 'react';
import { shortenUrl } from '../lib/api';
import CopyButton from './CopyButton';

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function isValidUrl(str) {
    try {
      const parsed = new URL(str);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL.');
      return;
    }
    if (!isValidUrl(url.trim())) {
      setError('Please enter a valid URL (including http:// or https://).');
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl(url.trim());
      setResult(data);
      setUrl('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/very-long-url"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 bg-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </form>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-between gap-3">
          <a
            href={result.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium hover:underline truncate"
          >
            {result.shortUrl}
          </a>
          <CopyButton text={result.shortUrl} />
        </div>
      )}
    </div>
  );
}
