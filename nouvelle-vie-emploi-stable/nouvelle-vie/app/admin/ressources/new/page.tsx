import Link from "next/link";
import { createResource } from "./actions";

const CATEGORIES = [
  "Modèles de CV",
  "Lettres de motivation",
  "Préparer un entretien",
  "Offres d'emploi",
  "Formations et aides",
  "Mes documents",
];

export default function NewResourcePage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-6">Ajouter une ressource</h1>

        <form action={createResource} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-navy">Titre</label>
            <input
              name="title"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Catégorie</label>
            <select
              name="category"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            >
              <option value="">— Choisir —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Type</label>
            <input
              name="type"
              placeholder="PDF, lien, vidéo..."
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Lien (URL)</label>
            <input
              name="url"
              placeholder="https://..."
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Ajouter la ressource
          </button>
        </form>
      </div>
    </div>
  );
}
