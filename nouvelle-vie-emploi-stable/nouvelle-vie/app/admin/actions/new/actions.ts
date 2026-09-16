"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createAction(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const beneficiary_id = String(formData.get("beneficiary_id"));
  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const priority = String(formData.get("priority") || "moyenne");
  const due_date = String(formData.get("due_date") || "") || null;

  if (!beneficiary_id || !title) {
    throw new Error("Bénéficiaire et titre obligatoires.");
  }

  const { error } = await supabase.from("actions").insert({
    beneficiary_id,
    title,
    description,
    priority,
    due_date,
    status: "a_faire",
  });

  if (error) throw new Error(error.message);

  redirect("/admin");
}
