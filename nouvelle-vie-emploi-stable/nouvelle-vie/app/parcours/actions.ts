"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateStepStatus(formData: FormData) {
  const supabase = createClient();
  const stepId = String(formData.get("stepId"));
  const status = String(formData.get("status"));

  const { error } = await supabase
    .from("journey_steps")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", stepId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/parcours");
}
