"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { setAdminToken } from "@/lib/auth-cookies";
import { toast } from "sonner";
import axios from "axios";

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      const res = await api.post("/admin/login", { password: values.password });
      setAdminToken(res.data.token);

      toast.success("Đăng nhập thành công", {
        description: "Đang chuyển hướng đến trang quản trị...",
      });
      router.push("/admin");
    } catch (error) {
      const msg = axios.isAxiosError<{ msg?: string }>(error) ? error.response?.data?.msg : undefined;
      toast.error("Đăng nhập thất bại", { description: msg || "Có lỗi xảy ra" });
      console.error("Lỗi đăng nhập:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-orange-500/70" />
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu admin"
                    {...field}
                    disabled={isLoading}
                    className="h-11 border-orange-200/70 bg-white/80 pl-10 shadow-sm transition-colors focus-visible:border-orange-400 focus-visible:ring-orange-300/40 dark:border-orange-900/40 dark:bg-background/40"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="group relative h-11 w-full overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-rose-500 text-white shadow-md shadow-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-400/60 hover:brightness-105 disabled:opacity-80"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {isLoading ? (
            <span className="relative flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" />
              Đang xử lý...
            </span>
          ) : (
            <span className="relative">Đăng nhập</span>
          )}
        </Button>
      </form>
    </Form>
  );
}
