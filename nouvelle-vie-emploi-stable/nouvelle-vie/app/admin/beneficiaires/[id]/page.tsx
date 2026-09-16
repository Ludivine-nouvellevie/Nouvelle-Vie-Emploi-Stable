import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateBeneficiary } from "./actions";

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-navy">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue || ""}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
      />
    </div>
  );
}

export default async function BeneficiaryDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select(
      "id, user_id, job_target, sector, contract_type, work_time, mobility, six_month_goal, obstacles, notes, users:user_id(firstname, lastname, email)"
    )
    .eq("id", params.id)
    .single<{
      id: string;
      user_id: string;
      job_target: string | null;
      sector: string | null;
      contract_type: string | null;
      work_time: string | null;
      mobility: string | null;
      six_month_goal: string | null;
      obstacles: string | null;
      notes: string | null;
      users: { firstname: string | null; lastname: string | null; email: string | null } | null;
    }>();

  if (!beneficiary) redirect("/admin");

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-1">
          {beneficiary.users?.firstname || "Sans nom"} {beneficiary.users?.lastname || ""}
        </h1>
        <p className="text-sm text-[#8A8577] mb-6">{beneficiary.users?.email}</p>

        <form
          action={updateBeneficiary}
          className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4"
        >
          <input type="hidden" name="beneficiaryId" value={beneficiary.id} />
          <input type="hidden" name="userId" value={beneficiary.user_id} />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" name="firstname" defaultValue={beneficiary.users?.firstname} />
            <Field label="Nom" name="lastname" defaultValue={beneficiary.users?.lastname} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Emploi recherché" name="job_target" defaultValue={beneficiary.job_target} />
            <Field label="Secteur" name="sector" defaultValue={beneficiary.sector} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de contrat" name="contract_type" defaultValue={beneficiary.contract_type} />
            <Field label="Temps de travail" name="work_time" defaultValue={beneficiary.work_time} />
          </div>
          <Field label="Mobilité" name="mobility" defaultValue={beneficiary.mobility} />
          <Field label="Objectif à 6 mois" name="six_month_goal" defaultValue={beneficiary.six_month_goal} />

          <div>
            <label className="text-xs font-medium text-navy">Freins identifiés</label>
            <textarea
              name="obstacles"
              rows={2}
              defaultValue={beneficiary.obstacles || ""}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Notes de la conseillère</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={beneficiary.notes || ""}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Enregistrer les modifications
          </button>
        </form>
      </div>
    </div>
  );
}
