import Link from "next/link";

const EXERCISES = [
  {
    title: "Les 3 réussites",
    desc: "Note trois choses que tu as réussies cette semaine, même petites. Relis-les avant chaque candidature.",
  },
  {
    title: "Casser une croyance limitante",
    desc: "Écris une pensée négative sur toi ('je n'y arriverai pas'). En face, écris une preuve concrète du contraire.",
  },
  {
    title: "La posture de la confiance",
    desc: "Avant un appel ou un entretien, tiens-toi debout, épaules ouvertes, pendant 2 minutes. Ça change vraiment l'état d'esprit.",
  },
  {
    title: "Le pitch en 30 secondes",
    desc: "Entraîne-toi à te présenter en 30 secondes : qui tu es, ce que tu recherches, ce que tu apportes.",
  },
];

export default function ExercicesPage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/mental" className="text-xs text-navy underline">
          ← Mon mental
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Exercices de confiance</h1>

        <div className="flex flex-col gap-3">
          {EXERCISES.map((ex) => (
            <div key={ex.title} className="bg-white rounded-xl2 border border-line p-4">
              <p className="text-sm font-semibold text-navy mb-1">{ex.title}</p>
              <p className="text-xs text-[#8A8577]">{ex.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
