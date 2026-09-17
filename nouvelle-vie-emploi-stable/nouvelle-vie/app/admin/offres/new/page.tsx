import Link from "next/link";
import { createJobOffer } from "./actions";

export default function NewJobOfferPage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-1">Publier une offre d'emploi</h1>
        <p className="text-sm text-[#8A8577] mb-6">Visible par tous les bénéficiaires pendant 5 jours.</p>

        <form action={createJobOffer} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-navy">Poste</label>
            <input
              name="title"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Entreprise</label>
            <input
              name="company"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Description</label>
            <textarea
              name="description"
              rows={3}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Lien vers l'offre (optionnel)</label>
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
            Publier l'offre
          </button>
        </form>
      </div>
    </div>
  );
}
