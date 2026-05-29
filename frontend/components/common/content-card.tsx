"use client";

import Image from "next/image";
import Link from "next/link";
import { sendGAEvent } from "@next/third-parties/google";
import { Ebook, Konorano } from "@/lib/types";
import { Button } from "../ui/button";
import { Book, ExternalLink } from "lucide-react";

type ContentCardProps = { contentType: "ebook"; content: Ebook } | { contentType: "konorano"; content: Konorano };

export function ContentCard(props: ContentCardProps) {
  const { contentType, content } = props;
  const isEbook = contentType === "ebook";

  // Common properties
  const coverImage = content.coverImage;
  const name = content.name;
  const author = content.author;
  const filePath = content.filePath.replace(/\.epub$/i, "");

  // Ebook-specific properties
  const illustrator = isEbook ? (content as Ebook).illustrator : null;

  // Konorano-specific properties
  const viURL = !isEbook ? (content as Konorano).viURL : null;

  const trackRead = (source: "jp_reader" | "vi_translation") => {
    sendGAEvent("event", "read_book", {
      book_id: content._id,
      book_name: name,
      book_type: contentType,
      source,
    });
  };

  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="rounded-lg overflow-hidden w-full aspect-[112/159] shadow-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${coverImage}`}
            alt={name}
            width={300}
            height={430}
            className="w-full h-full object-cover scale-[101.5%]"
            loading="lazy"
            fetchPriority="low"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P7jfwAJNQNlJq2hkgAAAABJRU5ErkJggg=="
          />
        </div>
        <div className="mt-4 font-['Yu_Mincho']">
          <p className="font-bold text-gray-800 line-clamp-2">{name}</p>
          <p className="text-sm text-gray-600 mt-1">{isEbook ? `${author} / ${illustrator}` : author}</p>
        </div>
      </div>

      {isEbook ? (
        // Ebook button
        <Link
          href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${filePath}`}
          target="_blank"
          onClick={() => trackRead("jp_reader")}
        >
          <Button className="w-full mt-3 cursor-pointer shadow-lg bg-zinc-800 shadow-zinc-800/50 hover:bg-zinc-900">
            <Book className="w-4 h-4 mr-1" />
            Đọc sách
          </Button>
        </Link>
      ) : (
        // Konorano buttons
        <div className="flex flex-col gap-2 mt-3">
          <Link
            href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${filePath}`}
            target="_blank"
            onClick={() => trackRead("jp_reader")}
          >
            <Button className="w-full cursor-pointer shadow-lg bg-zinc-800 shadow-zinc-800/50 hover:bg-zinc-900">
              <Book className="w-4 h-4 mr-1" />
              Bản gốc (JP)
            </Button>
          </Link>
          <Link href={viURL!} target="_blank" onClick={() => trackRead("vi_translation")}>
            <Button className="w-full cursor-pointer shadow-lg bg-blue-600 shadow-blue-600/50 hover:bg-blue-700">
              <ExternalLink className="w-4 h-4 mr-1" />
              Bản dịch (VN)
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
