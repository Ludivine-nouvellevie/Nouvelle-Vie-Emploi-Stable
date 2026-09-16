"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateActionStatus(formData: FormData) {
  const supabase = createClient();
  const actionId = String(formData.get("actionId"));
  const status = String(formData.get("status"));

  const { error } = await supabase.from("actions").update({ status }).eq("id", actionId);
  if (error) throw new Error(error.message);

  revalidatePath("/actions");
}

export async function updateActionComment(formData: FormData) {
  const supabase = createClient();
  const actionId = String(formData.get("actionId"));
  const comment = String(formData.get("comment") || "");

  const { error } = await supabase.from("actions").update({ comment }).eq("id", actionId);
  if (error) throw new Error(error.message);

  revalidatePath("/actions");
}
