import { Konorano } from "@/lib/types";
import { fetchList } from "@/lib/server-fetch";
import { KonoranoGridInteractive } from "./konorano-grid-interactive";

export async function KonoranoGrid() {
  const konoranos = await fetchList<Konorano>("/konoranos?limit=1000", "konoranos", "konoranos");

  return (
    <div className="max-w-screen-xl mx-auto p-4 pb-12 isolate">
      <div className="flex flex-col items-center justify-center relative select-none pointer-events-none">
        <h2 className="font-black font-poppins tracking-[-0.3vw] hidden lg:block text-[16vw] xl:text-[14vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          KONORANO
        </h2>
        <h2 className="font-black font-poppins tracking-[-0.3vw] block lg:hidden text-[30vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          KONO
        </h2>
        <h2 className="font-black -mt-[22vw] font-poppins tracking-[-0.3vw] block lg:hidden text-[30vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          RANO
        </h2>
        <div className="absolute flex flex-col">
          <div className="relative inline-block">
            <span className="text-orange-500 relative z-100 text-[6vw] md:text-[4vw] xl:text-[2vw] font-['Yu_Mincho'] p-2 px-4">
              このライトノベルがすごい！
            </span>
            <span className="absolute z-99 inset-0 bg-orange-100/50 transform -skew-x-19"></span>
          </div>
        </div>
      </div>
      <KonoranoGridInteractive initialKonoranos={konoranos} />
    </div>
  );
}
