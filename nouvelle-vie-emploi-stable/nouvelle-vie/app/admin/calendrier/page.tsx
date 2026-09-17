import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

type AppointmentRow = {
  id: string;
  date: string;
  mode: string;
  beneficiaries: { users: { firstname: string | null; lastname: string | null } | null } | null;
};

const MODE_LABELS: Record<string, string> = {
  presentiel: "Présentiel",
  telephone: "Téléphone",
  visio: "Visio",
};

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const now = new Date();
  const [year, month] = searchParams.month
    ? searchParams.month.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const firstOfMonth = new Date(year, month - 1, 1);
  const lastOfMonth = new Date(year, month, 0);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7; // lundi = 0

  const prevMonth = new Date(year, month - 2, 1);
  const nextMonth = new Date(year, month, 1);
  const prevParam = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  const nextParam = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;

  const { data: appointmentsList } = await supabase
    .from("appointments")
    .select("id, date, mode, beneficiaries:beneficiary_id(users:user_id(firstname, lastname))")
    .gte("date", firstOfMonth.toISOString())
    .lte("date", new Date(year, month - 1, lastOfMonth.getDate(), 23, 59).toISOString())
    .order("date", { ascending: true })
    .returns<AppointmentRow[]>();

  const appointments = appointmentsList ?? [];
  const byDay: Record<number, AppointmentRow[]> = {};
  for (const a of appointments) {
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
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>

        <div className="flex justify-between items-center mt-3 mb-6">
          <h1 className="text-xl font-bold text-navy">
            {MONTH_NAMES[month - 1]} {year}
          </h1>
          <div className="flex gap-2">
            <Link
              href={`/admin/calendrier?month=${prevParam}`}
              className="px-3 py-1.5 rounded-full border border-line bg-white text-navy text-sm"
            >
              ← Précédent
            </Link>
            <Link
              href={`/admin/calendrier?month=${nextParam}`}
              className="px-3 py-1.5 rounded-full border border-line bg-white text-navy text-sm"
            >
              Suivant →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl2 border border-line p-4 mb-6">
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

        <h2 className="text-sm font-semibold text-navy mb-3">Liste du mois</h2>
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-sm text-[#8A8577]">
            Aucun rendez-vous ce mois-ci.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-line p-3 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-medium text-navy">
                    {a.beneficiaries?.users?.firstname || "Sans nom"} {a.beneficiaries?.users?.lastname || ""}
                  </div>
                  <div className="text-xs text-[#8A8577]">
                    {new Date(a.date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    à {new Date(a.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-[#F1EFE8] text-navy">
                  {MODE_LABELS[a.mode] || a.mode}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
