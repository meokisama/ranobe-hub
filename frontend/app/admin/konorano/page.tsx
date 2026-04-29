"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { KonoranoTable } from "@/components/admin/konorano-table";
import { KonoranoForm } from "@/components/admin/konorano-form";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { BookMarked, PlusCircle, CalendarDays, Trophy, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Konorano } from "@/lib/types";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function KonoranoAdminPage() {
  const router = useRouter();
  const [konoranos, setKonoranos] = useState<Konorano[]>([]);
  const [selectedKonorano, setSelectedKonorano] = useState<Konorano | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchKonoranos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchKonoranos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/konoranos?limit=1000");
      setKonoranos(res.data.konoranos);
    } catch (err) {
      console.error("Lỗi khi tải danh sách konorano:", err);
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
    const addedThisMonth = konoranos.filter((k) => new Date(k.createdAt) >= startOfMonth).length;
    const yearCount = new Set(konoranos.map((k) => new Date(k.releaseDate).getFullYear()).filter((y) => !Number.isNaN(y))).size;
    return {
      total: konoranos.length,
      addedThisMonth,
      yearCount,
    };
  }, [konoranos]);

  const handleAddNew = () => {
    setSelectedKonorano(null);
    setShowForm(true);
  };

  const handleEditKonorano = (konorano: Konorano) => {
    setSelectedKonorano(konorano);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchKonoranos();
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  const handleDeleteSuccess = () => {
    fetchKonoranos();
  };

  if (loading) {
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
        <StatCard
          label="Tổng số sách"
          value={stats.total.toLocaleString("vi-VN")}
          hint="Toàn bộ Konorano"
          icon={<BookMarked className="h-5 w-5" />}
        />
        <StatCard
          label="Thêm tháng này"
          value={stats.addedThisMonth.toLocaleString("vi-VN")}
          hint="Tính từ đầu tháng"
          icon={<CalendarDays className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Số năm xếp hạng"
          value={stats.yearCount.toLocaleString("vi-VN")}
          hint="Phân bổ theo năm phát hành"
          icon={<Trophy className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <KonoranoTable
        konoranos={konoranos}
        onEdit={handleEditKonorano}
        onDeleteSuccess={handleDeleteSuccess}
        headerAction={
          <Button onClick={handleAddNew} className="h-12 shadow-sm cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Thêm Konorano
          </Button>
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          {showForm && <KonoranoForm konorano={selectedKonorano} onSuccess={handleFormSuccess} onCancel={handleFormClose} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
