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
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQzMCIgdmlld0JveD0iMCAwIDMwMCA0MzAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSI0MzAiIGZpbGw9InVybCgjbGluZWFyLWdyYWRpZW50KSIvPjxwYXRoIGQ9Ik0xNTAgMTUwQzE1MCAxMzQuMDMxIDE2My4wMzEgMTIxIDE3OSAxMjFIMjIxQzIzNi45NjkgMTIxIDI1MCAxMzQuMDMxIDI1MCAxNTBWMjUwQzI1MCAyNjUuOTY5IDIzNi45NjkgMjc5IDIyMSAyNzlIMTc5QzE2My4wMzEgMjc5IDE1MCAyNjUuOTY5IDE1MCAyNTBWMTUwWiIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PHBhdGggZD0iTTE1MCAxNTBDMTUwIDEzNC4wMzEgMTYzLjAzMSAxMjEgMTc5IDEyMUgyMjFDMTg1LjAzMSAxMjEgMTUwIDEzNC4wMzEgMTUwIDE1MFYyNTBDMTUwIDI2NS45NjkgMTg1LjAzMSAyNzkgMjIxIDI3OUgxNzlDMTYzLjAzMSAyNzkgMTUwIDI2NS45NjkgMTUwIDI1MFYxNTBaIiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjIiLz48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImxpbmVhci1ncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMzAwIiB5Mj0iNDMwIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHN0b3Agc3RvcC1jb2xvcj0iI2U1ZTVlNSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI2QxZDFkMSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=="
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
