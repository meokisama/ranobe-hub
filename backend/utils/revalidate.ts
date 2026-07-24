// Gọi endpoint on-demand revalidation của frontend để dựng lại trang ISR ngay
// sau khi thêm/sửa/xóa sách, thay vì chờ hết chu kỳ 6h.
//
// Chạy trong setImmediate ở controller nên không block response. Mọi lỗi (frontend
// tắt, sai secret, timeout...) chỉ log chứ không làm hỏng request đã thành công.
export const revalidateFrontend = async (tags: string | string[]): Promise<void> => {
  const secret = process.env.REVALIDATE_SECRET;
  const frontendUrl = process.env.FRONTEND_URL;

  // Chưa cấu hình → bỏ qua, ISR vẫn tự làm mới sau 6h
  if (!secret || !frontendUrl) return;

  const list = Array.isArray(tags) ? tags : [tags];

  try {
    const res = await fetch(`${frontendUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags: list }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`Revalidate frontend thất bại (${res.status}) cho tag: ${list.join(", ")}`);
    }
  } catch (err) {
    console.error("Lỗi khi gọi revalidate frontend:", err instanceof Error ? err.message : err);
  }
};
