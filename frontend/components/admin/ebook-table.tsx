"use client";

import { useState, useMemo, useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { Ebook } from "@/lib/types";
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
import { scrollToRef } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

const EBOOK_SEARCH_KEYS: ReadonlyArray<FuzzyKey<Ebook>> = [
  { name: "name", weight: 3 },
  { name: "author", weight: 1 },
  { name: "illustrator", weight: 1 },
];

interface EbookTableProps {
  ebooks: Ebook[];
  onEdit: (ebook: Ebook) => void;
  onDeleteSuccess: () => void;
}

export function EbookTable({ ebooks, onEdit, onDeleteSuccess }: EbookTableProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState<Ebook | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  const publisherFiltered = useMemo(
    () => (selectedPublisher ? ebooks.filter((e) => e.publisher._id === selectedPublisher) : ebooks),
    [ebooks, selectedPublisher],
  );

  const searchedEbooks = useFuzzySearch(publisherFiltered, searchQuery, EBOOK_SEARCH_KEYS);

  // A query already ranks by relevance; only sort by date when browsing.
  const sortedEbooks = useMemo(
    () => (searchQuery.trim() ? searchedEbooks : sortByDate(searchedEbooks, sortOrder, (e) => e.releaseDate)),
    [searchedEbooks, searchQuery, sortOrder],
  );

  const totalPages = Math.ceil(sortedEbooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEbooks = sortedEbooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (!ebookToDelete) return;

    try {
      setIsDeleting(true);
      await api.delete(`/ebooks/${ebookToDelete._id}`);
      toast.success("Xóa thành công", {
        description: `Đã xóa "${ebookToDelete.name}" khỏi thư viện`,
      });
      onDeleteSuccess();
    } catch (error) {
      console.error("Lỗi khi xóa ebook:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa ebook. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setEbookToDelete(null);
    }
  };

  const openDeleteDialog = (ebook: Ebook) => {
    setEbookToDelete(ebook);
    setIsDeleteDialogOpen(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToRef(filterRef);
  };

  return (
    <>
      {/* Nothing to filter through yet — the toolbar would just be noise. */}
      {ebooks.length > 0 && (
        <div ref={filterRef}>
          <ContentFilters
            contentType="ebook"
            onSearch={setSearchQuery}
            onSort={setSortOrder}
            onPublisherFilter={setSelectedPublisher}
            onFilterChange={() => setCurrentPage(1)}
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Bìa</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead>Họa sĩ</TableHead>
              <TableHead className="text-center">Ngày phát hành</TableHead>
              <TableHead>Nhãn hiệu</TableHead>
              <TableHead className="text-end">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEbooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  {ebooks.length === 0 ? "Chưa có ebook nào trong thư viện" : "Không có dữ liệu"}
                </TableCell>
              </TableRow>
            ) : (
              currentEbooks.map((ebook) => (
                <TableRow key={ebook._id}>
                  <TableCell>
                    <div className="relative h-12 w-9 overflow-hidden rounded">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${ebook.coverImage}`}
                        alt={ebook.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="font-['Yu_Mincho']">{ebook.name}</TableCell>
                  <TableCell className="font-['Yu_Mincho']">{ebook.author}</TableCell>
                  <TableCell className="font-['Yu_Mincho']">{ebook.illustrator}</TableCell>
                  <TableCell className="font-light text-center">{formatDateVi(ebook.releaseDate)}</TableCell>
                  <TableCell className="font-light">{ebook.publisher.name}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="outline" asChild>
                        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${ebook.filePath.replace(/\.epub$/i, "")}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => onEdit(ebook)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-500" onClick={() => openDeleteDialog(ebook)}>
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
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa ebook &quot;{ebookToDelete?.name}&quot;? Hành động này không thể hoàn tác.
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
    </>
  );
}
