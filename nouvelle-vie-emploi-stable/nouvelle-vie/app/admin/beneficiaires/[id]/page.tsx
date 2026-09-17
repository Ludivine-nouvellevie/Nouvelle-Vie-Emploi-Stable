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
      "id, user_id, job_target, sector, contract_type, work_time, mobility, six_month_goal, obstacles, notes, is_active, users:user_id(firstname, lastname, email)"
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
      is_active: boolean;
      users: { firstname: string | null; lastname: string | null; email: string | null } | null;
    }>();

  if (!beneficiary) redirect("/admin");

  const { data: actionsHistory } = await supabase
    .from("actions")
    .select("id, title, status, priority, due_date")
    .eq("beneficiary_id", beneficiary.id)
    .order("due_date", { ascending: false, nullsFirst: false });

  const STATUS_LABELS: Record<string, string> = { a_faire: "À faire", en_cours: "En cours", fait: "Fait" };

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-1">
          {beneficiary.users?.firstname || "Sans nom"} {beneficiary.users?.lastname || ""}
        </h1>
        <p className="text-sm text-[#8A8577] mb-4">{beneficiary.users?.email}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/admin/actions/new?beneficiary=${beneficiary.id}`}
            className="px-3 py-1.5 rounded-full bg-navy text-white text-xs font-semibold"
          >
            + Attribuer une action
          </Link>
          <Link
            href={`/admin/appointments/new?beneficiary=${beneficiary.id}`}
            className="px-3 py-1.5 rounded-full border-2 border-navy text-navy text-xs font-semibold"
          >
            + Programmer un RDV
          </Link>
          <Link
            href={`/admin/resources?beneficiary=${beneficiary.id}`}
            className="px-3 py-1.5 rounded-full border-2 border-navy text-navy text-xs font-semibold"
          >
            Attribuer des ressources
          </Link>
        </div>

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

          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="is_active" defaultChecked={beneficiary.is_active} className="w-4 h-4" />
            Bénéficiaire actif (décocher quand le parcours est terminé ou arrêté)
          </label>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Enregistrer les modifications
          </button>
        </form>

        <h2 className="text-sm font-semibold text-navy mt-8 mb-3">Historique des actions</h2>
        {!actionsHistory || actionsHistory.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Aucune action attribuée pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {actionsHistory.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-line p-3 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium text-navy">{a.title}</div>
                  <div className="text-xs text-[#8A8577] mt-0.5">
                    {a.priority && `Priorité ${a.priority} · `}
                    {a.due_date ? new Date(a.due_date).toLocaleDateString("fr-FR") : "Sans échéance"}
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-[#F1EFE8] text-navy whitespace-nowrap">
                  {STATUS_LABELS[a.status] || a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
