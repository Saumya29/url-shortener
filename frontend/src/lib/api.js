const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function shortenUrl(originalUrl) {
  const res = await fetch(`${API_BASE}/api/urls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ originalUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to shorten URL');
  }
  return res.json();
}

export async function getUrls() {
  const res = await fetch(`${API_BASE}/api/urls`);
  if (!res.ok) throw new Error('Failed to fetch URLs');
  return res.json();
}

export async function deleteUrl(shortCode) {
  const res = await fetch(`${API_BASE}/api/urls/${shortCode}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete URL');
}
