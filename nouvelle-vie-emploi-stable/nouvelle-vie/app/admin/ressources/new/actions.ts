"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createResource(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const title = String(formData.get("title") || "");
  const category = String(formData.get("category") || "");
  const type = String(formData.get("type") || "");
  const url = String(formData.get("url") || "");

  if (!title || !category) {
    throw new Error("Titre et catégorie obligatoires.");
  }

  const { error } = await supabase.from("resources").insert({
    title,
    category,
    type,
    url,
    visible: true,
  });

  if (error) throw new Error(error.message);

  redirect("/admin");
}
