import { sendGAEvent } from "@next/third-parties/google";

/** GA4 `read_book` event, fired when a visitor opens a book in the reader or its translation. */
export function trackRead(id: string, name: string, type: "ebook" | "konorano", source: "jp_reader" | "vi_translation") {
  sendGAEvent("event", "read_book", {
    book_id: id,
    book_name: name,
    book_type: type,
    source,
  });
}
