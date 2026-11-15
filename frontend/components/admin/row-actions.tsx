import { cn } from "@/lib/utils";

/** Book title cell: mincho, turns vermilion when its row is hovered. */
export const NAME_CELL = "max-w-[30rem] whitespace-normal font-mincho text-[15px] font-bold leading-snug transition-colors group-hover:text-shu";
/** Secondary Japanese text (author, illustrator). */
export const META_CELL = "font-mincho text-sm text-muted-foreground";

const PILL = "inline-flex h-8 cursor-pointer items-center rounded-full px-3.5 font-label text-[10.5px] uppercase tracking-[0.14em] transition-colors";

interface RowActionsProps {
  /** Reader link; `null` when the row has nothing to read yet. */
  readHref: string | null;
  onEdit: () => void;
  onDelete: () => void;
}

/** Read / edit / delete pills, the same shape as the file links on the public Hako archive. */
export function RowActions({ readHref, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {readHref ? (
        <a href={readHref} target="_blank" rel="noopener noreferrer" className={cn(PILL, "bg-sumi text-paper hover:bg-shu")}>
          Đọc
        </a>
      ) : (
        <span aria-disabled title="Chưa có epub" className={cn(PILL, "cursor-default border border-dashed border-foreground/15 text-foreground/25")}>
          Đọc
        </span>
      )}
      <button type="button" onClick={onEdit} className={cn(PILL, "border border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background")}>
        Sửa
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={cn(PILL, "border border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive hover:text-white")}
      >
        Xóa
      </button>
    </div>
  );
}
