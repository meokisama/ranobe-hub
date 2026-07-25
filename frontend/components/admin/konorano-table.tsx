"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Konorano } from "@/lib/types";
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
import Image from "next/image";
import Link from "next/link";
import { ContentFilters } from "@/components/common/content-filters";
import { Pagination } from "@/components/ui/pagination";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";
import { formatDateVi } from "@/lib/format";
import { sortByDate, type SortOrder } from "@/lib/sort";

const ITEMS_PER_PAGE = 10;

const KONORANO_SEARCH_KEYS: ReadonlyArray<FuzzyKey<Konorano>> = [
  { name: "name", weight: 3 },
  { name: "author", weight: 1 },
];

interface KonoranoTableProps {
  konoranos: Konorano[];
  onEdit: (konorano: Konorano) => void;
  onDeleteSuccess: () => void;
}

export function KonoranoTable({ konoranos, onEdit, onDeleteSuccess }: KonoranoTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [konoranoToDelete, setKonoranoToDelete] = useState<Konorano | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredKonoranos = useFuzzySearch(konoranos, searchQuery, KONORANO_SEARCH_KEYS);

  // A query already ranks by relevance; only sort by date when browsing.
  const sortedKonoranos = useMemo(
    () => (searchQuery.trim() ? filteredKonoranos : sortByDate(filteredKonoranos, sortOrder, (k) => k.releaseDate)),
    [filteredKonoranos, searchQuery, sortOrder],
  );

  const totalPages = Math.ceil(sortedKonoranos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentKonoranos = sortedKonoranos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const openDeleteDialog = (konorano: Konorano) => {
    setKonoranoToDelete(konorano);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!konoranoToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/konoranos/${konoranoToDelete._id}`);
      toast.success("Xóa thành công", {
        description: `Đã xóa "${konoranoToDelete.name}" khỏi thư viện`,
      });
      onDeleteSuccess();
    } catch (error) {
      console.error("Lỗi khi xóa konorano:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa konorano. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setKonoranoToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Nothing to filter through yet — the toolbar would just be noise. */}
      {konoranos.length > 0 && (
        <ContentFilters contentType="konorano" onSearch={setSearchQuery} onSort={setSortOrder} onFilterChange={() => setCurrentPage(1)} />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Bìa</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead className="text-center">Ngày phát hành</TableHead>
              <TableHead className="w-[350px] max-w-[350px]">Link bản dịch</TableHead>
              <TableHead className="text-end">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentKonoranos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  {konoranos.length === 0 ? "Chưa có sách nào trong thư viện" : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              currentKonoranos.map((konorano) => (
                <TableRow key={konorano._id}>
                  <TableCell>
                    <div className="relative h-12 w-9 overflow-hidden rounded">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${konorano.coverImage}`}
                        alt={konorano.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-['Yu_Mincho']">{konorano.name}</TableCell>
                  <TableCell className="font-['Yu_Mincho']">{konorano.author}</TableCell>
                  <TableCell className="text-center font-light">{formatDateVi(konorano.releaseDate)}</TableCell>
                  <TableCell className="max-w-[350px]">
                    <Link href={konorano.viURL} target="_blank" className="block truncate text-blue-600 hover:underline" title={konorano.viURL}>
                      {konorano.viURL}
                    </Link>
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${konorano.filePath.replace(/\.epub$/i, "")}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => onEdit(konorano)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-500" onClick={() => openDeleteDialog(konorano)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
              Bạn có chắc chắn muốn xóa &quot;{konoranoToDelete?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
