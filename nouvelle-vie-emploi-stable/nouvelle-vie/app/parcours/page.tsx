import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StepStatusSelect from "./StepStatusSelect";

const STEP_META = [
  { n: 1, title: "Je construis mon mental", desc: "Confiance en soi, motivation, freins, vision de la réussite" },
  { n: 2, title: "Je fais le point sur moi", desc: "Compétences, qualités, expériences, objectif professionnel" },
  { n: 3, title: "Je prépare mes outils", desc: "CV, lettre de motivation, pitch, profils en ligne" },
  { n: 4, title: "J'organise ma recherche", desc: "Plateformes d'emploi, planning, réseau" },
  { n: 5, title: "Je me prépare aux entretiens", desc: "Questions classiques, présentation, simulation" },
  { n: 6, title: "Je passe à l'action", desc: "Candidatures, relances, forums, persévérance" },
];

export default async function ParcoursPage() {
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

  const { data: steps } = await supabase
    .from("journey_steps")
    .select("id, step_number, status")
    .eq("beneficiary_id", beneficiary.id)
    .order("step_number", { ascending: true });

  const stepsList = steps ?? [];

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-1">Mon parcours</h1>
        <p className="text-xs text-[#8A8577] mb-5">Un emploi stable</p>

        <div className="flex flex-col gap-3">
          {STEP_META.map((meta) => {
            const step = stepsList.find((s) => s.step_number === meta.n);
            return (
              <div
                key={meta.n}
                className="bg-white rounded-xl2 border border-line p-4 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gold text-navy-deep flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {meta.n}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-navy">{meta.title}</div>
                    <div className="text-xs text-[#8A8577] mt-1">{meta.desc}</div>
                  </div>
                </div>
                {step && <StepStatusSelect stepId={step.id} status={step.status} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
