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

interface KonoranoFormProps {
  konorano: Konorano | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên sách không được để trống" }),
  author: z.string().optional(),
  releaseDate: z.string().min(1, { message: "Ngày phát hành không được để trống" }),
  viURL: z.string().min(1, { message: "Link bản dịch tiếng Việt không được để trống" }).url({ message: "Link không hợp lệ" }),
});

export function KonoranoForm({ konorano, onSuccess, onCancel }: KonoranoFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [konoranoFile, setKonoranoFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    konorano ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${konorano.coverImage}` : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: konorano?.name || "",
      author: konorano?.author || "宝島社",
      releaseDate: konorano?.releaseDate ? new Date(konorano.releaseDate).toISOString().split("T")[0] : "",
      viURL: konorano?.viURL || "",
    },
  });

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);

      // Preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === "string") {
          setCoverPreview(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKonoranoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKonoranoFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Kiểm tra file upload
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

      // Thêm file nếu có
      if (coverFile) {
        formData.append("cover", coverFile);
      }

      if (konoranoFile) {
        formData.append("konorano", konoranoFile);
      }

      let response;
      if (konorano) {
        // Cập nhật
        response = await api.put(`/konoranos/${konorano._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Cập nhật thành công", {
          description: `Đã cập nhật thông tin cho "${values.name}"`,
        });
      } else {
        // Thêm mới
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        response = await api.post("/konoranos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
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
                  <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
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
                <Input id="cover" type="file" accept="image/*" onChange={handleCoverChange} />
                <p className="text-xs text-muted-foreground mt-1">{konorano ? "Để trống nếu không muốn thay đổi ảnh bìa" : "Chọn file ảnh bìa"}</p>
              </div>

              <div>
                <FormLabel htmlFor="konorano">File sách</FormLabel>
                <Input id="konorano" type="file" accept=".epub,.pdf" onChange={handleKonoranoFileChange} />
                <p className="text-xs text-muted-foreground mt-1">
                  {konorano ? "Để trống nếu không muốn thay đổi file sách" : "Chọn file .epub hoặc .pdf"}
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
