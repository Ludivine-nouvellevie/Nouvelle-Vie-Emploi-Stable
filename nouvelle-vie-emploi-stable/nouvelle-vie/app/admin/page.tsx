import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

type BeneficiaryRow = {
  id: string;
  job_target: string | null;
  six_month_goal: string | null;
  user_id: string;
  users: { firstname: string | null; lastname: string | null; email: string | null } | null;
};

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") redirect("/dashboard");

  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("id, job_target, six_month_goal, user_id, users:user_id(firstname, lastname, email)")
    .returns<BeneficiaryRow[]>();

  const { data: actions } = await supabase
    .from("actions")
    .select("beneficiary_id, status, due_date");

  const { data: applications } = await supabase
    .from("applications")
    .select("beneficiary_id, status");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("beneficiary_id, date")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true });

  const { data: mindsetEntries } = await supabase
    .from("mindset_entries")
    .select("beneficiary_id, confidence_score, date")
    .order("date", { ascending: false });

  const list = beneficiaries ?? [];

  function actionsProgress(beneficiaryId: string) {
    const rows = (actions ?? []).filter((a) => a.beneficiary_id === beneficiaryId);
    if (rows.length === 0) return null;
    const done = rows.filter((a) => a.status === "fait").length;
    return Math.round((done / rows.length) * 100);
  }

  function lateActions(beneficiaryId: string) {
    const today = new Date().toISOString().slice(0, 10);
    return (actions ?? []).filter(
      (a) => a.beneficiary_id === beneficiaryId && a.status !== "fait" && a.due_date && a.due_date < today
    ).length;
  }

  function applicationsCount(beneficiaryId: string) {
    return (applications ?? []).filter((a) => a.beneficiary_id === beneficiaryId).length;
  }

  function nextAppointment(beneficiaryId: string) {
    const next = (appointments ?? []).find((a) => a.beneficiary_id === beneficiaryId);
    return next ? new Date(next.date).toLocaleDateString("fr-FR") : "—";
  }

  function mentalScore(beneficiaryId: string) {
    const entry = (mindsetEntries ?? []).find((m) => m.beneficiary_id === beneficiaryId);
    return entry?.confidence_score ?? null;
  }

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-navy mb-1">Tableau de bord administratrice</h1>
            <p className="text-sm text-[#8A8577]">{list.length} bénéficiaire(s)</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/new"
              className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold whitespace-nowrap"
            >
              + Ajouter un bénéficiaire
            </Link>
            <LogoutButton />
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577]">
            Aucun bénéficiaire pour le moment. Cliquez sur "+ Ajouter un bénéficiaire" pour en créer un.
          </div>
        ) : (
          <div className="bg-white rounded-xl2 border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FBF3E4] text-navy text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Bénéficiaire</th>
                  <th className="text-left px-4 py-3">Objectif</th>
                  <th className="text-left px-4 py-3">Mental</th>
                  <th className="text-left px-4 py-3">Actions</th>
                  <th className="text-left px-4 py-3">Candidatures</th>
                  <th className="text-left px-4 py-3">Prochain RDV</th>
                  <th className="text-left px-4 py-3">Alertes</th>
                </tr>
              </thead>
              <tbody>
                {list.map((b) => {
                  const late = lateActions(b.id);
                  const mental = mentalScore(b.id);
                  return (
                    <tr key={b.id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy">
                          {b.users?.firstname || "Sans nom"} {b.users?.lastname || ""}
                        </div>
                        <div className="text-xs text-[#8A8577]">{b.users?.email}</div>
                      </td>
                      <td className="px-4 py-3 text-[#4A4636]">{b.job_target || "—"}</td>
                      <td className="px-4 py-3">
                        {mental !== null ? (
                          <span className={mental < 40 ? "text-red-600 font-semibold" : "text-navy"}>
                            {mental}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-navy">
                        {actionsProgress(b.id) !== null ? `${actionsProgress(b.id)}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-navy">{applicationsCount(b.id)}</td>
                      <td className="px-4 py-3 text-navy">{nextAppointment(b.id)}</td>
                      <td className="px-4 py-3">
                        {late > 0 ? (
                          <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full">
                            {late} action(s) en retard
                          </span>
                        ) : (
                          <span className="text-xs text-[#8A8577]">Aucune</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
