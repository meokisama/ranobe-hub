"use client";

import { useEffect, useState, useRef } from "react";
import { ContentCard } from "@/components/common/content-card";
import { api } from "@/lib/api";
import { Konorano } from "@/lib/types";
// import { ContentFilters } from "@/components/shared/content-filters";
import { Pagination } from "@/components/ui/pagination";

export function KonoranoGrid() {
  const [allKonoranos, setAllKonoranos] = useState<Konorano[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchKonoranos = async () => {
      try {
        setLoading(true);
        const res = await api.get("/konoranos");
        setAllKonoranos(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách konorano:", err);
        setError("Không thể tải danh sách konorano");
      } finally {
        setLoading(false);
      }
    };

    fetchKonoranos();
  }, []);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder]);

  // Filter konoranos
  const filteredKonoranos = allKonoranos.filter((konorano) => {
    const matchesSearch = searchQuery
      ? konorano.name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesSearch;
  });

  // Sort konoranos
  const sortedKonoranos = [...filteredKonoranos].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedKonoranos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentKonoranos = sortedKonoranos.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to filter section
    if (filterRef.current) {
      const filterTop =
        filterRef.current.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({
        top: filterTop,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  if (allKonoranos.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Chưa có konorano nào trong thư viện
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 pb-12">
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
      <div ref={filterRef}>
        {/* <ContentFilters
          contentType="konorano"
          onSearch={setSearchQuery}
          onSort={setSortOrder}
        /> */}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
        {currentKonoranos.map((konorano) => (
          <ContentCard
            key={konorano._id}
            contentType="konorano"
            content={konorano}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
