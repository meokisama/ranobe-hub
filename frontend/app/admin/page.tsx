"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EbookTable } from "@/components/admin/ebook-table";
import { EbookForm } from "@/components/admin/ebook-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { api } from "@/lib/api";
import { Ebook } from "@/lib/types";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function AdminPage() {
  const router = useRouter();
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [selectedEbook, setSelectedEbook] = useState<Ebook | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Kiểm tra đăng nhập từ cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const token = getCookie("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    // Verify token với backend
    const verifyToken = async () => {
      try {
        await api.get("/admin/verify");
        fetchEbooks();
      } catch (err) {
        console.error("Lỗi khi verify token:", err);
        // Xóa cookie khi token không hợp lệ
        document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        router.push("/admin/login");
      }
    };

    verifyToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchEbooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ebooks");
      setEbooks(res.data.ebooks);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ebook:", err);
      // Kiểm tra nếu lỗi 401 - Unauthorized
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Xóa cookie khi token không hợp lệ
        document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setSelectedEbook(null);
    setShowForm(true);
  };

  const handleEditEbook = (ebook: Ebook) => {
    setSelectedEbook(ebook);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEbook(null);
  };

  const handleFormSuccess = () => {
    fetchEbooks();
    setShowForm(false);
    setSelectedEbook(null);
  };

  const handleDeleteSuccess = () => {
    fetchEbooks();
  };

  if (loading && ebooks.length === 0) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div
          className="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full"
          role="status"
          aria-label="loading"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Ebook</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm Ebook mới
        </Button>
      </div>

      <EbookTable ebooks={ebooks} onEdit={handleEditEbook} onDeleteSuccess={handleDeleteSuccess} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>{showForm && <EbookForm ebook={selectedEbook} onSuccess={handleFormSuccess} onCancel={handleFormClose} />}</DialogContent>
      </Dialog>
    </div>
  );
}
