import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminProduct, Database } from "./database.types";
export const PAGE_SIZE = 10;
export class AdminReadError extends Error {
  constructor(public kind: "denied" | "session" | "authorization" | "data") {
    super(kind);
  }
}
export interface DashboardData {
  products: AdminProduct[];
  counts: {
    total: number;
    published: number;
    drafts: number;
    categories: number;
  };
}
async function requireAdministrator(
  client: SupabaseClient<Database>,
  signal: AbortSignal,
) {
  const response = await client
    .rpc("current_user_is_admin")
    .abortSignal(signal);
  if (response.error)
    throw new AdminReadError(
      response.status === 401 ? "session" : "authorization",
    );
  if (response.data !== true) throw new AdminReadError("denied");
}
export async function readDashboard(
  client: SupabaseClient<Database>,
  page: number,
  signal: AbortSignal,
): Promise<DashboardData> {
  await requireAdministrator(client, signal);
  const [products, published, drafts, categories] = await Promise.all([
    client
      .from("products")
      .select(
        "id,slug,name,price_eur,category_id,is_available,is_published,is_featured,is_sample,created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      .abortSignal(signal),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true)
      .abortSignal(signal),
    client
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false)
      .abortSignal(signal),
    client
      .from("categories")
      .select("id", { count: "exact", head: true })
      .abortSignal(signal),
  ]);
  for (const result of [products, published, drafts, categories]) {
    if (result.error)
      throw new AdminReadError(result.status === 401 ? "session" : "data");
    if (result.count === null) throw new AdminReadError("data");
  }
  const categoryIds = [
    ...new Set((products.data ?? []).map((product) => product.category_id)),
  ];
  const names = new Map<string, string>();
  if (categoryIds.length) {
    const response = await client
      .from("categories")
      .select("id,name")
      .in("id", categoryIds)
      .abortSignal(signal);
    if (response.error)
      throw new AdminReadError(response.status === 401 ? "session" : "data");
    for (const category of response.data ?? [])
      names.set(category.id, category.name);
  }
  // Recheck after the reads too: do not commit an in-flight result after revocation.
  await requireAdministrator(client, signal);
  return {
    products: (products.data ?? []).map((product) => ({
      ...product,
      categoryName: names.get(product.category_id) ?? "قسم غير متاح",
    })),
    counts: {
      total: products.count!,
      published: published.count!,
      drafts: drafts.count!,
      categories: categories.count!,
    },
  };
}
