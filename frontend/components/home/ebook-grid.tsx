import { Ebook, Publisher } from "@/lib/types";
import { EbookGridInteractive } from "./ebook-grid-interactive";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function getEbooks(): Promise<Ebook[]> {
  try {
    const res = await fetch(`${API_BASE}/api/ebooks?limit=1000`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.ebooks ?? [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách ebook:", err);
    return [];
  }
}

async function getPublishers(): Promise<Publisher[]> {
  try {
    const res = await fetch(`${API_BASE}/api/publishers`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Lỗi khi tải danh sách nhãn hiệu:", err);
    return [];
  }
}

export async function EbookGrid() {
  const [ebooks, publishers] = await Promise.all([getEbooks(), getPublishers()]);

  return (
    <div className="max-w-screen-xl mx-auto p-4 min-h-screen isolate">
      <div className="flex flex-col items-center justify-center relative select-none pointer-events-none">
        <h2 className="font-black font-poppins tracking-[-0.3vw] text-[23vw] xl:text-[14vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          EBOOKS
        </h2>
        <div className="absolute flex flex-col">
          <div className="relative inline-block">
            <span className="text-orange-500 relative z-100 text-[5vw] md:text-[4vw] xl:text-[2vw] font-['Yu_Mincho'] p-2 px-4">
              無料で共有されている電子書籍!
            </span>
            <span className="absolute z-99 inset-0 bg-orange-100/50 transform -skew-x-19"></span>
          </div>
        </div>
      </div>
      <EbookGridInteractive initialEbooks={ebooks} initialPublishers={publishers} />
    </div>
  );
}
