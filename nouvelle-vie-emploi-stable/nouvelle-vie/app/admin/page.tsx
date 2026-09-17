import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import BeneficiariesTable, { BeneficiarySummary } from "./BeneficiariesTable";

type BeneficiaryRow = {
  id: string;
  job_target: string | null;
  six_month_goal: string | null;
  user_id: string;
  is_active: boolean;
  users: { firstname: string | null; lastname: string | null; email: string | null } | null;
};

type AppointmentRow = {
  id: string;
  date: string;
  mode: string;
  beneficiaries: { users: { firstname: string | null; lastname: string | null } | null } | null;
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

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
    .select(
      "id, job_target, six_month_goal, user_id, is_active, users:user_id(firstname, lastname, email)"
    )
    .returns<BeneficiaryRow[]>();

  const { data: actions } = await supabase
    .from("actions")
    .select("beneficiary_id, status, due_date");

  const { data: applications } = await supabase
    .from("applications")
    .select("beneficiary_id, status, application_date");

  const { data: appointments } = await supabase
    .from("appointments")
    .select("beneficiary_id, date")
    .order("date", { ascending: true });

  const { data: mindsetEntries } = await supabase
    .from("mindset_entries")
    .select("beneficiary_id, confidence_score, date")
    .order("date", { ascending: false });

  const list = beneficiaries ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = (appointments ?? []).filter((a) => a.date >= new Date().toISOString());

  function lastActivityDate(beneficiaryId: string): Date | null {
    const dates: number[] = [];
    (actions ?? [])
      .filter((a) => a.beneficiary_id === beneficiaryId && a.due_date)
      .forEach((a) => dates.push(new Date(a.due_date as string).getTime()));
    (applications ?? [])
      .filter((a) => a.beneficiary_id === beneficiaryId && a.application_date)
      .forEach((a) => dates.push(new Date(a.application_date as string).getTime()));
    (mindsetEntries ?? [])
      .filter((m) => m.beneficiary_id === beneficiaryId)
      .forEach((m) => dates.push(new Date(m.date).getTime()));
    if (dates.length === 0) return null;
    return new Date(Math.max(...dates));
  }

  const summaries: BeneficiarySummary[] = list.map((b) => {
    const beneficiaryActions = (actions ?? []).filter((a) => a.beneficiary_id === b.id);
    const actionsProgress =
      beneficiaryActions.length === 0
        ? null
        : Math.round(
            (beneficiaryActions.filter((a) => a.status === "fait").length / beneficiaryActions.length) * 100
          );
    const lateCount = beneficiaryActions.filter(
      (a) => a.status !== "fait" && a.due_date && a.due_date < today
    ).length;
    const applicationsCount = (applications ?? []).filter((a) => a.beneficiary_id === b.id).length;
    const nextAppointment = upcomingAppointments.find((a) => a.beneficiary_id === b.id);
    const mentalEntry = (mindsetEntries ?? []).find((m) => m.beneficiary_id === b.id);
    const lastActivity = lastActivityDate(b.id);
    const daysSinceActivity = lastActivity
      ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      id: b.id,
      firstname: b.users?.firstname || "",
      lastname: b.users?.lastname || "",
      email: b.users?.email || "",
      job_target: b.job_target || "",
      mental: mentalEntry?.confidence_score ?? null,
      actionsProgress,
      lateCount,
      applicationsCount,
      nextAppointmentLabel: nextAppointment
        ? new Date(nextAppointment.date).toLocaleDateString("fr-FR")
        : "—",
      isActive: b.is_active,
      lastActivityLabel: lastActivity ? lastActivity.toLocaleDateString("fr-FR") : "Aucune",
      daysSinceActivity,
    };
  });

  const totalLate = (actions ?? []).filter(
    (a) => a.status !== "fait" && a.due_date && a.due_date < today
  ).length;
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  const upcomingRdvCount = upcomingAppointments.filter((a) => new Date(a.date) <= in3Days).length;

  // Calendrier du mois en cours
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;

  const { data: monthAppointments } = await supabase
    .from("appointments")
    .select("id, date, mode, beneficiaries:beneficiary_id(users:user_id(firstname, lastname))")
    .gte("date", firstOfMonth.toISOString())
    .lte("date", new Date(year, month - 1, lastOfMonth.getDate(), 23, 59).toISOString())
    .order("date", { ascending: true })
    .returns<AppointmentRow[]>();

  const monthAppts = monthAppointments ?? [];
  const byDay: Record<number, AppointmentRow[]> = {};
  for (const a of monthAppts) {
    const day = new Date(a.date).getDate();
    byDay[day] = byDay[day] || [];
    byDay[day].push(a);
  }
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: lastOfMonth.getDate() }, (_, i) => i + 1),
  ];

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-navy mb-1">Tableau de bord administratrice</h1>
            <p className="text-sm text-[#8A8577]">{list.length} bénéficiaire(s)</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/admin/new"
              className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold whitespace-nowrap"
            >
              + Ajouter un bénéficiaire
            </Link>
            <Link
              href="/admin/actions/new"
              className="px-4 py-2 rounded-full border-2 border-navy text-navy text-sm font-semibold whitespace-nowrap"
            >
              + Attribuer une action
            </Link>
            <Link
              href="/admin/appointments/new"
              className="px-4 py-2 rounded-full border-2 border-navy text-navy text-sm font-semibold whitespace-nowrap"
            >
              + Programmer un RDV
            </Link>
            <Link
              href="/admin/resources/new"
              className="px-4 py-2 rounded-full border-2 border-navy text-navy text-sm font-semibold whitespace-nowrap"
            >
              + Ajouter une ressource
            </Link>
            <Link
              href="/admin/suivi-actions"
              className="px-4 py-2 rounded-full border-2 border-navy text-navy text-sm font-semibold whitespace-nowrap"
            >
              Suivi des actions
            </Link>
            <LogoutButton />
          </div>
        </div>

        {(totalLate > 0 || upcomingRdvCount > 0) && (
          <div className="mb-6 flex flex-wrap gap-3">
            {totalLate > 0 && (
              <div className="px-4 py-2 rounded-xl bg-red-50 text-red-700 text-sm font-medium">
                ⚠️ {totalLate} action(s) en retard tous bénéficiaires confondus
              </div>
            )}
            {upcomingRdvCount > 0 && (
              <div className="px-4 py-2 rounded-xl bg-[#FBF3E4] text-gold-deep text-sm font-medium">
                📅 {upcomingRdvCount} rendez-vous dans les 3 prochains jours
              </div>
            )}
          </div>
        )}

        <BeneficiariesTable list={summaries} />

        <div className="flex justify-between items-center mt-10 mb-4">
          <h2 className="text-lg font-bold text-navy">
            Calendrier — {MONTH_NAMES[month - 1]} {year}
          </h2>
          <Link href="/admin/calendrier" className="text-xs text-navy underline">
            Voir le calendrier complet →
          </Link>
        </div>

        <div className="bg-white rounded-xl2 border border-line p-4">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-[#8A8577] mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => (
              <div
                key={i}
                className={`min-h-[64px] rounded-lg border text-xs p-1 ${
                  day ? "border-line bg-[#FAF8F3]" : "border-transparent"
                }`}
              >
                {day && (
                  <>
                    <div className="font-semibold text-navy">{day}</div>
                    {(byDay[day] || []).map((a) => (
                      <div
                        key={a.id}
                        className="mt-1 text-[10px] px-1 py-0.5 rounded bg-[#FBF3E4] text-gold-deep truncate"
                        title={`${a.beneficiaries?.users?.firstname || ""} ${a.beneficiaries?.users?.lastname || ""}`}
                      >
                        {new Date(a.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}{" "}
                        {a.beneficiaries?.users?.firstname || "?"}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
