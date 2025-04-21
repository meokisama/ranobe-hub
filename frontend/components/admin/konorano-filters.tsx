"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface KonoranoFiltersProps {
  onSearch: (search: string) => void;
  onSort: (sort: "asc" | "desc") => void;
}

export function KonoranoFilters({
  onSearch,
  onSort,
}: KonoranoFiltersProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleSort = (value: "asc" | "desc") => {
    setSort(value);
    onSort(value);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          placeholder="Tìm kiếm theo tên sách..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 h-12 backdrop-blur"
        />
      </div>

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
