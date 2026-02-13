'use client';

import { useState, useEffect } from 'react';
import { getUrls, deleteUrl } from '../lib/api';
import UrlCard from './UrlCard';

export default function UrlList() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchUrls() {
    setLoading(true);
    setError('');
    try {
      const data = await getUrls();
      setUrls(data.urls || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUrls();
  }, []);

  async function handleDelete(shortCode) {
    try {
      await deleteUrl(shortCode);
      setUrls((prev) => prev.filter((u) => u.shortCode !== shortCode));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Your URLs</h2>
        <button
          onClick={fetchUrls}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600">{error}</p>
      )}

      {loading && urls.length === 0 ? (
        <div className="text-center py-12 text-gray-400">Loading URLs...</div>
      ) : urls.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No shortened URLs yet. Go shorten one!
        </div>
      ) : (
        <div className="space-y-3">
          {urls.map((url) => (
            <UrlCard key={url.shortCode} url={url} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
