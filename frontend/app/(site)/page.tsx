import { Epilogue } from "@/components/home/epilogue";
import { HomeShelf } from "@/components/home/home-shelf";
import { KonoranoShelf } from "@/components/home/konorano-shelf";
import { fetchList } from "@/lib/server-fetch";
import type { Ebook, Konorano } from "@/lib/types";

export default async function HomePage() {
  const [ebooks, konoranos] = await Promise.all([
    fetchList<Ebook>("/ebooks?limit=1000", "ebooks", "ebooks"),
    fetchList<Konorano>("/konoranos?limit=1000", "konoranos", "konoranos"),
  ]);

  return (
    <>
      <HomeShelf ebooks={ebooks} />
      <KonoranoShelf items={konoranos} />
      <Epilogue />
    </>
  );
}
