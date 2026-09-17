"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");
  return supabase;
}

export async function updateResource(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("resources")
    .update({
      title: String(formData.get("title") || ""),
      category: String(formData.get("category") || ""),
      type: String(formData.get("type") || ""),
      url: String(formData.get("url") || ""),
      visible: formData.get("visible") === "on",
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function deleteResource(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function assignResource(formData: FormData) {
  const supabase = await requireAdmin();
  const resourceId = String(formData.get("resourceId"));
  const beneficiaryIds = formData.getAll("beneficiary_ids").map(String);

  await supabase.from("beneficiary_resources").delete().eq("resource_id", resourceId);

  if (beneficiaryIds.length > 0) {
    const rows = beneficiaryIds.map((bid) => ({ resource_id: resourceId, beneficiary_id: bid }));
    const { error } = await supabase.from("beneficiary_resources").insert(rows);
    if (error) throw new Error(error.message);
  }

  revalidatePath(`/admin/resources/${resourceId}`);
}
