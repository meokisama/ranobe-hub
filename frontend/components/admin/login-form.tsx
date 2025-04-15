"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api, getCsrfToken } from "@/lib/api";
import { toast } from "sonner";

const formSchema = z.object({
  password: z.string().min(1, {
    message: "Mật khẩu không được để trống",
  }),
});

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  // Lấy CSRF token khi component mount
  useEffect(() => {
    getCsrfToken();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      // Đảm bảo có CSRF token trước khi đăng nhập
      await getCsrfToken();

      const res = await api.post("/admin/login", { password: values.password });

      // Lưu token và thời gian hết hạn vào cookie
      document.cookie = `adminToken=${res.data.token}; path=/; max-age=${
        24 * 60 * 60
      }; SameSite=Strict`;
      document.cookie = `adminTokenExpires=${new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString()}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;

      toast.success("Đăng nhập thành công", {
        description: "Đang chuyển hướng đến trang quản trị...",
      });
      router.push("/admin");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Đăng nhập thất bại", {
        description: error.response?.data?.msg || "Có lỗi xảy ra",
      });
      console.error("Lỗi đăng nhập:", error);
    } finally {
      setIsLoading(false);
    }
  }

  // Kiểm tra token hết hạn
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
    };

    const tokenExpires = getCookie("adminTokenExpires");
    if (tokenExpires) {
      const expiresDate = new Date(tokenExpires);
      if (expiresDate < new Date()) {
        // Xóa cookie
        document.cookie =
          "adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        document.cookie =
          "adminTokenExpires=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
        router.push("/admin/login");
      }
    }
  }, [router]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu admin"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>
    </Form>
  );
}
