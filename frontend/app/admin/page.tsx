"use client";

import { AdminResourcePage } from "@/components/admin/admin-resource-page";
import { EbookForm } from "@/components/admin/ebook-form";
import { EbookTable } from "@/components/admin/ebook-table";
import { api } from "@/lib/api";
import { Ebook } from "@/lib/types";

const loadEbooks = async (): Promise<Ebook[]> => (await api.get("/ebooks?limit=1000")).data.ebooks ?? [];

export default function AdminPage() {
  return (
    <AdminResourcePage<Ebook>
      title="Ebooks"
      description="Quản lý thư viện ebook"
      addLabel="Thêm Ebook"
      load={loadEbooks}
      renderTable={(ebooks, onEdit, onDeleteSuccess) => <EbookTable ebooks={ebooks} onEdit={onEdit} onDeleteSuccess={onDeleteSuccess} />}
      renderForm={(ebook, onSuccess, onCancel) => <EbookForm ebook={ebook} onSuccess={onSuccess} onCancel={onCancel} />}
    />
  );
}
