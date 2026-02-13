import Link from 'next/link';
import ShortenForm from '../components/ShortenForm';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
          URL <span className="text-indigo-600">Shortener</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto">
          Paste a long URL and get a short, shareable link instantly.
        </p>
      </div>

      <ShortenForm />

      <Link
        href="/dashboard"
        className="mt-10 text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
      >
        View all shortened URLs &rarr;
      </Link>
    </main>
  );
}
