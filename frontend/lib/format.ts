const VI_DATE = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

/** dd/mm/yyyy in vi-VN. Returns `fallback` for missing or unparseable input. */
export function formatDateVi(value: string | null | undefined, fallback = "—"): string {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : VI_DATE.format(date);
}

/** ISO timestamp → yyyy-mm-dd for an `<input type="date">`; "" when absent. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
}
