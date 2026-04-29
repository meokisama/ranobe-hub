"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EbookTable } from "@/components/admin/ebook-table";
import { EbookForm } from "@/components/admin/ebook-form";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { Library, PlusCircle, CalendarDays, Building2, Loader2 } from "lucide-react";
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

    const verifyToken = async () => {
      try {
        await api.get("/admin/verify");
        fetchEbooks();
      } catch (err) {
        console.error("Lỗi khi verify token:", err);
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
      const res = await api.get("/ebooks?limit=1000");
      setEbooks(res.data.ebooks);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ebook:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        document.cookie = "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie = "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        router.push("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const addedThisMonth = ebooks.filter((e) => new Date(e.createdAt) >= startOfMonth).length;
    const publisherCount = new Set(ebooks.map((e) => e.publisher?._id).filter(Boolean)).size;
    return {
      total: ebooks.length,
      addedThisMonth,
      publisherCount,
    };
  }, [ebooks]);

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
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Tổng số ebook" value={stats.total.toLocaleString("vi-VN")} hint="Toàn bộ thư viện" icon={<Library className="h-5 w-5" />} />
        <StatCard
          label="Thêm tháng này"
          value={stats.addedThisMonth.toLocaleString("vi-VN")}
          hint="Tính từ đầu tháng"
          icon={<CalendarDays className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Nhãn hiệu"
          value={stats.publisherCount.toLocaleString("vi-VN")}
          hint="Số nhãn đang có ebook"
          icon={<Building2 className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <EbookTable
        ebooks={ebooks}
        onEdit={handleEditEbook}
        onDeleteSuccess={handleDeleteSuccess}
        headerAction={
          <Button onClick={handleAddNew} className="h-12 shadow-sm cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Thêm Ebook
          </Button>
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>{showForm && <EbookForm ebook={selectedEbook} onSuccess={handleFormSuccess} onCancel={handleFormClose} />}</DialogContent>
      </Dialog>
    </div>
  );
}
