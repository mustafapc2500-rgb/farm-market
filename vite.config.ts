import { defineConfig, loadEnv } from "vite";
import { cwd } from "node:process";
import { readSupabaseConfiguration } from "./src/lib/supabase-config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  const settings = loadEnv(mode, cwd(), "VITE_SUPABASE_");
  const configuration = readSupabaseConfiguration(
    settings.VITE_SUPABASE_URL,
    settings.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  if (configuration.status === "invalid")
    throw new Error(
      "Invalid public Supabase configuration. Set a project origin URL and an sb_publishable_ key together; never use a secret or service-role key.",
    );
  return { plugins: [react(), tailwindcss()] };
});
