"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Hako } from "@/lib/types";
import { toDateInputValue } from "@/lib/format";

interface HakoFormProps {
  hako: Hako | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const optionalUrl = z
  .string()
  .optional()
  .refine((v) => !v || v.trim() === "" || /^https?:\/\/.+/i.test(v.trim()), { message: "URL không hợp lệ" });

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên sách không được để trống" }),
  hakoId: z.string().optional(),
  uploader: z.string().optional(),
  translator: z.string().optional(),
  lastUpdated: z.string().optional(),
  epub: optionalUrl,
  pdf: optionalUrl,
});

type FormValues = z.infer<typeof formSchema>;

export function HakoForm({ hako, onSuccess, onCancel }: HakoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: hako?.name || "",
      hakoId: hako?.hakoId || "",
      uploader: hako?.uploader || "",
      translator: hako?.translator || "",
      lastUpdated: toDateInputValue(hako?.lastUpdated),
      epub: hako?.epub || "",
      pdf: hako?.pdf || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const lastUpdated = values.lastUpdated?.trim();
      const payload: Record<string, string | null> = {
        name: values.name.trim(),
        hakoId: values.hakoId?.trim() || "",
        uploader: values.uploader?.trim() || "",
        translator: values.translator?.trim() || "",
        epub: values.epub?.trim() || null,
        pdf: values.pdf?.trim() || null,
        lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
      };

      if (hako) {
        await api.put(`/hakos/${hako._id}`, payload);
        toast.success("Cập nhật thành công", {
          description: `Đã cập nhật thông tin cho "${values.name}"`,
        });
      } else {
        await api.post("/hakos", payload);
        toast.success("Thêm mới thành công", {
          description: `Đã thêm "${values.name}" vào thư viện`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Lỗi khi lưu hako:", error);
      let description = "Không thể lưu thông tin sách. Vui lòng thử lại sau.";
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { msg?: string; errors?: { msg: string }[] } | undefined;
        if (data?.msg) description = data.msg;
        else if (data?.errors?.[0]?.msg) description = data.errors[0].msg;
      }
      toast.error("Lỗi", { description });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{hako ? "Chỉnh sửa" : "Thêm mới"} Hako</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sách</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập tên sách" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="hakoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hako ID</FormLabel>
                  <FormControl>
                    <Input placeholder="vd: 12345" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">ID gốc trên site Hako (để trống nếu không có)</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastUpdated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cập nhật lần cuối</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="uploader"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uploader</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên người đăng" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="translator"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Translator</FormLabel>
                  <FormControl>
                    <Input placeholder="Tên nhóm dịch" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="epub"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL EPUB</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL PDF</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
