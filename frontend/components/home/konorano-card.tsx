import Image from "next/image";
import Link from "next/link";
import { Konorano } from "@/lib/types";
import { Button } from "../ui/button";
import { Book, ExternalLink } from "lucide-react";

interface KonoranoCardProps {
  konorano: Konorano;
}

export function KonoranoCard({ konorano }: KonoranoCardProps) {
  return (
    <div className="flex flex-col justify-between">
      <div>
        <div className="rounded-lg overflow-hidden w-full aspect-[112/159] shadow-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/covers/${konorano.coverImage}`}
            alt={konorano.name}
            width={300}
            height={430}
            className="w-full h-full object-cover scale-[101.5%]"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P7jfwAJNQNlJq2hkgAAAABJRU5ErkJggg=="
          />
        </div>
        <div className="mt-4 font-['Yu_Mincho']">
          <p className="font-bold text-gray-800 line-clamp-2">
            {konorano.name}
          </p>
          <p className="text-sm text-gray-600 mt-1">{konorano.author}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-3">
        <Link
          href={`${process.env.NEXT_PUBLIC_API_URL}/reader?book=${konorano.filePath}`}
          target="_blank"
        >
          <Button className="w-full cursor-pointer shadow-lg bg-zinc-800 shadow-zinc-800/50 hover:bg-zinc-900">
            <Book className="w-4 h-4 mr-1" />
            Bản gốc (JP)
          </Button>
        </Link>
        <Link href={konorano.viURL} target="_blank">
          <Button className="w-full cursor-pointer shadow-lg bg-blue-600 shadow-blue-600/50 hover:bg-blue-700">
            <ExternalLink className="w-4 h-4" />
            Bản dịch (VN)
          </Button>
        </Link>
      </div>
    </div>
  );
}
