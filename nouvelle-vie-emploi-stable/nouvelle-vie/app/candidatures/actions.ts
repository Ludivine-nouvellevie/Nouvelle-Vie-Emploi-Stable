"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addApplication(formData: FormData) {
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

  const job_title = String(formData.get("job_title") || "");
  const company = String(formData.get("company") || "");
  const application_date = String(formData.get("application_date") || "") || null;
  const source = String(formData.get("source") || "");
  const comment = String(formData.get("comment") || "");

  const { error } = await supabase.from("applications").insert({
    beneficiary_id: beneficiary.id,
    job_title,
    company,
    application_date,
    source,
    comment,
    status: "envoyee",
  });

  if (error) throw new Error(error.message);

  redirect("/candidatures");
}

export async function updateApplicationStatus(formData: FormData) {
  const supabase = createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));

  const { error } = await supabase.from("applications").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/candidatures");
}
