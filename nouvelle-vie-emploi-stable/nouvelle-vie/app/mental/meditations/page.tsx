import Link from "next/link";

const MEDITATIONS = [
  {
    title: "Respiration 4-4-4",
    duration: "3 min",
    desc: "Inspire 4 secondes, retiens 4 secondes, expire 4 secondes. Répète 8 fois pour calmer le stress avant un entretien.",
  },
  {
    title: "Visualisation de la réussite",
    duration: "5 min",
    desc: "Ferme les yeux, imagine ton premier jour dans ton nouvel emploi. Que ressens-tu ? Qui est autour de toi ? Reste sur cette image.",
  },
  {
    title: "Ancrage au moment présent",
    duration: "2 min",
    desc: "Nomme 5 choses que tu vois, 4 que tu entends, 3 que tu peux toucher. Un bon exercice avant un appel important.",
  },
];

export default function MeditationsPage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/mental" className="text-xs text-navy underline">
          ← Mon mental
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-1">Méditations</h1>
        <p className="text-xs text-[#8A8577] mb-5">
          Des exercices guidés à lire, en attendant l'ajout de versions audio.
        </p>

        <div className="flex flex-col gap-3">
          {MEDITATIONS.map((m) => (
            <div key={m.title} className="bg-white rounded-xl2 border border-line p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-navy mb-1">{m.title}</p>
                <span className="text-[10px] text-[#8A8577] whitespace-nowrap ml-2">{m.duration}</span>
              </div>
              <p className="text-xs text-[#8A8577]">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
