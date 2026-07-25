import { Ebook, Publisher } from "@/lib/types";
import { fetchList } from "@/lib/server-fetch";
import { EbookGridInteractive } from "./ebook-grid-interactive";

export async function EbookGrid() {
  const [ebooks, publishers] = await Promise.all([
    fetchList<Ebook>("/ebooks?limit=1000", "ebooks", "ebooks"),
    fetchList<Publisher>("/publishers", "publishers", ""),
  ]);

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
