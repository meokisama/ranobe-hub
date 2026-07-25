"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, PlusCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AdminResourcePageProps<T> {
  title: string;
  description: string;
  /** Label for the "add new" button, e.g. "Thêm Ebook". */
  addLabel: string;
  /**
   * Fetches the full list. Must be defined at module scope (a new function each
   * render would re-trigger the load).
   */
  load: () => Promise<T[]>;
  renderTable: (items: T[], onEdit: (item: T) => void, onDeleteSuccess: () => void) => React.ReactNode;
  renderForm: (item: T | null, onSuccess: () => void, onCancel: () => void) => React.ReactNode;
}

/**
 * Shared shell for the admin list pages: load + reload, header, loading state and
 * the create/edit dialog. Auth is handled by `proxy.ts` server-side and the 401
 * interceptor in `lib/api.ts`, so there's nothing to check here.
 */
export function AdminResourcePage<T>({ title, description, addLabel, load, renderTable, renderForm }: AdminResourcePageProps<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  /** Bumping the key re-runs the load effect — one fetch path, no duplicate logic. */
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((list) => {
        if (!cancelled) setItems(list);
      })
      .catch((err) => console.error(`Lỗi khi tải danh sách ${title}:`, err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [load, title, reloadKey]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setSelected(null);
  }, []);

  const openForm = useCallback((item: T | null) => {
    setSelected(item);
    setShowForm(true);
  }, []);

  const handleSuccess = useCallback(() => {
    closeForm();
    refresh();
  }, [closeForm, refresh]);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <AdminPageHeader
        title={title}
        description={description}
        action={
          <Button onClick={() => openForm(null)} className="cursor-pointer">
            <PlusCircle className="h-4 w-4" />
            {addLabel}
          </Button>
        }
      />

      {loading && items.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Đang tải dữ liệu...</span>
          </div>
        </div>
      ) : (
        renderTable(items, openForm, refresh)
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>{showForm && renderForm(selected, handleSuccess, closeForm)}</DialogContent>
      </Dialog>
    </div>
  );
}
