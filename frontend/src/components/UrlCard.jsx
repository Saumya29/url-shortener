import CopyButton from './CopyButton';

export default function UrlCard({ url, onDelete }) {
  const createdDate = new Date(url.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <a
            href={url.shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium hover:underline"
          >
            {url.shortUrl}
          </a>
          <p className="mt-1 text-sm text-gray-500 truncate" title={url.originalUrl}>
            {url.originalUrl}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span>{createdDate}</span>
            {url.clickCount !== undefined && (
              <span>{url.clickCount} click{url.clickCount !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CopyButton text={url.shortUrl} />
          <button
            onClick={() => onDelete(url.shortCode)}
            className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-red-100 text-red-700 hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
