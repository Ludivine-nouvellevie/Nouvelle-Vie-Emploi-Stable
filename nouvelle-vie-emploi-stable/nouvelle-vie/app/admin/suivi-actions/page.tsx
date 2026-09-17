import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type ActionRow = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  beneficiary_id: string;
  beneficiaries: { users: { firstname: string | null; lastname: string | null } | null } | null;
};

const STATUS_LABELS: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  fait: "Fait",
};

export default async function SuiviActionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: actionsList } = await supabase
    .from("actions")
    .select(
      "id, title, status, priority, due_date, beneficiary_id, beneficiaries:beneficiary_id(users:user_id(firstname, lastname))"
    )
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<ActionRow[]>();

  const list = actionsList ?? [];
  const counts = {
    total: list.length,
    a_faire: list.filter((a) => a.status === "a_faire").length,
    en_cours: list.filter((a) => a.status === "en_cours").length,
    fait: list.filter((a) => a.status === "fait").length,
  };

  const filter = searchParams.status;
  const filtered = filter ? list.filter((a) => a.status === filter) : list;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-6">Suivi des actions</h1>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { key: undefined, label: "Toutes", value: counts.total },
            { key: "a_faire", label: "À faire", value: counts.a_faire },
            { key: "en_cours", label: "En cours", value: counts.en_cours },
            { key: "fait", label: "Fait", value: counts.fait },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.key ? `/admin/suivi-actions?status=${c.key}` : "/admin/suivi-actions"}
              className={`rounded-xl2 border p-4 text-center ${
                filter === c.key
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy"
              }`}
            >
              <div className="text-xl font-bold">{c.value}</div>
              <div className="text-xs mt-1">{c.label}</div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577]">
            Aucune action à afficher.
          </div>
        ) : (
          <div className="bg-white rounded-xl2 border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FBF3E4] text-navy text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Bénéficiaire</th>
                  <th className="text-left px-4 py-3">Action</th>
                  <th className="text-left px-4 py-3">Priorité</th>
                  <th className="text-left px-4 py-3">Échéance</th>
                  <th className="text-left px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const isLate = a.status !== "fait" && a.due_date && a.due_date < today;
                  return (
                    <tr key={a.id} className="border-t border-line">
                      <td className="px-4 py-3 text-navy">
                        {a.beneficiaries?.users?.firstname || "Sans nom"}{" "}
                        {a.beneficiaries?.users?.lastname || ""}
                      </td>
                      <td className="px-4 py-3 text-navy">{a.title}</td>
                      <td className="px-4 py-3 text-[#8A8577]">{a.priority || "—"}</td>
                      <td className={`px-4 py-3 ${isLate ? "text-red-600 font-semibold" : "text-[#8A8577]"}`}>
                        {a.due_date ? new Date(a.due_date).toLocaleDateString("fr-FR") : "—"}
                        {isLate && " (en retard)"}
                      </td>
                      <td className="px-4 py-3 text-navy">{STATUS_LABELS[a.status] || a.status}</td>
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
