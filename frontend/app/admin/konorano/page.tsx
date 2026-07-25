"use client";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { KonoranoForm } from "@/components/admin/konorano-form";
import { KonoranoTable } from "@/components/admin/konorano-table";
import { api } from "@/lib/api";
import { Konorano } from "@/lib/types";

const loadKonoranos = async (): Promise<Konorano[]> => (await api.get("/konoranos?limit=1000")).data.konoranos ?? [];

export default function KonoranoAdminPage() {
  return (
    <AdminResourcePage<Konorano>
      title="Konorano"
      description="Bảng xếp hạng thường niên"
      addLabel="Thêm Konorano"
      load={loadKonoranos}
      renderTable={(konoranos, onEdit, onDeleteSuccess) => (
        <KonoranoTable konoranos={konoranos} onEdit={onEdit} onDeleteSuccess={onDeleteSuccess} />
      )}
      renderForm={(konorano, onSuccess, onCancel) => <KonoranoForm konorano={konorano} onSuccess={onSuccess} onCancel={onCancel} />}
    />
  );
}
