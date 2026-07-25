export type SortOrder = "asc" | "desc";

function timestamp(value: string | null | undefined): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const ms = new Date(value).getTime();
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
}

/** Sorts a copy by a date field. Missing/unparseable dates sort as oldest. */
export function sortByDate<T>(items: T[], order: SortOrder, pick: (item: T) => string | null | undefined): T[] {
  const dir = order === "asc" ? 1 : -1;
  return items.slice().sort((a, b) => (timestamp(pick(a)) - timestamp(pick(b))) * dir);
}
