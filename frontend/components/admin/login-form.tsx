"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.75} />
                  <input
                    type="password"
                    placeholder="Mật khẩu admin"
                    autoComplete="current-password"
                    autoFocus
                    {...field}
                    disabled={isLoading}
                    className="h-12 w-full border-b border-foreground/35 bg-transparent pl-7 text-base outline-none transition-colors placeholder:font-light placeholder:text-muted-foreground focus:border-shu disabled:opacity-60"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="group flex h-13 w-full cursor-pointer items-center justify-between rounded-full bg-sumi pl-7 pr-2.5 text-sm font-medium text-paper transition-colors duration-300 hover:bg-shu disabled:opacity-70"
        >
          {isLoading ? "Đang xử lý…" : "Đăng nhập"}
          <span className="grid size-8 place-items-center rounded-full bg-paper text-sumi">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} />
            )}
          </span>
        </button>
      </form>
    </Form>
  );
}
