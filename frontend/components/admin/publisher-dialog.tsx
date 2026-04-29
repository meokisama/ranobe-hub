"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import { api } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên nhãn hiệu không được để trống" }),
});

interface Publisher {
  _id: string;
  name: string;
}

interface PublisherDialogProps {
  onClose?: () => void;
}

export function PublisherDialog({ onClose }: PublisherDialogProps) {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose?.();
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const fetchPublishers = async () => {
    try {
      const response = await api.get("/publishers");
      setPublishers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nhãn hiệu:", error);
      toast.error("Lỗi", {
        description: "Không thể lấy danh sách nhãn hiệu. Vui lòng thử lại sau.",
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPublishers();
    }
  }, [isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      if (editingPublisher) {
        // Cập nhật
        await api.put(`/publishers/${editingPublisher._id}`, values);
        toast.success("Cập nhật thành công", {
          description: `Đã cập nhật nhãn hiệu "${values.name}"`,
        });
      } else {
        // Thêm mới
        await api.post("/publishers", values);
        toast.success("Thêm mới thành công", {
          description: `Đã thêm nhãn hiệu "${values.name}"`,
        });
      }

      form.reset();
      setEditingPublisher(null);
      fetchPublishers();
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

  const handleDelete = async (publisher: Publisher) => {
    try {
      await api.delete(`/publishers/${publisher._id}`);
      toast.success("Xóa thành công", {
        description: `Đã xóa nhãn hiệu "${publisher.name}"`,
      });
      fetchPublishers();
    } catch (error) {
      console.error("Lỗi khi xóa nhãn hiệu:", error);
      toast.error("Lỗi", {
        description: "Không thể xóa nhãn hiệu. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="h-4 w-4" />
          Quản lý nhãn hiệu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Quản lý nhãn hiệu</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhãn hiệu</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isSubmitting} className="font-light" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              {editingPublisher && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingPublisher(null);
                    form.reset();
                  }}
                  disabled={isSubmitting}
                >
                  Hủy
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang lưu..." : editingPublisher ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-6 flex-1 min-h-0 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên nhãn hiệu</TableHead>
                <TableHead className="text-end">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {publishers.map((publisher) => (
                <TableRow key={publisher._id}>
                  <TableCell className="font-light">{publisher.name}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="outline" onClick={() => handleEdit(publisher)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleDelete(publisher)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
