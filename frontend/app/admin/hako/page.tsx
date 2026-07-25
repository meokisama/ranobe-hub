"use client";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { HakoForm } from "@/components/admin/hako-form";
import { HakoTable } from "@/components/admin/hako-table";
import { api } from "@/lib/api";
import { Hako } from "@/lib/types";

const loadHakos = async (): Promise<Hako[]> => (await api.get("/hakos?limit=5000")).data.hakos ?? [];

export default function HakoAdminPage() {
  return (
    <AdminResourcePage<Hako>
      title="Hako"
      description="Kho lưu trữ light novel"
      addLabel="Thêm Hako"
      load={loadHakos}
      renderTable={(hakos, onEdit, onDeleteSuccess) => <HakoTable hakos={hakos} onEdit={onEdit} onDeleteSuccess={onDeleteSuccess} />}
      renderForm={(hako, onSuccess, onCancel) => <HakoForm hako={hako} onSuccess={onSuccess} onCancel={onCancel} />}
    />
  );
}
