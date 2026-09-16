"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createAppointment(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const beneficiary_id = String(formData.get("beneficiary_id"));
  const date = String(formData.get("date") || "");
  const time = String(formData.get("time") || "09:00");
  const mode = String(formData.get("mode") || "presentiel");
  const notes = String(formData.get("notes") || "");

  if (!beneficiary_id || !date) {
    throw new Error("Bénéficiaire et date obligatoires.");
  }

  const { error } = await supabase.from("appointments").insert({
    beneficiary_id,
    date: new Date(`${date}T${time}:00`).toISOString(),
    mode,
    notes,
  });

  if (error) throw new Error(error.message);

  redirect("/admin");
}
