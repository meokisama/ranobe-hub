"use client";

import { useEffect, useState } from "react";
import { EbookCard } from "./ebook-card";
import { api } from "@/lib/api";
import { Ebook } from "@/lib/types";
import { EbookFilters } from "./ebook-filters";

export function EbookGrid() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [filteredEbooks, setFilteredEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPublisher, setSelectedPublisher] = useState("");

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/ebooks");
        setEbooks(res.data);
        setFilteredEbooks(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ebook:", err);
        setError("Không thể tải danh sách ebook");
      } finally {
        setLoading(false);
      }
    };

    fetchEbooks();
  }, []);

  useEffect(() => {
    let filtered = [...ebooks];

    // Áp dụng tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (ebook) =>
          ebook.name.toLowerCase().includes(query) ||
          ebook.author.toLowerCase().includes(query) ||
          ebook.illustrator.toLowerCase().includes(query)
      );
    }

    // Áp dụng lọc theo nhãn hiệu
    if (selectedPublisher) {
      filtered = filtered.filter(
        (ebook) => ebook.publisher._id === selectedPublisher
      );
    }

    // Áp dụng sắp xếp theo ngày phát hành
    filtered.sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredEbooks(filtered);
  }, [ebooks, searchQuery, sortOrder, selectedPublisher]);

  if (loading) {
    return <div className="flex justify-center py-12">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  if (ebooks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Chưa có ebook nào trong thư viện
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto p-4 min-h-screen pb-12">
      <EbookFilters
        onSearch={setSearchQuery}
        onSort={setSortOrder}
        onPublisherFilter={setSelectedPublisher}
      />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-y-10">
        {filteredEbooks.map((ebook) => (
          <EbookCard key={ebook._id} ebook={ebook} />
        ))}
      </div>
    </div>
  );
}
