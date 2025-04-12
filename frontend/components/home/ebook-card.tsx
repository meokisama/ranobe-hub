import Image from "next/image";
import Link from "next/link";
import { Ebook } from "@/lib/types";
import { Button } from "../ui/button";
import { Book } from "lucide-react";

interface EbookCardProps {
  ebook: Ebook;
}

export function EbookCard({ ebook }: EbookCardProps) {
  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="rounded-lg overflow-hidden w-full aspect-[112/159] shadow-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${ebook.coverImage}`}
            alt={ebook.name}
            width={300}
            height={430}
            className="w-full h-full object-cover scale-[101.5%]"
          />
        </div>
        <div className="mt-4 font-['Yu_Mincho']">
          <p className="font-bold text-gray-800 line-clamp-2">{ebook.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {ebook.author} / {ebook.illustrator}
          </p>
        </div>
      </div>
      <Link
        href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${ebook.filePath}`}
        target="_blank"
      >
        <Button className="w-full mt-3 cursor-pointer shadow-lg bg-zinc-800 shadow-zinc-800/50 hover:bg-zinc-900">
          <Book className="w-4 h-4" />
          Đọc sách
        </Button>
      </Link>
    </div>
  );
}
