"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Hako } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, Download, Search, UserPen, X } from "lucide-react";
import { cn, scrollToRef } from "@/lib/utils";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";

const PAGE_SIZE = 25;

const HAKO_SEARCH_KEYS: ReadonlyArray<FuzzyKey<IndexedHako>> = [
  { name: "name", weight: 3 },
  { name: "uploader", weight: 1 },
  { name: "translator", weight: 1 },
  { name: "hakoId", weight: 2, get: (h) => h.hakoId ?? "" },
];

type SortKey = "name" | "uploader" | "translator" | "lastUpdated";
type SortDir = "asc" | "desc";
type Filter = "all" | "epub" | "pdf";

interface IndexedHako extends Hako {
  _lastUpdatedTs: number;
}

interface HakoTableInteractiveProps {
  initialItems: Hako[];
}

export function HakoTableInteractive({ initialItems }: HakoTableInteractiveProps) {
  // Timestamps are precomputed once: re-parsing lastUpdated inside the comparator
  // would cost thousands of Date parses per sort on a 5k-row archive.
  const items = useMemo<IndexedHako[]>(
    () =>
      initialItems.map<IndexedHako>((h) => ({
        ...h,
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
  const tableTopRef = useRef<HTMLDivElement>(null);

  // Debounced query; a new search always restarts at page 1.
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(rawQuery);
      setPage(1);
    }, 150);
    return () => clearTimeout(id);
  }, [rawQuery]);

  // Keyboard shortcut: "/" focuses search, Escape blurs it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      } else if (e.key === "Escape" && document.activeElement === searchRef.current) {
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

  const filtered = useFuzzySearch(fileFiltered, query, HAKO_SEARCH_KEYS);

  const sorted = useMemo(() => {
    // Preserve fuzzy relevance ranking when the user hasn't picked a non-default sort.
    const hasQuery = query.trim().length > 0;
    const arr = filtered.slice();
    const dir = sortDir === "asc" ? 1 : -1;
    if (hasQuery && sortKey === "lastUpdated" && sortDir === "desc") {
      return arr;
    }
    if (sortKey === "lastUpdated") {
      arr.sort((a, b) => (a._lastUpdatedTs - b._lastUpdatedTs) * dir);
    } else {
      arr.sort((a, b) => {
        const av = (a[sortKey] ?? "") as string;
        const bv = (b[sortKey] ?? "") as string;
        return av.localeCompare(bv, "vi", { sensitivity: "base" }) * dir;
      });
    }
    return arr;
  }, [filtered, sortKey, sortDir, query]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    setPage(1);
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "lastUpdated" ? "desc" : "asc");
    }
  };

  const handleFilter = (next: Filter) => {
    setFilter(next);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    scrollToRef(tableTopRef, 80);
  };

  return (
    <>
      {/* === TOOLBAR (sticky, frosted) === */}
      <div className="sticky top-16 z-20 border-b border-stone-200/80 bg-[#fbf5ec]/85 backdrop-blur-md">
        <div className="mx-auto max-w-screen-xl px-4 py-3 md:px-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input
                ref={searchRef}
                value={rawQuery}
                onChange={(e) => setRawQuery(e.target.value)}
                placeholder="Tìm theo tên truyện, người dịch hoặc nhóm dịch..."
                className="h-11 rounded-full border-stone-300 bg-white pl-10 pr-20 text-base shadow-[0_1px_0_rgba(0,0,0,0.02)] focus-visible:border-orange-400 focus-visible:ring-orange-200"
                aria-label="Tìm kiếm"
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                {rawQuery ? (
                  <button
                    type="button"
                    onClick={() => setRawQuery("")}
                    className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-stone-500 shadow-sm sm:inline-block">
                    /
                  </kbd>
                )}
              </div>
            </div>

            <div className="inline-flex h-11 items-center gap-0.5 rounded-full border border-stone-300 bg-white p-1 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              {(["all", "epub", "pdf"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => handleFilter(f)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-medium transition",
                    filter === f ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow" : "text-stone-600 hover:bg-stone-100",
                  )}
                >
                  {f === "all" ? "Tất cả" : f === "epub" ? "EPUB" : "PDF"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === BODY === */}
      <section className="bg-[#fbf5ec] pb-20 pt-6">
        <div className="mx-auto max-w-screen-xl px-4 md:px-6">
          {/* Result band */}
          <div ref={tableTopRef} className="mb-4 flex items-baseline justify-between text-sm text-stone-500">
            <div>
              <span className="text-stone-700">
                <span className="font-mono text-lg font-semibold tracking-tight text-stone-900">{sorted.length.toLocaleString("vi-VN")}</span>
                <span className="ml-1.5 text-stone-500">kết quả</span>
              </span>
              {(query || filter !== "all") && items.length > 0 && (
                <span className="ml-2 text-stone-400">/ {items.length.toLocaleString("vi-VN")} tổng</span>
              )}
            </div>
            {totalPages > 1 && (
              <div className="font-mono text-xs uppercase tracking-widest text-stone-400">
                Trang {safePage} / {totalPages}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_8px_30px_-12px_rgba(120,53,15,0.12)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-stone-200 bg-stone-50/80 hover:bg-stone-50/80">
                  <SortableHead onClick={() => handleSort("name")} active={sortKey === "name"} dir={sortDir} className="pl-5">
                    Tên
                  </SortableHead>
                  <SortableHead
                    onClick={() => handleSort("uploader")}
                    active={sortKey === "uploader"}
                    dir={sortDir}
                    className="hidden w-[160px] lg:table-cell"
                  >
                    Dịch Giả
                  </SortableHead>
                  <SortableHead
                    onClick={() => handleSort("translator")}
                    active={sortKey === "translator"}
                    dir={sortDir}
                    className="hidden w-[180px] lg:table-cell"
                  >
                    Nhóm Dịch
                  </SortableHead>
                  <TableHead className="w-[260px] py-3 pr-5 text-right text-[11px] font-semibold uppercase tracking-widest text-stone-500">
                    {/* Actions */}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center text-stone-400">
                      <div className="mx-auto inline-flex flex-col items-center gap-2">
                        <Search className="size-8 text-stone-300" />
                        <div className="font-medium text-stone-500">Không tìm thấy kết quả</div>
                        <div className="text-xs text-stone-400">Thử bỏ bớt từ khoá hoặc đổi filter</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((h) => (
                    <TableRow key={h._id} className="group relative border-b border-stone-100 transition hover:bg-orange-50/40">
                      <TableCell className="relative min-w-[280px] max-w-[460px] whitespace-normal break-words py-4 pl-5 font-medium leading-snug text-stone-800">
                        {/* Accent bar on hover */}
                        <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-gradient-to-b from-orange-400 to-rose-500 transition-transform duration-200 group-hover:scale-y-100" />
                        {h.name}
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-stone-500 lg:hidden">
                          {h.uploader && (
                            <span className="inline-flex items-center gap-1">
                              <UserPen className="size-3 text-stone-400" />
                              {h.uploader}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        className="hidden w-[160px] max-w-[160px] truncate py-4 text-sm text-stone-600 lg:table-cell"
                        title={h.uploader || undefined}
                      >
                        {h.uploader || <span className="text-stone-300">—</span>}
                      </TableCell>
                      <TableCell
                        className="hidden w-[180px] max-w-[180px] truncate py-4 text-sm text-stone-600 lg:table-cell"
                        title={h.translator || undefined}
                      >
                        {h.translator || <span className="text-stone-300">—</span>}
                      </TableCell>
                      <TableCell className="w-[260px] py-4 pr-5 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          <ReadLink hakoId={h.hakoId} hasEpub={!!h.epub} />
                          <DownloadLink href={h.epub} label="EPUB" icon={<Download className="size-3.5" />} />
                          <DownloadLink href={h.pdf} label="PDF" icon={<Download className="size-3.5" />} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function SortableHead({
  onClick,
  active,
  dir,
  children,
  className,
}: {
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead className={cn("py-3 text-[11px] font-semibold uppercase tracking-widest", className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn("inline-flex items-center gap-1.5 transition", active ? "text-stone-900" : "text-stone-500 hover:text-stone-800")}
      >
        {children}
        {active ? dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-40" />}
      </button>
    </TableHead>
  );
}

function ReadLink({ hakoId, hasEpub }: { hakoId: string | null; hasEpub: boolean }) {
  if (!hakoId || !hasEpub) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-300">
        <BookOpen className="size-3.5" />
        Đọc
      </span>
    );
  }
  const href = `${process.env.NEXT_PUBLIC_API_URL}/reader?book=https://r2.ranobe.vn/hako/epub/${hakoId}.epub`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-orange-500 bg-gradient-to-br from-orange-500 to-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm transition hover:from-orange-600 hover:to-rose-600 hover:shadow"
    >
      <BookOpen className="size-3.5" />
      Đọc
    </a>
  );
}

function DownloadLink({ href, label, icon }: { href: string | null; label: string; icon: React.ReactNode }) {
  if (!href) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[11px] font-medium text-stone-300">
        {icon}
        {label}
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-2 py-1 text-[11px] font-semibold text-orange-700 transition hover:border-orange-400 hover:from-orange-100 hover:to-amber-100 hover:text-orange-800 hover:shadow-sm"
    >
      {icon}
      {label}
    </a>
  );
}
