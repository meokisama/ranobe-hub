import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Valid tags, matching those attached to the ISR fetches
const VALID_TAGS = new Set(["ebooks", "publishers", "konoranos", "hakos"]);

// On-demand revalidation endpoint: backend calls this after adding/editing/deleting
// a book to rebuild pages immediately instead of waiting out the 6h ISR.
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
