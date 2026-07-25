import { api } from "./api";
import { Publisher } from "./types";

/** Fetches the publisher list. Kept setState-free so effects can call it directly. */
export async function loadPublishers(): Promise<Publisher[]> {
  const res = await api.get("/publishers");
  return Array.isArray(res.data) ? res.data : [];
}
