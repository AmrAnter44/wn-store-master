import { createClient } from "@supabase/supabase-js";

// 🟣 للـ Client (Frontend) — لازم يبدأ بـ NEXT_PUBLIC
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// 🟢 للـ Server (Backend / API Routes)
// ده مش هيتنادى في client أبداً
export const createServerClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};
