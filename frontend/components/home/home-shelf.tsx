"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import type { Ebook } from "@/lib/types";
import { BookDetail } from "./book-detail";
import { Hero } from "./hero";
import { Library } from "./library";

const RING_SIZE = 10;

interface Selection {
  /** The order prev/next walks through: the ring, or the library's current results. */
  list: Ebook[];
  index: number;
}

/** Hero and library share one detail view, so they live under one client boundary. */
export function HomeShelf({ ebooks }: { ebooks: Ebook[] }) {
  const [selection, setSelection] = useState<Selection | null>(null);

  const newest = useMemo(
    () =>
      ebooks
        .slice()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, RING_SIZE),
    [ebooks],
  );
  const publisherCount = useMemo(() => new Set(ebooks.map((b) => b.publisher?._id).filter(Boolean)).size, [ebooks]);

  const openFromRing = useCallback((index: number) => setSelection({ list: newest, index }), [newest]);
  const openFromLibrary = useCallback((list: Ebook[], id: string) => {
    const index = list.findIndex((b) => b._id === id);
    if (index >= 0) setSelection({ list, index });
  }, []);
  const close = useCallback(() => setSelection(null), []);
  const step = useCallback((direction: 1 | -1) => {
    setSelection((current) => {
      if (!current) return current;
      const size = current.list.length;
      return { list: current.list, index: (current.index + direction + size) % size };
    });
  }, []);

  const book = selection?.list[selection.index];

  return (
    <>
      <Hero books={newest} total={ebooks.length} publisherCount={publisherCount} onOpen={openFromRing} />
      <Library ebooks={ebooks} onOpen={openFromLibrary} />
      <AnimatePresence>
        {selection && book && <BookDetail key="detail" book={book} position={selection.index + 1} total={selection.list.length} onClose={close} onStep={step} />}
      </AnimatePresence>
    </>
  );
}
