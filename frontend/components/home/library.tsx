"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, Search, X } from "lucide-react";
import type { Ebook } from "@/lib/types";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";
import { kanjiNumber } from "@/lib/site";
import { SectionHeading } from "@/components/site/section-heading";
import { BookCard } from "./book-card";

const BATCH = 30;

const SEARCH_KEYS: ReadonlyArray<FuzzyKey<Ebook>> = [
  { name: "name", weight: 3 },
  { name: "author", weight: 2 },
  { name: "illustrator", weight: 1 },
  { name: "publisher", weight: 1, get: (b) => b.publisher?.name ?? "" },
];

type SortKey = "added" | "release" | "title";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "added", label: "Mới lên kệ" },
  { key: "release", label: "Ngày phát hành" },
  { key: "title", label: "Tên sách" },
];

function time(value: string | undefined) {
  const ms = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(ms) ? 0 : ms;
}

interface LibraryProps {
  ebooks: Ebook[];
  /** Opens the detail view for `id`, with `list` as the prev/next order. */
  onOpen: (list: Ebook[], id: string) => void;
}

export function Library({ ebooks, onOpen }: LibraryProps) {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [publisher, setPublisher] = useState("all");
  const [sort, setSort] = useState<SortKey>("added");
  const [shown, setShown] = useState(BATCH);
  const searchRef = useRef<HTMLInputElement>(null);

  // Accession numbers: oldest upload is № 001.
  const numbers = useMemo(() => {
    const ordered = ebooks.slice().sort((a, b) => time(a.createdAt) - time(b.createdAt));
    return new Map(ordered.map((b, i) => [b._id, i + 1]));
  }, [ebooks]);

  const publishers = useMemo(() => {
    const counts = new Map<string, { id: string; name: string; count: number }>();
    for (const book of ebooks) {
      const p = book.publisher;
      if (!p?._id) continue;
      const entry = counts.get(p._id);
      if (entry) entry.count++;
      else counts.set(p._id, { id: p._id, name: p.name, count: 1 });
    }
    return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [ebooks]);

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(rawQuery);
      setShown(BATCH);
    }, 140);
    return () => clearTimeout(id);
  }, [rawQuery]);

  // "/" focuses search, Escape clears and leaves it.
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

  const byPublisher = useMemo(() => (publisher === "all" ? ebooks : ebooks.filter((b) => b.publisher?._id === publisher)), [ebooks, publisher]);
  const matched = useFuzzySearch(byPublisher, query, SEARCH_KEYS, 0.35);

  const results = useMemo(() => {
    // With a query and the default sort, keep the fuzzy relevance order.
    if (query.trim() && sort === "added") return matched;
    const list = matched.slice();
    if (sort === "added") list.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    else if (sort === "release") list.sort((a, b) => time(b.releaseDate) - time(a.releaseDate));
    else list.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    return list;
  }, [matched, sort, query]);

  const visible = results.slice(0, shown);
  const hasMore = shown < results.length;

  const open = useCallback((id: string) => onOpen(results, id), [onOpen, results]);

  const choosePublisher = (id: string) => {
    setPublisher(id);
    setShown(BATCH);
  };

  const chooseSort = (key: SortKey) => {
    setSort(key);
    setShown(BATCH);
  };

  const reset = () => {
    setRawQuery("");
    setQuery("");
    setPublisher("all");
    setShown(BATCH);
  };

  const filtered = publisher !== "all" || query.trim().length > 0;

  return (
    <section id="library" className="relative scroll-mt-16 overflow-x-clip bg-paper pb-28 pt-24 lg:pb-40 lg:pt-36">
      <span
        aria-hidden
        lang="ja"
        className="text-outline pointer-events-none absolute -right-[3vw] top-10 select-none font-mincho text-[30vw] font-extrabold leading-none text-sumi/[0.09] lg:top-16 lg:text-[19vw]"
      >
        蔵書
      </span>

      <div className="relative mx-auto max-w-[100rem] px-5 sm:px-8 lg:px-14">
        <SectionHeading
          mark="壱"
          label="Thư viện"
          title={
            <>
              Tủ sách <em className="font-light italic">chia sẻ</em>
            </>
          }
        >
          <span lang="ja" className="font-mincho font-bold text-sumi">
            {kanjiNumber(ebooks.length)}冊
          </span>{" "}
          — {ebooks.length} cuốn light novel bản gốc tiếng Nhật từ {publishers.length} nhà xuất bản. Nhấn vào bìa để xem chi tiết, hoặc bấm{" "}
          <span lang="ja" className="font-mincho font-bold text-sumi">
            読む
          </span>{" "}
          để đọc ngay.
        </SectionHeading>

        {/* Toolbar */}
        <div className="sticky top-14 z-20 -mx-5 mt-10 border-b border-sumi/15 bg-paper/88 px-5 pb-3 pt-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:top-16 lg:-mx-14 lg:mt-14 lg:px-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
            <label className="group relative flex h-11 flex-1 items-center gap-3 border-b border-sumi/30 transition-colors focus-within:border-sumi">
              <Search className="size-4 shrink-0 text-sumi-mute transition-colors group-focus-within:text-shu" strokeWidth={1.75} />
              <input
                ref={searchRef}
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
                placeholder="Tìm theo tên sách, tác giả, họa sĩ…"
                aria-label="Tìm kiếm sách"
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

            <div role="radiogroup" aria-label="Sắp xếp" className="flex shrink-0 items-center gap-1 font-label text-[10.5px] uppercase tracking-[0.16em]">
              {SORTS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="radio"
                  aria-checked={sort === option.key}
                  onClick={() => chooseSort(option.key)}
                  className={`h-8 rounded-full px-3.5 transition-colors ${sort === option.key ? "bg-sumi text-paper" : "text-sumi-soft hover:bg-sumi/8 hover:text-sumi"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="no-scrollbar -mx-5 mt-3 flex gap-1.5 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-wrap lg:px-0">
            <PublisherChip label="Tất cả" count={ebooks.length} active={publisher === "all"} onClick={() => choosePublisher("all")} />
            {publishers.map((p) => (
              <PublisherChip key={p.id} label={p.name} count={p.count} active={publisher === p.id} onClick={() => choosePublisher(p.id)} />
            ))}
          </div>
        </div>

        {/* Result line */}
        <div className="mt-6 flex items-baseline justify-between font-label text-[10.5px] uppercase tracking-[0.2em] text-sumi-mute" aria-live="polite">
          <span>
            <span className="text-sm tabular-nums text-sumi">{results.length}</span> cuốn
            {filtered && <span> / {ebooks.length}</span>}
          </span>
          {filtered && (
            <button type="button" onClick={reset} className="link-sweep uppercase tracking-[0.2em] text-sumi">
              Bỏ lọc
            </button>
          )}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center py-28 text-center">
            <span lang="ja" className="font-mincho text-7xl font-extrabold text-sumi/15">
              無
            </span>
            <p className="mt-6 font-display text-2xl italic text-sumi">Không tìm thấy cuốn nào</p>
            <p className="mt-2 max-w-sm text-sm font-light text-sumi-soft">Thử từ khóa khác, hoặc bỏ bộ lọc nhà xuất bản. Nếu sách chưa có trên kệ, bạn có thể nhắn mình ở cuối trang.</p>
            <button type="button" onClick={reset} className="mt-7 inline-flex h-10 items-center rounded-full border border-sumi px-5 text-sm text-sumi transition-colors hover:bg-sumi hover:text-paper">
              Xem toàn bộ
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-11 sm:grid-cols-3 md:grid-cols-4 lg:gap-x-9 lg:gap-y-16 xl:grid-cols-5 2xl:grid-cols-6">
            {visible.map((book, i) => (
              <BookCard key={book._id} book={book} number={numbers.get(book._id) ?? 0} slot={i % BATCH} onOpen={open} />
            ))}
          </ul>
        )}

        {hasMore && (
          <div className="mt-16 flex flex-col items-center gap-4 lg:mt-24">
            <p className="font-label text-[10.5px] uppercase tracking-[0.2em] text-sumi-mute">
              Đang xem <span className="tabular-nums text-sumi">{visible.length}</span> / {results.length}
            </p>
            <button
              type="button"
              onClick={() => setShown((n) => n + BATCH)}
              className="group inline-flex h-14 items-center gap-4 rounded-full border border-sumi pl-8 pr-2.5 text-sm font-medium text-sumi transition-colors duration-300 hover:bg-sumi hover:text-paper"
            >
              Xem thêm {Math.min(BATCH, results.length - visible.length)} cuốn
              <span className="grid size-9 place-items-center rounded-full bg-sumi text-paper transition-colors duration-300 group-hover:bg-shu">
                <ArrowDown className="size-4" strokeWidth={1.75} />
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function PublisherChip({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[13px] transition-colors ${
        active ? "border-shu bg-shu text-paper" : "border-sumi/20 text-sumi-soft hover:border-sumi hover:text-sumi"
      }`}
    >
      {label}
      <span className={`font-label text-[10px] tabular-nums ${active ? "text-paper/80" : "text-sumi-mute"}`}>{count}</span>
    </button>
  );
}
