"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updateBeneficiary(formData: FormData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const beneficiaryId = String(formData.get("beneficiaryId"));
  const userId = String(formData.get("userId"));

  const firstname = String(formData.get("firstname") || "");
  const lastname = String(formData.get("lastname") || "");
  const job_target = String(formData.get("job_target") || "");
  const sector = String(formData.get("sector") || "");
  const contract_type = String(formData.get("contract_type") || "");
  const work_time = String(formData.get("work_time") || "");
  const mobility = String(formData.get("mobility") || "");
  const six_month_goal = String(formData.get("six_month_goal") || "");
  const obstacles = String(formData.get("obstacles") || "");
  const notes = String(formData.get("notes") || "");

  const { error: userError } = await supabase
    .from("users")
    .update({ firstname, lastname })
    .eq("id", userId);
  if (userError) throw new Error(userError.message);

  const { error: beneficiaryError } = await supabase
    .from("beneficiaries")
    .update({
      job_target,
      sector,
      contract_type,
      work_time,
      mobility,
      six_month_goal,
      obstacles,
      notes,
    })
    .eq("id", beneficiaryId);
  if (beneficiaryError) throw new Error(beneficiaryError.message);

  redirect("/admin");
}
