"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createJobOffer(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const title = String(formData.get("title") || "");
  const company = String(formData.get("company") || "");
  const description = String(formData.get("description") || "");
  const url = String(formData.get("url") || "");

  if (!title) throw new Error("Titre obligatoire.");

  const { error } = await supabase.from("job_offers").insert({ title, company, description, url });
  if (error) throw new Error(error.message);

  redirect("/admin");
}
