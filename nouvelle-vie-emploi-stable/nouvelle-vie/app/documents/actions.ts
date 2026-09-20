"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteDocument(formData: FormData) {
  const supabase = createClient();
  const path = String(formData.get("path"));

  const { error } = await supabase.storage.from("documents").remove([path]);
  if (error) throw new Error(error.message);

  revalidatePath("/documents");
}
