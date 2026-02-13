import Link from 'next/link';
import UrlList from '../../components/UrlList';

export default function Dashboard() {
  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/"
          className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
        >
          &larr; Back to home
        </Link>
      </div>

      <UrlList />
    </main>
  );
}
