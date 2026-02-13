import './globals.css';

export const metadata = {
  title: 'URL Shortener',
  description: 'Shorten your URLs quickly',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
