import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { useMemo } from "react";

const DIACRITICS_RE = /\p{M}+/gu;

export function normalize(s: string): string {
  return (s ?? "")
    .toString()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export interface FuzzyKey<T> {
  name: string;
  weight?: number;
  get?: (item: T) => string;
}

const BASE_FUSE_OPTIONS: Partial<IFuseOptions<unknown>> = {
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 1,
};

export function useFuzzySearch<T>(
  items: T[],
  query: string,
  keys: ReadonlyArray<FuzzyKey<T>>,
  threshold = 0.4,
): T[] {
  const fuse = useMemo(() => {
    const fuseKeys: FuseOptionKey<T>[] = keys.map((k) => ({
      name: k.name,
      weight: k.weight ?? 1,
      getFn: (item: T) => {
        const raw = k.get ? k.get(item) : (item as unknown as Record<string, unknown>)[k.name];
        return normalize(String(raw ?? ""));
      },
    }));
    return new Fuse(items, { ...BASE_FUSE_OPTIONS, threshold, keys: fuseKeys });
  }, [items, threshold, keys]);

  return useMemo(() => {
    const q = normalize(query);
    if (!q) return items;
    return fuse.search(q).map((r) => r.item);
  }, [fuse, query, items]);
}
