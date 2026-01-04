"use client";

import { useEffect, useState, useRef } from "react";
import { ContentCard } from "@/components/common/content-card";
import { api } from "@/lib/api";
import { Ebook } from "@/lib/types";
import { ContentFilters } from "@/components/common/content-filters";
import { Pagination } from "@/components/ui/pagination";

export function EbookGrid() {
  const [allEbooks, setAllEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/ebooks?limit=1000");
        setAllEbooks(res.data.ebooks);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ebook:", err);
        setError("Không thể tải danh sách ebook");
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, []);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedPublisher]);

  // Filter and sort ebooks
  const filteredEbooks = allEbooks.filter((ebook) => {
    const matchesSearch = searchQuery
      ? ebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ebook.illustrator.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesPublisher = selectedPublisher ? ebook.publisher._id === selectedPublisher : true;

    return matchesSearch && matchesPublisher;
  });

  // Sort ebooks
  const sortedEbooks = [...filteredEbooks].sort((a, b) => {
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedEbooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEbooks = sortedEbooks.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Smooth scroll to filter section
    if (filterRef.current) {
      const filterTop = filterRef.current.getBoundingClientRect().top + window.scrollY - 50;
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

  if (allEbooks.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Chưa có ebook nào trong thư viện</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 min-h-screen">
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
      <div ref={filterRef}>
        <ContentFilters contentType="ebook" onSearch={setSearchQuery} onSort={setSortOrder} onPublisherFilter={setSelectedPublisher} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
        {currentEbooks.map((ebook) => (
          <ContentCard key={ebook._id} contentType="ebook" content={ebook} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
}
