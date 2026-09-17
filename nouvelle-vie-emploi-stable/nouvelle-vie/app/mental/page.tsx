import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { addMindsetEntry } from "./actions";
import MoodPicker from "./MoodPicker";
import ZenBanner from "./ZenBanner";

const BOOSTS = [
  "Je me donne les moyens de réussir.",
  "Chaque petit pas compte, je progresse.",
  "Je mérite un emploi stable et je m'en donne les moyens.",
  "Ma détermination fait la différence.",
];

const MOOD_LABELS: Record<string, string> = {
  tres_motive: "Très motivé(e)",
  motive: "Motivé(e)",
  peu_motive: "Peu motivé(e)",
  demoralise: "Démoralisé(e)",
};

export default async function MentalPage() {
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

  const { data: entries } = await supabase
    .from("mindset_entries")
    .select("id, date, motivation_level, daily_reflection")
    .eq("beneficiary_id", beneficiary.id)
    .order("date", { ascending: false })
    .limit(5);

  const boost = BOOSTS[new Date().getDate() % BOOSTS.length];

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-4">Mon mental</h1>

        <ZenBanner />

        <div className="grid grid-cols-3 gap-2 my-4">
          <Link
            href="/mental/exercices"
            className="text-center py-2.5 rounded-xl border-2 border-navy text-navy text-xs font-semibold"
          >
            Exercices
          </Link>
          <Link
            href="/mental/meditations"
            className="text-center py-2.5 rounded-xl border-2 border-navy text-navy text-xs font-semibold"
          >
            Méditations
          </Link>
          <Link
            href="/mental/progres"
            className="text-center py-2.5 rounded-xl border-2 border-navy text-navy text-xs font-semibold"
          >
            Mes progrès
          </Link>
        </div>

        <div className="bg-[#FBF3E4] rounded-xl2 p-4 mb-4">
          <p className="text-[11px] font-semibold text-gold-deep uppercase mb-1">Mon boost du jour</p>
          <p className="text-sm text-gold-deep italic">« {boost} »</p>
        </div>

        <form action={addMindsetEntry} className="bg-white rounded-xl2 border border-line p-4 flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold text-navy mb-2">Mon état d'esprit aujourd'hui</p>
            <MoodPicker name="motivation_level" />
          </div>

          <div>
            <p className="text-xs font-semibold text-navy mb-1">Ma réflexion du jour</p>
            <p className="text-xs text-[#8A8577] mb-2">
              Quelle petite action puis-je faire aujourd'hui pour me rapprocher de mon emploi ?
            </p>
            <textarea
              name="daily_reflection"
              rows={3}
              placeholder="Écrire ma réponse..."
              className="w-full px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Valider
          </button>
        </form>

        {entries && entries.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-navy mb-2">Mes derniers jours</p>
            <div className="flex flex-col gap-2">
              {entries.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-line p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-navy">
                      {new Date(e.date).toLocaleDateString("fr-FR")}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FBF3E4] text-gold-deep font-medium">
                      {MOOD_LABELS[e.motivation_level] || e.motivation_level}
                    </span>
                  </div>
                  {e.daily_reflection && (
                    <p className="text-xs text-[#8A8577] mt-1.5">{e.daily_reflection}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
