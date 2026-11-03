"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Search, X } from "lucide-react";
import type { Hako } from "@/lib/types";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";
import { decodeEntities, formatDotDate, readerUrlForEpub } from "@/lib/site";
import { scrollToRef } from "@/lib/utils";

const PAGE_SIZE = 25;

type SortKey = "name" | "uploader" | "translator" | "lastUpdated";
type SortDir = "asc" | "desc";
type Filter = "all" | "epub" | "pdf";

interface IndexedHako extends Hako {
  _lastUpdatedTs: number;
}

const SEARCH_KEYS: ReadonlyArray<FuzzyKey<IndexedHako>> = [
  { name: "name", weight: 3 },
  { name: "uploader", weight: 1 },
  { name: "translator", weight: 1 },
  { name: "hakoId", weight: 2, get: (h) => h.hakoId ?? "" },
];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "epub", label: "EPUB" },
  { key: "pdf", label: "PDF" },
];

const COLUMNS = "lg:grid-cols-[3.25rem_minmax(0,1fr)_10rem_11rem_6.5rem_13.5rem]";

export function HakoArchive({ items: initialItems }: { items: Hako[] }) {
  // Timestamps are precomputed once: re-parsing lastUpdated inside the comparator
  // would cost thousands of Date parses per sort on a 5k-row archive.
  const items = useMemo<IndexedHako[]>(
    () =>
      initialItems.map<IndexedHako>((h) => ({
        ...h,
        name: decodeEntities(h.name),
        uploader: decodeEntities(h.uploader ?? ""),
        translator: decodeEntities(h.translator ?? ""),
        _lastUpdatedTs: h.lastUpdated ? new Date(h.lastUpdated).getTime() : Number.NEGATIVE_INFINITY,
      })),
    [initialItems],
  );

  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastUpdated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const searchRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Debounced query; a new search always restarts at page 1.
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 150);
    return () => clearTimeout(id);
  }, [rawQuery]);

  // "/" focuses search, Escape blurs it.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (event.key === "Escape" && document.activeElement === searchRef.current) {
        searchRef.current?.blur();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fileFiltered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((h) => (filter === "epub" ? !!h.epub : !!h.pdf));
  }, [items, filter]);

  const matched = useFuzzySearch(fileFiltered, query, SEARCH_KEYS);

  const sorted = useMemo(() => {
    // Keep the fuzzy relevance ranking until the visitor picks a sort of their own.
    if (query.trim().length > 0 && sortKey === "lastUpdated" && sortDir === "desc") return matched;
    const list = matched.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortKey === "lastUpdated") {
      list.sort((a, b) => (a._lastUpdatedTs - b._lastUpdatedTs) * dir);
    } else {
      list.sort((a, b) => (a[sortKey] ?? "").localeCompare(b[sortKey] ?? "", "vi", { sensitivity: "base" }) * dir);
    }
    return list;
  }, [matched, sortKey, sortDir, query]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(offset, offset + PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "lastUpdated" ? "desc" : "asc");
    }
  };

  const goTo = (next: number) => {
    setPage(Math.min(totalPages, Math.max(1, next)));
    scrollToRef(topRef, 150);
  };

  const narrowed = query.trim().length > 0 || filter !== "all";

  return (
    <section className="bg-paper pb-28 lg:pb-40">
      {/* Toolbar */}
      <div className="sticky top-14 z-20 border-b border-sumi/15 bg-paper/88 backdrop-blur-md lg:top-16">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-3 px-5 py-4 sm:px-8 md:flex-row md:items-center md:gap-8 lg:px-14">
          <label className="group relative flex h-11 flex-1 items-center gap-3 border-b border-sumi/30 transition-colors focus-within:border-sumi">
            <Search className="size-4 shrink-0 text-sumi-mute transition-colors group-focus-within:text-shu" strokeWidth={1.75} />
            <input
              ref={searchRef}
              value={rawQuery}
              onChange={(e) => setRawQuery(e.target.value)}
              placeholder="Tìm theo tên truyện, người dịch, nhóm dịch hoặc ID…"
              aria-label="Tìm kiếm trong kho Hako"
              className="h-full w-full min-w-0 bg-transparent text-[15px] text-sumi outline-none placeholder:font-light placeholder:text-sumi-mute"
            />
            {rawQuery ? (
              <button type="button" onClick={() => setRawQuery("")} aria-label="Xóa tìm kiếm" className="grid size-7 place-items-center rounded-full text-sumi-mute hover:bg-sumi/10 hover:text-sumi">
                <X className="size-3.5" />
              </button>
            ) : (
              <kbd className="hidden rounded border border-sumi/20 px-1.5 py-0.5 font-label text-[10px] text-sumi-mute sm:block">/</kbd>
            )}
          </label>

          <div role="radiogroup" aria-label="Lọc theo định dạng" className="flex shrink-0 items-center gap-1 font-label text-[10.5px] uppercase tracking-[0.16em]">
            {FILTERS.map((option) => (
              <button
                key={option.key}
                type="button"
                role="radio"
                aria-checked={filter === option.key}
                onClick={() => {
                  setFilter(option.key);
                  setPage(1);
                }}
                className={`h-8 rounded-full px-4 transition-colors ${filter === option.key ? "bg-sumi text-paper" : "text-sumi-soft hover:bg-sumi/8 hover:text-sumi"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div ref={topRef} className="mx-auto max-w-[100rem] px-5 pt-7 sm:px-8 lg:px-14">
        {/* Result line */}
        <div className="flex items-baseline justify-between font-label text-[10.5px] uppercase tracking-[0.2em] text-sumi-mute" aria-live="polite">
          <span>
            <span className="text-sm tabular-nums text-sumi">{sorted.length.toLocaleString("vi-VN")}</span> kết quả
            {narrowed && <span> / {items.length.toLocaleString("vi-VN")}</span>}
          </span>
          {totalPages > 1 && (
            <span className="tabular-nums">
              Trang <span className="text-sumi">{safePage}</span> / {totalPages}
            </span>
          )}
        </div>

        {/* Column heads */}
        <div className={`mt-5 hidden items-center gap-x-6 border-b border-sumi pb-3 font-label text-[10px] uppercase tracking-[0.22em] text-sumi-mute lg:grid ${COLUMNS}`}>
          <span>№</span>
          <SortHead label="Tên truyện" active={sortKey === "name"} dir={sortDir} onClick={() => handleSort("name")} />
          <SortHead label="Dịch giả" active={sortKey === "uploader"} dir={sortDir} onClick={() => handleSort("uploader")} />
          <SortHead label="Nhóm dịch" active={sortKey === "translator"} dir={sortDir} onClick={() => handleSort("translator")} />
          <SortHead label="Cập nhật" active={sortKey === "lastUpdated"} dir={sortDir} onClick={() => handleSort("lastUpdated")} />
          <span className="text-right">Tệp</span>
        </div>

        {/* Mobile sort */}
        <div className="no-scrollbar -mx-5 mt-4 flex gap-1.5 overflow-x-auto border-b border-sumi px-5 pb-3 sm:-mx-8 sm:px-8 lg:hidden">
          {(
            [
              ["lastUpdated", "Cập nhật"],
              ["name", "Tên"],
              ["uploader", "Dịch giả"],
              ["translator", "Nhóm dịch"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSort(key)}
              aria-pressed={sortKey === key}
              className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors ${
                sortKey === key ? "border-sumi bg-sumi text-paper" : "border-sumi/20 text-sumi-soft"
              }`}
            >
              {label}
              {sortKey === key && (sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
            </button>
          ))}
        </div>

        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <span lang="ja" className="font-mincho text-7xl font-extrabold text-sumi/15">
              無
            </span>
            <p className="mt-6 font-display text-2xl italic text-sumi">Không tìm thấy kết quả</p>
            <p className="mt-2 text-sm font-light text-sumi-soft">Thử bỏ bớt từ khóa hoặc đổi bộ lọc định dạng.</p>
          </div>
        ) : (
          <ul key={`${safePage}-${sortKey}-${sortDir}-${filter}-${query}`}>
            {pageItems.map((h, i) => (
              <li
                key={h._id}
                style={{ "--slot": i } as React.CSSProperties}
                className={`hako-row group grid grid-cols-1 gap-x-6 gap-y-3 border-b border-sumi/12 py-4 transition-colors hover:bg-paper-deep/55 lg:items-center lg:py-[1.05rem] ${COLUMNS}`}
              >
                <span className="hidden font-label text-[11px] tabular-nums text-sumi-mute lg:block">{String(offset + i + 1).padStart(4, "0")}</span>

                <div className="min-w-0">
                  <p className="text-[15px] font-medium leading-snug text-sumi transition-colors group-hover:text-shu">{h.name}</p>
                  <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs font-light text-sumi-soft lg:hidden">
                    {h.uploader && <span>{h.uploader}</span>}
                    {h.translator && <span className="text-sumi-mute">{h.translator}</span>}
                    {h.lastUpdated && <span className="font-label tabular-nums text-sumi-mute">{formatDotDate(h.lastUpdated)}</span>}
                  </p>
                </div>

                <span className="hidden truncate text-sm font-light text-sumi-soft lg:block" title={h.uploader || undefined}>
                  {h.uploader || "—"}
                </span>
                <span className="hidden truncate text-sm font-light text-sumi-soft lg:block" title={h.translator || undefined}>
                  {h.translator || "—"}
                </span>
                <span className="hidden font-label text-xs tabular-nums text-sumi-mute lg:block">{formatDotDate(h.lastUpdated)}</span>

                <div className="flex items-center gap-1.5 lg:justify-end">
                  <FileLink
                    href={h.hakoId && h.epub ? readerUrlForEpub(`https://r2.ranobe.vn/hako/epub/${h.hakoId}.epub`) : null}
                    label="Đọc"
                    primary
                  />
                  <FileLink href={h.epub} label="EPUB" />
                  <FileLink href={h.pdf} label="PDF" />
                </div>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && <Pager page={safePage} total={totalPages} onChange={goTo} />}
      </div>
    </section>
  );
}

function SortHead({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-left uppercase tracking-[0.22em] transition-colors ${active ? "text-sumi" : "hover:text-sumi"}`}
    >
      {label}
      {active && (dir === "asc" ? <ArrowUp className="size-3 text-shu" /> : <ArrowDown className="size-3 text-shu" />)}
    </button>
  );
}

function FileLink({ href, label, primary }: { href: string | null; label: string; primary?: boolean }) {
  const base = "inline-flex h-8 items-center rounded-full px-3.5 font-label text-[10.5px] uppercase tracking-[0.14em] transition-colors";
  if (!href) {
    return (
      <span aria-disabled className={`${base} border border-dashed border-sumi/15 text-sumi/25`}>
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${primary ? "bg-sumi text-paper hover:bg-shu" : "border border-sumi/30 text-sumi hover:border-sumi hover:bg-sumi hover:text-paper"}`}
    >
      {label}
    </a>
  );
}

function pageWindow(page: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "gap")[] = [1];
  const start = Math.max(2, Math.min(page - 1, total - 4));
  const end = Math.min(total - 1, Math.max(page + 1, 5));
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("gap");
  pages.push(total);
  return pages;
}

function Pager({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  return (
    <nav aria-label="Phân trang" className="mt-10 flex items-center justify-between gap-4">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Trang trước" className="round-btn disabled:pointer-events-none disabled:opacity-30">
        <ArrowLeft className="size-4" strokeWidth={1.5} />
      </button>
      <ol className="flex items-center gap-1 font-label text-xs tabular-nums">
        {pageWindow(page, total).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-sumi-mute">
              …
            </li>
          ) : (
            <li key={p} className={Math.abs(p - page) > 1 && p !== 1 && p !== total ? "hidden sm:block" : undefined}>
              <button
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={`grid h-9 min-w-9 place-items-center rounded-full px-2 transition-colors ${
                  p === page ? "bg-shu text-paper" : "text-sumi-soft hover:bg-sumi/8 hover:text-sumi"
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= total} aria-label="Trang sau" className="round-btn disabled:pointer-events-none disabled:opacity-30">
        <ArrowRight className="size-4" strokeWidth={1.5} />
      </button>
    </nav>
  );
}
