import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Các tag hợp lệ, khớp với tag đã gắn ở các fetch ISR
const VALID_TAGS = new Set(["ebooks", "publishers", "konoranos", "hakos"]);

// Endpoint on-demand revalidation: backend gọi sau khi thêm/sửa/xóa sách
// để dựng lại trang ngay thay vì chờ hết 6h ISR.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ msg: "Không có quyền" }, { status: 401 });
  }

  let tags: unknown;
  try {
    ({ tags } = await req.json());
  } catch {
    return NextResponse.json({ msg: "Body không hợp lệ" }, { status: 400 });
  }

  const list = (Array.isArray(tags) ? tags : [tags]).filter((t): t is string => typeof t === "string" && VALID_TAGS.has(t));

  if (list.length === 0) {
    return NextResponse.json({ msg: "Không có tag hợp lệ" }, { status: 400 });
  }

  for (const tag of list) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: list });
}
