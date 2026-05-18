"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

// import { useEffect, useState, useRef } from "react";
// import { ContentCard } from "@/components/common/content-card";
// import { api } from "@/lib/api";
// import { Ebook } from "@/lib/types";
// import { ContentFilters } from "@/components/common/content-filters";
// import { Pagination } from "@/components/ui/pagination";

export function MagazineGrid() {
  // const [allEbooks, setAllEbooks] = useState<Ebook[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  // const [searchQuery, setSearchQuery] = useState("");
  // const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // const [selectedPublisher, setSelectedPublisher] = useState("");
  // const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 15;
  // const filterRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const fetchEbooks = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await api.get("/ebooks");
  //       setAllEbooks(res.data);
  //     } catch (err) {
  //       console.error("Lỗi khi tải danh sách ebook:", err);
  //       setError("Không thể tải danh sách ebook");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchEbooks();
  // }, []);

  // Reset current page when filters change
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, sortOrder, selectedPublisher]);

  // Filter and sort ebooks
  // const filteredEbooks = allEbooks.filter((ebook) => {
  //   const matchesSearch = searchQuery
  //     ? ebook.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       ebook.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       ebook.illustrator.toLowerCase().includes(searchQuery.toLowerCase())
  //     : true;

  //   const matchesPublisher = selectedPublisher
  //     ? ebook.publisher._id === selectedPublisher
  //     : true;

  //   return matchesSearch && matchesPublisher;
  // });

  // Sort ebooks
  // const sortedEbooks = [...filteredEbooks].sort((a, b) => {
  //   const dateA = new Date(a.releaseDate).getTime();
  //   const dateB = new Date(b.releaseDate).getTime();
  //   return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  // });

  // Calculate pagination
  // const totalPages = Math.ceil(sortedEbooks.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const currentEbooks = sortedEbooks.slice(startIndex, endIndex);

  // const handlePageChange = (page: number) => {
  //   setCurrentPage(page);
  //   // Smooth scroll to filter section
  //   if (filterRef.current) {
  //     const filterTop =
  //       filterRef.current.getBoundingClientRect().top + window.scrollY - 50;
  //     window.scrollTo({
  //       top: filterTop,
  //       behavior: "smooth",
  //     });
  //   }
  // };

  // if (loading) {
  //   return <div className="flex justify-center py-12">Đang tải...</div>;
  // }

  // if (error) {
  //   return <div className="text-center text-red-500 py-12">{error}</div>;
  // }

  // if (allEbooks.length === 0) {
  //   return (
  //     <div className="text-center py-12 text-muted-foreground">
  //       Chưa có ebook nào trong thư viện
  //     </div>
  //   );
  // }

  return (
    <div className="max-w-screen-xl mx-auto p-4 mb-20 isolate">
      <div className="flex flex-col items-center justify-center relative select-none pointer-events-none">
        <h2 className="font-black font-poppins tracking-[-0.3vw] text-[18vw] xl:text-[14vw] text-white drop-shadow-[0px_5px_10px_rgba(255,139,39,0.1)]">
          MAGAZINE
        </h2>
        <div className="absolute flex flex-col">
          <div className="relative inline-block">
            <span className="text-orange-500 relative z-100 text-[5vw] md:text-[4vw] xl:text-[2vw] font-['Yu_Mincho'] p-2 px-4">
              ライトノベル専門誌!
            </span>
            <span className="absolute z-99 inset-0 bg-orange-100/50 transform -skew-x-19"></span>
          </div>
        </div>
      </div>
      {/* <div ref={filterRef}>
        <ContentFilters
          contentType="ebook"
          onSearch={setSearchQuery}
          onSort={setSortOrder}
          onPublisherFilter={setSelectedPublisher}
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
        {currentEbooks.map((ebook) => (
          <ContentCard key={ebook._id} contentType="ebook" content={ebook} />
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
      )} */}
      <div className="flex flex-col justify-center items-center gap-8 md:gap-12">
        <div className="font-light border border-orange-300 rounded-lg md:rounded-xl p-4 space-y-3 text-orange-900/90 max-w-4xl backdrop-blur shadow-lg md:shadow-xl shadow-orange-300/30">
          <p>
            Thị trường tạp chí Light Novel đã suy thoái nhanh chóng kể từ những năm 2010,{" "}
            <span className="font-bold text-orange-600">「The Sneaker」</span> (nhà Sneaker Bunko, Kadokawa Shoten) ngừng phát hành vào năm 2011,{" "}
            <span className="font-bold text-orange-600">「Dengeki Bunko Magazine」</span> (nhà Dengeki, Media Works nay thuộc Kadokawa) cũng bị ngừng
            xuất bản từ năm 2020.
          </p>
          <p>
            Và <span className="font-bold text-orange-600">「Dragon Magazine」</span> (nhà Fantasia Bunko, Fujimi Shobo thuộc Kadokawa), tạp chí Light
            Novel duy nhất còn lẻ loi sót lại, cũng đã tuyên bố ngừng xuất bản sau số phát hành cuối cùng của họ vào tháng 05/2025 vừa rồi, ngay sau
            khi vừa kỉ niệm 35 năm xong.
          </p>
          <p>
            Để kỉ niệm sự kiện này, chuyên mục chia sẻ tạp chí cũng xin được ngừng lại tại đây.{" "}
            <span className="line-through">
              Khụ, chứ không phải do mỗi cuốn tạp chí đều nặng xấp xỉ 100MB, tương đương 10 cuốn light novel, server của mình hết lưu nổi nên xóa đâu.
            </span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="https://ranobe.vn" target="_blank">
            <Button size="lg" className="cursor-pointer bg-orange-700 hover:bg-orange-800 py-6 text-white shadow-lg md:shadow-xl shadow-orange-300/30">
              Thay vào đó, đọc blog
              <ArrowRight className="size-5" />
            </Button>
          </Link>
          <Link href="/resources">
            <Button size="lg" className="cursor-pointer bg-orange-700 hover:bg-orange-800 py-6 text-white shadow-lg md:shadow-xl shadow-orange-300/30">
              Hoặc, tới bộ sưu tập Hako
              <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
