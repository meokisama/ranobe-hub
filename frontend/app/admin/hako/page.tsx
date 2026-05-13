"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HakoTable } from "@/components/admin/hako-table";
import { HakoForm } from "@/components/admin/hako-form";
import { StatCard } from "@/components/admin/stat-card";
import { Button } from "@/components/ui/button";
import { BookOpen, PlusCircle, FileText, Hash, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Hako } from "@/lib/types";
import axios from "axios";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function HakoAdminPage() {
  const router = useRouter();
  const [hakos, setHakos] = useState<Hako[]>([]);
  const [selectedHako, setSelectedHako] = useState<Hako | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchHakos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHakos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/hakos?limit=5000");
      setHakos(res.data.hakos);
    } catch (err) {
      console.error("Lỗi khi tải danh sách hako:", err);
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
    let withEpub = 0;
    let withPdf = 0;
    for (const h of hakos) {
      if (h.epub) withEpub++;
      if (h.pdf) withPdf++;
    }
    return {
      total: hakos.length,
      withEpub,
      withPdf,
    };
  }, [hakos]);

  const handleAddNew = () => {
    setSelectedHako(null);
    setShowForm(true);
  };

  const handleEdit = (hako: Hako) => {
    setSelectedHako(hako);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedHako(null);
    fetchHakos();
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedHako(null);
  };

  const handleDeleteSuccess = () => {
    fetchHakos();
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
        <StatCard label="Tổng số Hako" value={stats.total.toLocaleString("vi-VN")} hint="Toàn bộ kho lưu trữ" icon={<Hash className="h-5 w-5" />} />
        <StatCard
          label="Có EPUB"
          value={stats.withEpub.toLocaleString("vi-VN")}
          hint="Đã render EPUB"
          icon={<BookOpen className="h-5 w-5" />}
          accent="emerald"
        />
        <StatCard
          label="Có PDF"
          value={stats.withPdf.toLocaleString("vi-VN")}
          hint="Đã có file PDF"
          icon={<FileText className="h-5 w-5" />}
          accent="amber"
        />
      </div>

      <HakoTable
        hakos={hakos}
        onEdit={handleEdit}
        onDeleteSuccess={handleDeleteSuccess}
        headerAction={
          <Button onClick={handleAddNew} className="h-12 shadow-sm cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            Thêm Hako
          </Button>
        }
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>{showForm && <HakoForm hako={selectedHako} onSuccess={handleFormSuccess} onCancel={handleFormClose} />}</DialogContent>
      </Dialog>
    </div>
  );
}
