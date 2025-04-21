"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, ExternalLink } from "lucide-react";
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
import { KonoranoFilters } from "./konorano-filters";
import { Pagination } from "../ui/pagination";

interface KonoranoTableProps {
  konoranos: Konorano[];
  onEdit: (konorano: Konorano) => void;
  onDeleteSuccess: () => void;
}

export function KonoranoTable({
  konoranos,
  onEdit,
  onDeleteSuccess,
}: KonoranoTableProps) {
  const [allKonoranos, setAllKonoranos] = useState<Konorano[]>(konoranos);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [konoranoToDelete, setKonoranoToDelete] = useState<Konorano | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    setAllKonoranos(konoranos);
  }, [konoranos]);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  // Filter konoranos
  const filteredKonoranos = allKonoranos.filter((konorano) => {
    const matchesSearch = searchQuery
      ? konorano.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  // Sort konoranos
  const sortedKonoranos = [...filteredKonoranos].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedKonoranos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKonoranos = sortedKonoranos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <KonoranoFilters onSearch={setSearchQuery} onSort={setSortOrder} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Bìa</TableHead>
              <TableHead>Tên sách</TableHead>
              <TableHead>Tác giả</TableHead>
              <TableHead className="text-center">Ngày phát hành</TableHead>
              <TableHead>Link bản dịch</TableHead>
              <TableHead className="text-end">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentKonoranos.map((konorano) => (
              <TableRow key={konorano._id}>
                <TableCell>
                  <div className="relative h-12 w-9 overflow-hidden rounded">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${konorano.coverImage}`}
                      alt={konorano.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-['Yu_Mincho']">
                  {konorano.name}
                </TableCell>
                <TableCell className="font-['Yu_Mincho']">
                  {konorano.author}
                </TableCell>
                <TableCell className="text-center">
                  {formatDate(konorano.releaseDate)}
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="outline" asChild>
                    <Link href={konorano.viURL} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Button size="icon" variant="outline" asChild>
                      <Link
                        href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${konorano.filePath}`}
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => onEdit(konorano)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="text-red-500"
                      onClick={() => openDeleteDialog(konorano)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa &quot;{konoranoToDelete?.name}&quot;?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
