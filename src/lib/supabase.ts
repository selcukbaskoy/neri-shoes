import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);

// Server-side only client — uses service_role key to bypass RLS.
// NEVER expose this client or the service_role key to the browser.
const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!adminKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY env değişkeni tanımlı değil. supabaseAdmin çalışamaz.");
}
export const supabaseAdmin = createClient(url, adminKey, {
  auth: { persistSession: false },
});
