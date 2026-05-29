"use client";

import { useState, useRef } from "react";
import { ContentCard } from "@/components/common/content-card";
import { Konorano } from "@/lib/types";
import { Pagination } from "@/components/ui/pagination";

interface KonoranoGridInteractiveProps {
  initialKonoranos: Konorano[];
}

export function KonoranoGridInteractive({ initialKonoranos }: KonoranoGridInteractiveProps) {
  const [allKonoranos] = useState<Konorano[]>(initialKonoranos);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const filterRef = useRef<HTMLDivElement>(null);

  const sortedKonoranos = [...allKonoranos].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return dateB - dateA;
  });

  const totalPages = Math.ceil(sortedKonoranos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKonoranos = sortedKonoranos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (filterRef.current) {
      const filterTop = filterRef.current.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({
        top: filterTop,
        behavior: "smooth",
      });
    }
  };

  if (allKonoranos.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Chưa có konorano nào trong thư viện</div>;
  }

  return (
    <>
      <div ref={filterRef} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
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
