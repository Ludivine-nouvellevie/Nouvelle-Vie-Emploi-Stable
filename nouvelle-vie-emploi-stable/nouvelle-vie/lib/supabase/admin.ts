import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// ⚠️ Ce fichier ne doit JAMAIS être importé dans un composant "use client".
// Il utilise la clé secrète "service_role", qui donne tous les droits.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
