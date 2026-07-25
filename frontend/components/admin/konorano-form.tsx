"use client";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Konorano } from "@/lib/types";
import Image from "next/image";
import { extractEpubForForm } from "@/lib/epub-metadata";
import { toDateInputValue } from "@/lib/format";

interface KonoranoFormProps {
  konorano: Konorano | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên sách không được để trống" }),
  author: z.string().optional(),
  releaseDate: z.string().min(1, { message: "Ngày phát hành không được để trống" }),
  viURL: z
    .string()
    .min(1, { message: "Link bản dịch tiếng Việt không được để trống" })
    .pipe(z.url({ message: "Link không hợp lệ" })),
});

export function KonoranoForm({ konorano, onSuccess, onCancel }: KonoranoFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [konoranoFile, setKonoranoFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    konorano ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${konorano.coverImage}` : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: konorano?.name || "",
      author: konorano?.author || "宝島社",
      releaseDate: toDateInputValue(konorano?.releaseDate),
      viURL: konorano?.viURL || "",
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setCoverPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKonoranoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setKonoranoFile(file);

    // Auto-fill title/date/cover from the EPUB so the admin doesn't retype them.
    // Runs entirely in the browser; PDFs and unreadable EPUBs just fall through to
    // manual entry.
    if (!file.name.toLowerCase().endsWith(".epub")) return;
    try {
      setIsParsing(true);
      const prefill = await extractEpubForForm(file);
      // Only fill empty fields so we never clobber what the admin already typed
      // (author keeps its 宝島社 default).
      if (prefill.title && !form.getValues("name")) form.setValue("name", prefill.title, { shouldValidate: true });
      if (prefill.author && !form.getValues("author")) form.setValue("author", prefill.author, { shouldValidate: true });
      if (prefill.releaseDate && !form.getValues("releaseDate")) form.setValue("releaseDate", prefill.releaseDate, { shouldValidate: true });
      if (prefill.coverFile && !coverFile) {
        setCoverFile(prefill.coverFile);
        setCoverPreview(URL.createObjectURL(prefill.coverFile));
      }
      if (prefill.title || prefill.releaseDate || prefill.coverFile) {
        toast.success("Đã tự động điền thông tin từ EPUB", {
          description: "Kiểm tra lại và chỉnh sửa nếu cần.",
        });
      }
    } catch (error) {
      console.error("Không đọc được metadata EPUB:", error);
      // Silent: the admin can still fill everything manually.
    } finally {
      setIsParsing(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Require both cover and file when creating
      if (!konorano && (!coverFile || !konoranoFile)) {
        toast.error("Lỗi", {
          description: "Vui lòng upload cả ảnh bìa và file sách",
        });
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      if (values.author) {
        formData.append("author", values.author);
      }
      formData.append("releaseDate", values.releaseDate);
      formData.append("viURL", values.viURL);

      if (coverFile) {
        formData.append("cover", coverFile);
      }

      if (konoranoFile) {
        formData.append("konorano", konoranoFile);
      }

      const headers = { "Content-Type": "multipart/form-data" };
      if (konorano) {
        await api.put(`/konoranos/${konorano._id}`, formData, { headers });
        toast.success("Cập nhật thành công", {
          description: `Đã cập nhật thông tin cho "${values.name}"`,
        });
      } else {
        await api.post("/konoranos", formData, { headers });
        toast.success("Thêm mới thành công", {
          description: `Đã thêm "${values.name}" vào thư viện`,
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Lỗi khi lưu konorano:", error);
      toast.error("Lỗi", {
        description: "Không thể lưu thông tin sách. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{konorano ? "Chỉnh sửa" : "Thêm mới"} Konorano</DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2 space-y-4">
              <div className="rounded-md h-full border p-2 aspect-[112/159] relative overflow-hidden">
                {coverPreview ? (
                  <Image src={coverPreview} alt="Cover preview" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">Chưa có ảnh bìa</div>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sách</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên sách" {...field} disabled={isSubmitting} className="font-['Yu_Mincho']" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tác giả</FormLabel>
                    <FormControl>
                      <Input placeholder="宝島社" {...field} disabled={isSubmitting} className="font-['Yu_Mincho']" />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">Để trống sẽ dùng giá trị mặc định &quot;宝島社&quot;</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="releaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày phát hành</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="viURL"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link bản dịch tiếng Việt</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel htmlFor="cover">Ảnh bìa</FormLabel>
                <Input id="cover" type="file" accept="image/*" onChange={handleCoverChange} disabled={isSubmitting} />
                <p className="text-xs text-muted-foreground mt-1">{konorano ? "Để trống nếu không muốn thay đổi ảnh bìa" : "Chọn file ảnh bìa"}</p>
              </div>

              <div>
                <FormLabel htmlFor="konorano">File sách</FormLabel>
                <Input id="konorano" type="file" accept=".epub,.pdf" onChange={handleKonoranoFileChange} disabled={isSubmitting || isParsing} />
                <p className="text-xs text-muted-foreground mt-1">
                  {isParsing
                    ? "Đang đọc thông tin từ EPUB..."
                    : konorano
                      ? "Để trống nếu không muốn thay đổi file sách · Chọn file EPUB sẽ tự điền tên/ngày/ảnh bìa"
                      : "Chọn file .epub hoặc .pdf · Chọn file EPUB sẽ tự điền tên/ngày/ảnh bìa"}
                </p>
              </div>
            </div>
          </div>

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
