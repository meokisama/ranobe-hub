"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Edit, Trash2, Plus, Tag, Loader2, Building2, X, Check, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import { Publisher } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên nhãn hiệu không được để trống" }),
});

interface PublisherDialogProps {
  onClose?: () => void;
}

export function PublisherDialog({ onClose }: PublisherDialogProps) {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [publisherToDelete, setPublisherToDelete] = useState<Publisher | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchPublishers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/publishers");
      setPublishers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhãn hiệu:", error);
      toast.error("Lỗi", {
        description: "Không thể lấy danh sách nhãn hiệu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading on open is an event, not a side effect of rendering — no useEffect needed.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      void fetchPublishers();
    } else {
      setEditingPublisher(null);
      form.reset();
      onClose?.();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      if (editingPublisher) {
        await api.put(`/publishers/${editingPublisher._id}`, values);
        toast.success("Cập nhật thành công", {
          description: `Đã cập nhật nhãn hiệu "${values.name}"`,
        });
      } else {
        await api.post("/publishers", values);
        toast.success("Thêm mới thành công", {
          description: `Đã thêm nhãn hiệu "${values.name}"`,
        });
      }

      form.reset();
      setEditingPublisher(null);
      void fetchPublishers();
    } catch (error) {
      console.error("Lỗi khi lưu nhãn hiệu:", error);
      toast.error("Lỗi", {
        description: "Không thể lưu thông tin nhãn hiệu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (publisher: Publisher) => {
    setEditingPublisher(publisher);
    form.setValue("name", publisher.name);
  };

  const cancelEdit = () => {
    setEditingPublisher(null);
    form.reset();
  };

  const confirmDelete = async () => {
    if (!publisherToDelete) return;
    try {
      setIsDeleting(true);
      await api.delete(`/publishers/${publisherToDelete._id}`);
      toast.success("Xóa thành công", {
        description: `Đã xóa nhãn hiệu "${publisherToDelete.name}"`,
      });
      if (editingPublisher?._id === publisherToDelete._id) {
        cancelEdit();
      }
      void fetchPublishers();
    } catch (error) {
      console.error("Lỗi khi xóa nhãn hiệu:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa nhãn hiệu. Vui lòng thử lại sau.",
      });
    } finally {
      setIsDeleting(false);
      setPublisherToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Quản lý nhãn hiệu
          </Button>
        </DialogTrigger>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-left">
                <DialogTitle className="text-lg">Quản lý nhãn hiệu</DialogTitle>
                <DialogDescription className="text-xs">
                  Thêm, đổi tên hoặc xóa nhãn hiệu phát hành ebook.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form section */}
          <div className="border-b bg-muted/30 px-6 py-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {editingPublisher ? "Đang chỉnh sửa" : "Thêm nhãn hiệu mới"}
              </p>
              {editingPublisher && (
                <span className="truncate rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  {editingPublisher.name}
                </span>
              )}
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 sm:flex-row">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative">
                          <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Nhập tên nhãn hiệu..."
                            {...field}
                            disabled={isSubmitting}
                            className="h-10 pl-9"
                            autoComplete="off"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  {editingPublisher && (
                    <Button type="button" variant="outline" onClick={cancelEdit} disabled={isSubmitting} className="h-10">
                      <X className="h-4 w-4" />
                      Hủy
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting} className="h-10 min-w-28">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu
                      </>
                    ) : editingPublisher ? (
                      <>
                        <Check className="h-4 w-4" />
                        Cập nhật
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Thêm mới
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* List section */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-6 py-3">
              <p className="text-sm font-semibold">Danh sách nhãn hiệu</p>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {publishers.length} nhãn
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-xs">Đang tải...</span>
                </div>
              ) : publishers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <Inbox className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">Chưa có nhãn hiệu nào</p>
                  <p className="text-xs">Thêm nhãn hiệu đầu tiên ở phía trên.</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {publishers.map((publisher) => {
                    const isEditing = editingPublisher?._id === publisher._id;
                    return (
                      <li
                        key={publisher._id}
                        className={`group flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          isEditing ? "border-primary/40 bg-primary/5" : "border-transparent hover:border-border hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                            isEditing ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {publisher.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium">{publisher.name}</span>
                        <div className="flex items-center gap-1 opacity-70 transition-opacity group-hover:opacity-100">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleEdit(publisher)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                            onClick={() => setPublisherToDelete(publisher)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!publisherToDelete} onOpenChange={(open) => !open && setPublisherToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhãn hiệu &quot;{publisherToDelete?.name}&quot;? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
