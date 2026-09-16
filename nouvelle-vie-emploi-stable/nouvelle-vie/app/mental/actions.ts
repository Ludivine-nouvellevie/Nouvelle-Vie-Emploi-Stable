"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function addMindsetEntry(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!beneficiary) redirect("/dashboard");

  const motivation_level = String(formData.get("motivation_level") || "motive");
  const daily_reflection = String(formData.get("daily_reflection") || "");

  const { error } = await supabase.from("mindset_entries").insert({
    beneficiary_id: beneficiary.id,
    date: new Date().toISOString().slice(0, 10),
    motivation_level,
    daily_reflection,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect("/mental");
}
