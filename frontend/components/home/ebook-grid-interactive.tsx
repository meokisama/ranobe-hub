"use client";

import { useMemo, useState, useRef } from "react";
import { ContentCard } from "@/components/common/content-card";
import { Ebook, Publisher } from "@/lib/types";
import { ContentFilters } from "@/components/common/content-filters";
import { Pagination } from "@/components/ui/pagination";
import { useFuzzySearch, type FuzzyKey } from "@/lib/fuzzy-search";
import { sortByDate, type SortOrder } from "@/lib/sort";
import { scrollToRef } from "@/lib/utils";

const ITEMS_PER_PAGE = 15;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const filterRef = useRef<HTMLDivElement>(null);

  const publisherFiltered = useMemo(
    () => (selectedPublisher ? initialEbooks.filter((e) => e.publisher._id === selectedPublisher) : initialEbooks),
    [initialEbooks, selectedPublisher],
  );

  const searchedEbooks = useFuzzySearch(publisherFiltered, searchQuery, EBOOK_SEARCH_KEYS);

  // A query already ranks by relevance; only sort by date when browsing.
  const sortedEbooks = useMemo(
    () => (searchQuery.trim() ? searchedEbooks : sortByDate(searchedEbooks, sortOrder, (e) => e.releaseDate)),
    [searchedEbooks, searchQuery, sortOrder],
  );

  const totalPages = Math.ceil(sortedEbooks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEbooks = sortedEbooks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToRef(filterRef);
  };

  if (initialEbooks.length === 0) {
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
          onFilterChange={() => setCurrentPage(1)}
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
