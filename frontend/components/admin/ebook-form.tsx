"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Ebook } from "@/lib/types";
import Image from "next/image";
import { PublisherDialog } from "./publisher-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EbookFormProps {
  ebook: Ebook | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface Publisher {
  _id: string;
  name: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Tên sách không được để trống" }),
  author: z.string().min(1, { message: "Tên tác giả không được để trống" }),
  illustrator: z.string().optional(),
  releaseDate: z.string().min(1, { message: "Ngày phát hành không được để trống" }),
  publisher: z.string().min(1, { message: "Nhãn hiệu không được để trống" }),
});

export function EbookForm({ ebook, onSuccess, onCancel }: EbookFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    ebook ? `${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${ebook.coverImage}` : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ebook?.name || "",
      author: ebook?.author || "",
      illustrator: ebook?.illustrator === "Unknown" ? "" : ebook?.illustrator || "",
      releaseDate: ebook?.releaseDate ? new Date(ebook.releaseDate).toISOString().split("T")[0] : "",
      publisher: ebook?.publisher._id || "",
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
    fetchPublishers();
  }, []);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(file);

      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEbookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setEbookFile(e.target.files[0]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);

      // Kiểm tra file khi thêm mới
      if (!ebook && !ebookFile) {
        toast.error("Lỗi", {
          description: "Vui lòng tải lên file ebook",
        });
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("author", values.author);
      formData.append("illustrator", values.illustrator || "Unknown");
      formData.append("releaseDate", values.releaseDate);
      formData.append("publisher", values.publisher);

      if (coverFile) {
        formData.append("cover", coverFile);
      }

      if (ebookFile) {
        formData.append("ebook", ebookFile);
      }

      let response;
      if (ebook) {
        // Cập nhật
        response = await api.put(`/ebooks/${ebook._id}`, formData, {
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
        response = await api.post("/ebooks", formData, {
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
      console.error("Lỗi khi lưu ebook:", error);
      toast.error("Lỗi", {
        description: "Không thể lưu thông tin ebook. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{ebook ? "Chỉnh sửa" : "Thêm mới"} Ebook</DialogTitle>
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

            <div className="flex-1 shrink-1 space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên sách</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} className="font-['Yu_Mincho']" />
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
                      <Input {...field} disabled={isSubmitting} className="font-['Yu_Mincho']" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="illustrator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họa sĩ (không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} className="font-['Yu_Mincho']" />
                    </FormControl>
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
                      <Input type="date" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhãn hiệu</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhãn hiệu" />
                          </SelectTrigger>
                          <SelectContent>
                            {publishers.map((publisher) => (
                              <SelectItem key={publisher._id} value={publisher._id}>
                                {publisher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <PublisherDialog onClose={fetchPublishers} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <label className="block text-sm font-medium mb-1">{coverPreview ? "Thay đổi ảnh bìa" : "Tải lên ảnh bìa"}</label>
                <Input type="file" accept="image/*" onChange={handleCoverChange} disabled={isSubmitting} />
                <p className="text-xs text-muted-foreground mt-1">Định dạng: JPG, PNG, GIF</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{ebook ? "Thay đổi file ebook (không bắt buộc)" : "Tải lên file ebook"}</label>
                <Input type="file" accept=".epub,.pdf" onChange={handleEbookChange} disabled={isSubmitting} />
                <p className="text-xs text-muted-foreground mt-1">Định dạng: EPUB, PDF</p>
                {ebook && <p className="text-xs font-medium mt-2">File hiện tại: {ebook.filePath}</p>}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : ebook ? "Cập nhật" : "Thêm mới"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
