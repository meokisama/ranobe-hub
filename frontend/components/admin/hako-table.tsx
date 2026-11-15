"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, FileText } from "lucide-react";
import { RowActions } from "./row-actions";
import { Hako } from "@/lib/types";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { ContentFilters } from "@/components/common/content-filters";
import { Pagination } from "@/components/ui/pagination";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";
import { formatDateVi } from "@/lib/format";
import { sortByDate, type SortOrder } from "@/lib/sort";

const ITEMS_PER_PAGE = 10;

interface HakoTableProps {
  hakos: Hako[];
  onEdit: (hako: Hako) => void;
  onDeleteSuccess: () => void;
}

const HAKO_SEARCH_KEYS: ReadonlyArray<FuzzyKey<Hako>> = [
  { name: "name", weight: 3 },
  { name: "uploader", weight: 1 },
  { name: "translator", weight: 1 },
  { name: "hakoId", weight: 2, get: (h) => h.hakoId ?? "" },
];

export function HakoTable({ hakos, onEdit, onDeleteSuccess }: HakoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [hakoToDelete, setHakoToDelete] = useState<Hako | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useFuzzySearch(hakos, searchQuery, HAKO_SEARCH_KEYS);

  // A query already ranks by relevance; only sort by date when browsing.
  const sorted = useMemo(
    () => (searchQuery.trim() ? filtered : sortByDate(filtered, sortOrder, (h) => h.lastUpdated)),
    [filtered, sortOrder, searchQuery],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentHakos = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const openDeleteDialog = (hako: Hako) => {
    setHakoToDelete(hako);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!hakoToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/hakos/${hakoToDelete._id}`);
      toast.success("Xóa thành công", {
        description: `Đã xóa "${hakoToDelete.name}" khỏi thư viện`,
      });
      onDeleteSuccess();
    } catch (error) {
      console.error("Lỗi khi xóa hako:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa hako. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setHakoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nothing to filter through yet — the toolbar would just be noise. */}
      {hakos.length > 0 && (
        <ContentFilters contentType="hako" onSearch={setSearchQuery} onSort={setSortOrder} onFilterChange={() => setCurrentPage(1)} />
      )}

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="min-w-[260px]">Tên sách</TableHead>
              <TableHead className="w-[160px]">Uploader</TableHead>
              <TableHead className="w-[160px]">Translator</TableHead>
              <TableHead className="text-center">Cập nhật</TableHead>
              <TableHead className="text-center">File</TableHead>
              <TableHead className="text-end">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentHakos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  {hakos.length === 0 ? "Chưa có Hako nào trong kho lưu trữ" : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              currentHakos.map((hako) => {
                const readUrl =
                  hako.hakoId && hako.epub
                    ? `${process.env.NEXT_PUBLIC_API_URL}/reader?book=https://r2.ranobe.vn/hako/epub/${hako.hakoId}.epub`
                    : null;
                return (
                  <TableRow key={hako._id}>
                    <TableCell className="font-label text-[11px] text-muted-foreground tabular-nums">{hako.hakoId ?? "—"}</TableCell>
                    <TableCell className="min-w-[260px] max-w-[420px] whitespace-normal break-words text-[15px] font-medium leading-snug transition-colors group-hover:text-shu">{hako.name}</TableCell>
                    <TableCell className="w-[160px] max-w-[160px] truncate text-sm text-muted-foreground" title={hako.uploader || undefined}>
                      {hako.uploader || "—"}
                    </TableCell>
                    <TableCell className="w-[160px] max-w-[160px] truncate text-sm text-muted-foreground" title={hako.translator || undefined}>
                      {hako.translator || "—"}
                    </TableCell>
                    <TableCell className="text-center font-label text-xs tabular-nums text-muted-foreground">{formatDateVi(hako.lastUpdated)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1.5">
                        {hako.epub ? (
                          <Link
                            href={hako.epub}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-full border border-foreground/25 px-2 py-0.5 font-label text-[10px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                            title="EPUB"
                          >
                            <BookOpen className="h-3 w-3" />
                            EPUB
                          </Link>
                        ) : null}
                        {hako.pdf ? (
                          <Link
                            href={hako.pdf}
                            target="_blank"
                            className="inline-flex items-center gap-1 rounded-full border border-foreground/25 px-2 py-0.5 font-label text-[10px] uppercase tracking-[0.1em] text-foreground transition-colors hover:bg-foreground hover:text-background"
                            title="PDF"
                          >
                            <FileText className="h-3 w-3" />
                            PDF
                          </Link>
                        ) : null}
                        {!hako.epub && !hako.pdf ? <span className="text-xs text-muted-foreground">—</span> : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-end">
                      <RowActions readHref={readUrl} onEdit={() => onEdit(hako)} onDelete={() => openDeleteDialog(hako)} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa &quot;{hakoToDelete?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-white hover:bg-destructive/90">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
