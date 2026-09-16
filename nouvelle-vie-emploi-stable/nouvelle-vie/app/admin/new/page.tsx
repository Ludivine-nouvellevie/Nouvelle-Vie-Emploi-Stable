import { createBeneficiary } from "./actions";
import Link from "next/link";

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-navy">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
      />
    </div>
  );
}

export default function NewBeneficiaryPage() {
  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-1">Nouveau bénéficiaire</h1>
        <p className="text-sm text-[#8A8577] mb-6">
          Un email d'invitation sera envoyé pour qu'il/elle définisse son mot de passe.
        </p>

        <form action={createBeneficiary} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prénom" name="firstname" required />
            <Field label="Nom" name="lastname" required />
          </div>
          <Field label="Email" name="email" type="email" required />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Emploi recherché" name="job_target" />
            <Field label="Secteur" name="sector" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Type de contrat" name="contract_type" />
            <Field label="Temps de travail" name="work_time" />
          </div>
          <Field label="Mobilité" name="mobility" />
          <Field label="Objectif à 6 mois" name="six_month_goal" />

          <div>
            <label className="text-xs font-medium text-navy">Freins identifiés</label>
            <textarea name="obstacles" rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Notes de la conseillère</label>
            <textarea name="notes" rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm" />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Créer et envoyer l'invitation
          </button>
        </form>
      </div>
    </div>
  );
}
