"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Publisher } from "@/lib/types";
import { loadPublishers } from "@/lib/publishers";
import type { SortOrder } from "@/lib/sort";

type ContentType = "ebook" | "konorano" | "hako";

const PLACEHOLDERS: Record<ContentType, string> = {
  ebook: "Tìm kiếm theo tên sách, tác giả, họa sĩ...",
  hako: "Tìm theo tên, uploader, translator hoặc ID...",
  konorano: "Tìm kiếm theo tên sách...",
};

interface ContentFiltersProps {
  contentType: ContentType;
  onSearch: (search: string) => void;
  onSort: (sort: SortOrder) => void;
  onPublisherFilter?: (publisher: string) => void;
  /** Fired on any filter change so the caller can reset pagination. */
  onFilterChange?: () => void;
  initialPublishers?: Publisher[];
}

export function ContentFilters({ contentType, onSearch, onSort, onPublisherFilter, onFilterChange, initialPublishers }: ContentFiltersProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOrder>("desc");
  const [selectedPublisher, setSelectedPublisher] = useState<string>("all");
  const [publishers, setPublishers] = useState<Publisher[]>(initialPublishers ?? []);

  const isEbook = contentType === "ebook";

  useEffect(() => {
    if (!isEbook || initialPublishers) return;
    let cancelled = false;
    loadPublishers()
      .then((list) => {
        if (!cancelled) setPublishers(list);
      })
      .catch((error) => console.error("Lỗi khi lấy danh sách nhãn hiệu:", error));
    return () => {
      cancelled = true;
    };
  }, [isEbook, initialPublishers]);

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch(value);
    onFilterChange?.();
  };

  const handleSort = (value: SortOrder) => {
    setSort(value);
    onSort(value);
    onFilterChange?.();
  };

  const handlePublisherFilter = (value: string) => {
    if (!onPublisherFilter) return;

    setSelectedPublisher(value);
    onPublisherFilter(value === "all" ? "" : value);
    onFilterChange?.();
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input placeholder={PLACEHOLDERS[contentType]} value={search} onChange={(e) => handleSearch(e.target.value)} className="pl-9 h-12 backdrop-blur" />
      </div>

      {isEbook && onPublisherFilter && (
        <Select value={selectedPublisher} onValueChange={handlePublisherFilter}>
          <SelectTrigger className="w-full md:w-[200px] data-[size=default]:h-12 backdrop-blur">
            <SelectValue placeholder="Lọc theo nhãn hiệu" />
          </SelectTrigger>
          <SelectContent className="py-2">
            <SelectItem value="all">Tất cả</SelectItem>
            {publishers.map((publisher) => (
              <SelectItem key={publisher._id} value={publisher._id}>
                {publisher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sort} onValueChange={handleSort}>
        <SelectTrigger className="w-full md:w-[200px] data-[size=default]:h-12 backdrop-blur">
          <SelectValue placeholder="Sắp xếp theo ngày" />
        </SelectTrigger>
        <SelectContent className="py-2">
          <SelectItem value="desc">Mới nhất</SelectItem>
          <SelectItem value="asc">Cũ nhất</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
