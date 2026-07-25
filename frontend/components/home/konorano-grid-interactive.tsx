"use client";

import { useMemo, useRef, useState } from "react";
import { ContentCard } from "@/components/common/content-card";
import { Konorano } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";
import { sortByDate } from "@/lib/sort";
import { scrollToRef } from "@/lib/utils";

const ITEMS_PER_PAGE = 5;

interface KonoranoGridInteractiveProps {
  initialKonoranos: Konorano[];
}

export function KonoranoGridInteractive({ initialKonoranos }: KonoranoGridInteractiveProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const sortedKonoranos = useMemo(() => sortByDate(initialKonoranos, "desc", (k) => k.releaseDate), [initialKonoranos]);

  const totalPages = Math.ceil(sortedKonoranos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentKonoranos = sortedKonoranos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToRef(gridTopRef);
  };

  if (initialKonoranos.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Chưa có konorano nào trong thư viện</div>;
  }

  return (
    <>
      <div ref={gridTopRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
        {currentKonoranos.map((konorano) => (
          <ContentCard key={konorano._id} contentType="konorano" content={konorano} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </>
  );
}
