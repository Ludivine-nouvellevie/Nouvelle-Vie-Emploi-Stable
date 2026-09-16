"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function createBeneficiary(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const email = String(formData.get("email") || "").trim();
  const firstname = String(formData.get("firstname") || "").trim();
  const lastname = String(formData.get("lastname") || "").trim();
  const job_target = String(formData.get("job_target") || "");
  const sector = String(formData.get("sector") || "");
  const contract_type = String(formData.get("contract_type") || "");
  const work_time = String(formData.get("work_time") || "");
  const mobility = String(formData.get("mobility") || "");
  const six_month_goal = String(formData.get("six_month_goal") || "");
  const obstacles = String(formData.get("obstacles") || "");
  const notes = String(formData.get("notes") || "");

  if (!email) {
    throw new Error("L'email est obligatoire.");
  }

  const admin = createAdminClient();

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { firstname, lastname, role: "beneficiaire" },
  });

  if (inviteError || !invited?.user) {
    throw new Error(inviteError?.message || "Impossible de créer ce compte.");
  }

  const { error: beneficiaryError } = await admin.from("beneficiaries").insert({
    user_id: invited.user.id,
    job_target,
    sector,
    contract_type,
    work_time,
    mobility,
    six_month_goal,
    obstacles,
    notes,
  });

  if (beneficiaryError) {
    throw new Error(beneficiaryError.message);
  }

  redirect("/admin");
}
