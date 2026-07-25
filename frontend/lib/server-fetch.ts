const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const REVALIDATE_SECONDS = 6 * 60 * 60;

/**
 * ISR-cached list GET against the backend, tagged so `/api/revalidate` can bust it.
 *
 * `key` is the property wrapping the array (`{ ebooks: [...] }`); pass "" for
 * endpoints that return a bare array. Any failure yields [] so a flaky backend
 * degrades to an empty section instead of a 500.
 */
export async function fetchList<T>(path: string, tag: string, key: string): Promise<T[]> {
  try {
    const res = await fetch(`${API_BASE}/api${path}`, { next: { revalidate: REVALIDATE_SECONDS, tags: [tag] } });
    if (!res.ok) return [];
    const data = await res.json();
    const list = key ? data?.[key] : data;
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error(`Lỗi khi tải ${tag}:`, err);
    return [];
  }
}
