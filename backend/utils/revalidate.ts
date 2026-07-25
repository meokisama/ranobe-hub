// Calls the frontend's on-demand revalidation endpoint to rebuild ISR pages right
// after a book is added/edited/deleted, instead of waiting out the 6h cycle.
//
// Runs via setImmediate in the controller so it doesn't block the response. Any error
// (frontend down, wrong secret, timeout...) is only logged and never breaks the
// already-successful request.
export const revalidateFrontend = async (tags: string | string[]): Promise<void> => {
  const secret = process.env.REVALIDATE_SECRET;
  const frontendUrl = process.env.FRONTEND_URL;

  // Not configured → skip; ISR still refreshes on its own after 6h
  if (!secret || !frontendUrl) return;

  const list = Array.isArray(tags) ? tags : [tags];

  try {
    const res = await fetch(`${frontendUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags: list }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`Revalidate frontend thất bại (${res.status}) cho tag: ${list.join(", ")}`);
    }
  } catch (err) {
    console.error("Lỗi khi gọi revalidate frontend:", err instanceof Error ? err.message : err);
  }
};
