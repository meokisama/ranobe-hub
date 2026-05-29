"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { ContentCard } from "@/components/common/content-card";
import { Ebook, Publisher } from "@/lib/types";
import { ContentFilters } from "@/components/common/content-filters";
import { Pagination } from "@/components/ui/pagination";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";

const EBOOK_SEARCH_KEYS: ReadonlyArray<FuzzyKey<Ebook>> = [
  { name: "name", weight: 3 },
  { name: "author", weight: 1 },
  { name: "illustrator", weight: 1 },
];

interface EbookGridInteractiveProps {
  initialEbooks: Ebook[];
  initialPublishers: Publisher[];
}

export function EbookGridInteractive({ initialEbooks, initialPublishers }: EbookGridInteractiveProps) {
  const [allEbooks] = useState<Ebook[]>(initialEbooks);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortOrder, selectedPublisher]);

  const publisherFiltered = useMemo(
    () => (selectedPublisher ? allEbooks.filter((e) => e.publisher._id === selectedPublisher) : allEbooks),
    [allEbooks, selectedPublisher],
  );

  const searchedEbooks = useFuzzySearch(publisherFiltered, searchQuery, EBOOK_SEARCH_KEYS);

  const sortedEbooks = useMemo(() => {
    if (searchQuery.trim()) return searchedEbooks;
    const arr = searchedEbooks.slice();
    arr.sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    return arr;
  }, [searchedEbooks, searchQuery, sortOrder]);

  const totalPages = Math.ceil(sortedEbooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEbooks = sortedEbooks.slice(startIndex, endIndex);

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

  if (allEbooks.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">Chưa có ebook nào trong thư viện</div>;
  }

  return (
    <>
      <div ref={filterRef}>
        <ContentFilters
          contentType="ebook"
          onSearch={setSearchQuery}
          onSort={setSortOrder}
          onPublisherFilter={setSelectedPublisher}
          initialPublishers={initialPublishers}
        />
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
    </>
  );
}
