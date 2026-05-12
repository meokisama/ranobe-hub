"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Hako } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown, ArrowUp, ArrowUpDown, BookOpen, FileText, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

// Bỏ dấu tiếng Việt + lowercase, dùng để build search index.
// NFD tách ký tự + dấu, regex Unicode property \p{M} bóc toàn bộ dấu combining.
const DIACRITICS_RE = /\p{M}+/gu;
function normalize(s: string) {
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

type SortKey = "name" | "uploader" | "translator" | "lastUpdated";
type SortDir = "asc" | "desc";
type Filter = "all" | "epub" | "pdf";

interface IndexedHako extends Hako {
  _search: string;
  _lastUpdatedTs: number;
}

export function HakoTable() {
  const [items, setItems] = useState<IndexedHako[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("lastUpdated");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // Debounce search 150ms — đủ mượt với 4500 entries
  useEffect(() => {
    const id = setTimeout(() => setQuery(rawQuery), 150);
    return () => clearTimeout(id);
  }, [rawQuery]);

  // Reset về page 1 khi filter/sort/search thay đổi
  useEffect(() => {
    setPage(1);
  }, [query, filter, sortKey, sortDir]);

  // Fetch một lần, build search index ngay sau khi load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/hakos?limit=5000");
        const raw: Hako[] = res.data?.hakos ?? [];
        const indexed = raw.map<IndexedHako>((h) => ({
          ...h,
          _search: normalize(`${h.name} ${h.uploader} ${h.translator} ${h.hakoId ?? ""}`),
          _lastUpdatedTs: h.lastUpdated ? new Date(h.lastUpdated).getTime() : Number.NEGATIVE_INFINITY,
        }));
        if (!cancelled) setItems(indexed);
      } catch (err) {
        console.error("Lỗi khi tải danh sách hako:", err);
        if (!cancelled) setError("Không thể tải danh sách");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (tokens.length === 0 && filter === "all") return items;
    return items.filter((h) => {
      if (filter === "epub" && !h.epub) return false;
      if (filter === "pdf" && !h.pdf) return false;
      if (tokens.length === 0) return true;
      const hay = h._search;
      for (const t of tokens) {
        if (!hay.includes(t)) return false;
      }
      return true;
    });
  }, [items, query, filter]);

  const sorted = useMemo(() => {
    const arr = filtered.slice();
    const dir = sortDir === "asc" ? 1 : -1;
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
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "lastUpdated" || key === "name" ? "desc" : "asc");
    }
  };

  return (
    <section className="max-w-screen-xl mx-auto p-4 py-10">
      {/* Heading — match orange theme từ home page */}
      <div className="flex flex-col items-center justify-center relative select-none pointer-events-none mb-2">
        <h2 className="font-black font-poppins tracking-[-0.3vw] text-[23vw] xl:text-[14vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          HAKO
        </h2>
        <div className="absolute flex flex-col">
          <div className="relative inline-block">
            <span className="text-orange-500 relative z-100 text-[5vw] md:text-[4vw] xl:text-[2vw] font-['Yu_Mincho'] p-2 px-4">
              軽小説の図書館
            </span>
            <span className="absolute z-99 inset-0 bg-orange-100/50 transform -skew-x-19"></span>
          </div>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Tìm theo tên / uploader / translator / ID (không cần dấu)..."
            className="pl-9 pr-9 h-12 backdrop-blur bg-white/80"
            aria-label="Tìm kiếm"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="inline-flex rounded-md border bg-white/80 backdrop-blur p-1 h-12">
          {(["all", "epub", "pdf"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 text-sm rounded transition font-medium",
                filter === f ? "bg-orange-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-orange-50",
              )}
            >
              {f === "all" ? "Tất cả" : f === "epub" ? "Có EPUB" : "Có PDF"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-muted-foreground mb-3 flex items-center gap-3">
        <span>
          Kết quả: <span className="font-semibold text-foreground">{sorted.length.toLocaleString("vi-VN")}</span>
          {query || filter !== "all" ? <span className="text-muted-foreground"> / {items.length.toLocaleString("vi-VN")}</span> : null}
        </span>
        {totalPages > 1 && (
          <span className="text-muted-foreground/70">
            · Trang {safePage}/{totalPages}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">Đang tải...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-16">{error}</div>
      ) : (
        <>
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-orange-50/60 hover:bg-orange-50/60">
                  <TableHead className="w-12 text-muted-foreground">#</TableHead>
                  <SortableHead onClick={() => handleSort("name")} active={sortKey === "name"} dir={sortDir}>
                    Tên
                  </SortableHead>
                  <SortableHead onClick={() => handleSort("uploader")} active={sortKey === "uploader"} dir={sortDir}>
                    Uploader
                  </SortableHead>
                  <SortableHead onClick={() => handleSort("translator")} active={sortKey === "translator"} dir={sortDir}>
                    Translator
                  </SortableHead>
                  <SortableHead onClick={() => handleSort("lastUpdated")} active={sortKey === "lastUpdated"} dir={sortDir}>
                    Cập nhật
                  </SortableHead>
                  <TableHead className="text-right">Tải</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                      Không tìm thấy kết quả nào
                    </TableCell>
                  </TableRow>
                ) : (
                  pageItems.map((h, i) => (
                    <TableRow key={h._id}>
                      <TableCell className="text-muted-foreground tabular-nums">{(safePage - 1) * PAGE_SIZE + i + 1}</TableCell>
                      <TableCell className="max-w-[40ch] whitespace-normal font-medium">{h.name}</TableCell>
                      <TableCell className="text-muted-foreground">{h.uploader || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{h.translator || "—"}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">{formatDate(h.lastUpdated)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-1.5">
                          <DownloadLink href={h.epub} label="EPUB" icon={<BookOpen className="size-3.5" />} />
                          <DownloadLink href={h.pdf} label="PDF" icon={<FileText className="size-3.5" />} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SortableHead({
  onClick,
  active,
  dir,
  children,
}: {
  onClick: () => void;
  active: boolean;
  dir: SortDir;
  children: React.ReactNode;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 transition cursor-pointer",
          active ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
        {active ? dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" /> : <ArrowUpDown className="size-3 opacity-50" />}
      </button>
    </TableHead>
  );
}

function DownloadLink({ href, label, icon }: { href: string | null; label: string; icon: React.ReactNode }) {
  if (!href) {
    return (
      <span className="inline-flex items-center gap-1 rounded border bg-muted/40 px-2 py-1 text-xs text-muted-foreground/50">
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
      className="inline-flex items-center gap-1 rounded border border-orange-200 bg-orange-50 px-2 py-1 text-xs text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
    >
      {icon}
      {label}
    </a>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
