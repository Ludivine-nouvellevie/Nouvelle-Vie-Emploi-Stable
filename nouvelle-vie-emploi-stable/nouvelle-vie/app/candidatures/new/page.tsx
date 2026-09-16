import Link from "next/link";
import { addApplication } from "../actions";

export default function NewCandidaturePage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/candidatures" className="text-xs text-navy underline">
          ← Mes candidatures
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Nouvelle candidature</h1>

        <form action={addApplication} className="bg-white rounded-xl2 border border-line p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-navy">Poste</label>
            <input
              name="job_title"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Entreprise</label>
            <input
              name="company"
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Date d'envoi</label>
            <input
              type="date"
              name="application_date"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Source de l'offre</label>
            <input
              name="source"
              placeholder="Indeed, France Travail, réseau..."
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Commentaire</label>
            <textarea
              name="comment"
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Ajouter la candidature
          </button>
        </form>
      </div>
    </div>
  );
}
