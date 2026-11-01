export type SupabaseConfiguration =
  | { status: "missing" | "invalid" }
  | { status: "ready"; url: string; publishableKey: string };

/** Pure validation shared by Vite and the browser. Never include values in errors. */
export function readSupabaseConfiguration(
  urlValue?: string,
  keyValue?: string,
): SupabaseConfiguration {
  const url = urlValue?.trim() ?? "";
  const publishableKey = keyValue?.trim() ?? "";
  if (!url && !publishableKey) return { status: "missing" };
  if (!url || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey))
    return { status: "invalid" };
  try {
    const parsed = new URL(url);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    if (
      (parsed.protocol !== "https:" &&
        !(local && parsed.protocol === "http:")) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      parsed.pathname !== "/"
    )
      return { status: "invalid" };
    return { status: "ready", url: parsed.origin, publishableKey };
  } catch {
    return { status: "invalid" };
  }
}
