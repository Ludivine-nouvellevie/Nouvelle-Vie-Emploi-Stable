import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const MODE_LABELS: Record<string, string> = {
  presentiel: "En présentiel",
  telephone: "Par téléphone",
  visio: "En visio",
};

const MOOD_LABELS: Record<string, string> = {
  tres_motive: "Très motivé(e)",
  motive: "Motivé(e)",
  peu_motive: "Peu motivé(e)",
  demoralise: "Démoralisé(e)",
};

export default async function SuiviPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] flex items-center justify-center p-6">
        <div className="max-w-sm bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577] text-center">
          Votre profil bénéficiaire n'est pas encore complété par votre conseillère.
          <div className="mt-4">
            <Link href="/dashboard" className="text-navy underline text-xs">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: nextAppointment } = await supabase
    .from("appointments")
    .select("id, date, mode, notes")
    .eq("beneficiary_id", beneficiary.id)
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: recentMindset } = await supabase
    .from("mindset_entries")
    .select("motivation_level, date")
    .eq("beneficiary_id", beneficiary.id)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Mon suivi</h1>

        <div className="bg-white rounded-xl2 border border-line p-4 mb-4">
          <p className="text-xs font-semibold text-navy mb-2">Prochain rendez-vous</p>
          {nextAppointment ? (
            <>
              <p className="text-sm font-bold text-navy">
                {new Date(nextAppointment.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-xs text-[#8A8577] mt-1">
                {new Date(nextAppointment.date).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                — {MODE_LABELS[nextAppointment.mode] || nextAppointment.mode}
              </p>
              {nextAppointment.notes && (
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-[11px] font-semibold text-navy mb-1">Mes objectifs d'ici là</p>
                  <p className="text-xs text-[#8A8577] whitespace-pre-line">{nextAppointment.notes}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-xs text-[#8A8577]">Aucun rendez-vous programmé pour le moment.</p>
          )}
        </div>

        <div className="bg-white rounded-xl2 border border-line p-4">
          <p className="text-xs font-semibold text-navy mb-2">Mon état d'esprit cette semaine</p>
          {recentMindset ? (
            <p className="text-sm text-navy">
              {MOOD_LABELS[recentMindset.motivation_level] || recentMindset.motivation_level}
              <span className="text-xs text-[#8A8577] ml-2">
                ({new Date(recentMindset.date).toLocaleDateString("fr-FR")})
              </span>
            </p>
          ) : (
            <p className="text-xs text-[#8A8577]">Pas encore d'entrée cette semaine.</p>
          )}
          <Link href="/mental" className="text-xs text-navy underline mt-2 inline-block">
            Mettre à jour →
          </Link>
        </div>
      </div>
    </div>
  );
}
