"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KonoranoTable } from "@/components/admin/konorano-table";
import { KonoranoForm } from "@/components/admin/konorano-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
    return <div className="flex justify-center py-12">Đang tải...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Konorano</h1>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm Konorano mới
        </Button>
      </div>

      <KonoranoTable konoranos={konoranos} onEdit={handleEditKonorano} onDeleteSuccess={handleDeleteSuccess} />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          {showForm && <KonoranoForm konorano={selectedKonorano} onSuccess={handleFormSuccess} onCancel={handleFormClose} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
