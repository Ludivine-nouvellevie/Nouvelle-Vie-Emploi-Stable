import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

const MOOD_SCORE: Record<string, number> = {
  tres_motive: 100,
  motive: 75,
  peu_motive: 40,
  demoralise: 15,
};

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("firstname")
    .eq("id", user.id)
    .single();

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id, six_month_goal")
    .eq("user_id", user.id)
    .single();

  let alerts: string[] = [];
  let globalScore: number | null = null;

  if (beneficiary) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: lateActions } = await supabase
      .from("actions")
      .select("id")
      .eq("beneficiary_id", beneficiary.id)
      .neq("status", "fait")
      .lt("due_date", today);
    if (lateActions && lateActions.length > 0) {
      alerts.push(`${lateActions.length} action(s) en retard`);
    }

    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const { data: soonAppointment } = await supabase
      .from("appointments")
      .select("date")
      .eq("beneficiary_id", beneficiary.id)
      .gte("date", new Date().toISOString())
      .lte("date", in3Days.toISOString())
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (soonAppointment) {
      alerts.push(`Rendez-vous le ${new Date(soonAppointment.date).toLocaleDateString("fr-FR")}`);
    }

    // Jauge "retour à l'emploi" : moyenne actions / candidatures / mental
    const { data: allActions } = await supabase
      .from("actions")
      .select("status")
      .eq("beneficiary_id", beneficiary.id);
    const actionsScore =
      allActions && allActions.length > 0
        ? (allActions.filter((a) => a.status === "fait").length / allActions.length) * 100
        : 0;

    const { data: allApplications } = await supabase
      .from("applications")
      .select("id")
      .eq("beneficiary_id", beneficiary.id);
    const cvScore = Math.min((allApplications?.length ?? 0) * 20, 100);

    const { data: lastMindset } = await supabase
      .from("mindset_entries")
      .select("motivation_level, confidence_score")
      .eq("beneficiary_id", beneficiary.id)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    const mentalScore =
      lastMindset?.confidence_score ?? (lastMindset ? MOOD_SCORE[lastMindset.motivation_level] : 0) ?? 0;

    globalScore = Math.round((actionsScore + cvScore + mentalScore) / 3);
  }

  const firstname = profile?.firstname || "à vous";

  return (
    <div className="min-h-screen bg-[#F4F0E6] flex justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-cream rounded-xl2 overflow-hidden shadow-lg">
        <div className="px-5 pt-6 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-navy">Bonjour {firstname} 👋</h1>
            <p className="text-xs text-[#8A8577] mt-1">Ravi(e) de vous revoir !</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
              {firstname?.[0]?.toUpperCase() ?? "?"}
            </div>
            <LogoutButton />
          </div>
        </div>

        {globalScore !== null && (
          <div className="mx-5 mt-4 p-4 rounded-xl2 bg-navy text-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
                Mon retour à l'emploi
              </span>
              <span className="text-lg font-bold text-gold">{globalScore}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-gold"
                style={{ width: `${globalScore}%` }}
              />
            </div>
            <p className="text-[10px] text-white/70 mt-2">
              Basé sur vos actions réalisées, vos candidatures envoyées et votre état d'esprit.
            </p>
          </div>
        )}

        <div className="mx-5 mt-4 p-3 rounded-xl bg-[#FBF3E4] text-xs text-gold-deep italic">
          « Crois en toi, tu es plus capable que tu ne le penses. »
        </div>

        <div className="mx-5 mt-4">
          <p className="text-xs font-semibold text-navy mb-2">Mon objectif</p>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white">
            <div>
              <p className="text-sm font-bold text-navy">Un emploi stable</p>
              <p className="text-xs text-[#8A8577]">
                {beneficiary?.six_month_goal || "CDD +6 mois ou CDI"}
              </p>
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mx-5 mt-4 flex flex-col gap-2">
            {alerts.map((a, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#FBF3E4] text-xs text-gold-deep font-medium">
                🔔 {a}
              </div>
            ))}
          </div>
        )}

        {!beneficiary && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-50 text-xs text-blue-800">
            Votre profil bénéficiaire n'est pas encore complété par votre conseillère.
            Les données affichées sont des exemples en attendant.
          </div>
        )}

        <div className="mx-5 mt-4 mb-2 flex gap-2">
          <Link
            href="/parcours"
            className="flex-1 text-center py-3 rounded-full bg-navy text-white text-sm font-semibold"
          >
            Mon parcours
          </Link>
          <Link
            href="/mental"
            className="flex-1 text-center py-3 rounded-full bg-gold text-navy-deep text-sm font-semibold"
          >
            Mon mental
          </Link>
        </div>
        <div className="mx-5 mb-2">
          <Link
            href="/actions"
            className="block text-center w-full py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Mes actions
          </Link>
        </div>
        <div className="mx-5 mb-2">
          <Link
            href="/candidatures"
            className="block text-center w-full py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Mes candidatures
          </Link>
        </div>
        <div className="mx-5 mb-2 flex gap-2">
          <Link
            href="/suivi"
            className="flex-1 text-center py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Mon suivi
          </Link>
          <Link
            href="/ressources"
            className="flex-1 text-center py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Mes ressources
          </Link>
        </div>
        <div className="mx-5 mb-2">
          <Link
            href="/offres"
            className="block text-center w-full py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Offres d'emploi
          </Link>
        </div>
        <div className="mx-5 mb-2">
          <Link
            href="/documents"
            className="block text-center w-full py-3 rounded-full border-2 border-navy text-navy text-sm font-semibold"
          >
            Mes documents
          </Link>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
