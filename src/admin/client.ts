import { createClient } from "@supabase/supabase-js";
import { readSupabaseConfiguration } from "../lib/supabase-config";
import type { Database } from "./database.types";

export const ADMIN_STORAGE_KEY = "farm-market-admin-auth";
export const adminConfiguration = readSupabaseConfiguration(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

async function timedFetch(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const signal =
    init?.signal ?? (input instanceof Request ? input.signal : undefined);
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(abort, 15_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

function createAdminClient() {
  if (adminConfiguration.status !== "ready") return null;
  try {
    const storage = window.sessionStorage;
    // Fail closed if this browser does not permit tab-scoped session storage.
    storage.getItem(ADMIN_STORAGE_KEY);
    return createClient<Database>(
      adminConfiguration.url,
      adminConfiguration.publishableKey,
      {
        db: { retry: false },
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          flowType: "pkce",
          storage,
          storageKey: ADMIN_STORAGE_KEY,
        },
        global: { fetch: timedFetch },
      },
    );
  } catch {
    return null;
  }
}

// This module is loaded only by the /admin lazy route; public mock data stays independent.
export const adminClient = createAdminClient();
export function clearAdminStorage() {
  try {
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(`${ADMIN_STORAGE_KEY}-code-verifier`);
  } catch {
    /* UI still signs out if browser storage becomes unavailable. */
  }
}
