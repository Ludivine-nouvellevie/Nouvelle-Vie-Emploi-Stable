import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const MOOD_SCORE: Record<string, number> = {
  tres_motive: 100,
  motive: 75,
  peu_motive: 40,
  demoralise: 15,
};

const MOOD_LABELS: Record<string, string> = {
  tres_motive: "Très motivé(e)",
  motive: "Motivé(e)",
  peu_motive: "Peu motivé(e)",
  demoralise: "Démoralisé(e)",
};

export default async function ProgresPage() {
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

  if (!beneficiary) redirect("/mental");

  const { data: entries } = await supabase
    .from("mindset_entries")
    .select("id, date, motivation_level, confidence_score")
    .eq("beneficiary_id", beneficiary.id)
    .order("date", { ascending: true })
    .limit(30);

  const list = entries ?? [];
  const scored = list.map((e) => ({
    ...e,
    score: e.confidence_score ?? MOOD_SCORE[e.motivation_level] ?? 50,
  }));

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/mental" className="text-xs text-navy underline">
          ← Mon mental
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Mes progrès</h1>

        {scored.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Pas encore assez d'entrées pour voir une évolution. Reviens régulièrement sur "Mon mental" !
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl2 border border-line p-4 mb-4">
              <p className="text-xs font-semibold text-navy mb-3">Évolution</p>
              <div className="flex items-end gap-1 h-24">
                {scored.slice(-14).map((e) => (
                  <div key={e.id} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className="w-full rounded-t bg-gold"
                      style={{ height: `${Math.max(e.score, 4)}%` }}
                      title={`${new Date(e.date).toLocaleDateString("fr-FR")} — ${e.score}%`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#8A8577] mt-2">
                Les {Math.min(scored.length, 14)} dernières entrées, de la plus ancienne à la plus récente.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {[...scored].reverse().slice(0, 10).map((e) => (
                <div key={e.id} className="bg-white rounded-xl border border-line p-3 flex justify-between items-center">
                  <span className="text-xs text-navy">{new Date(e.date).toLocaleDateString("fr-FR")}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FBF3E4] text-gold-deep font-medium">
                    {MOOD_LABELS[e.motivation_level] || e.motivation_level}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
