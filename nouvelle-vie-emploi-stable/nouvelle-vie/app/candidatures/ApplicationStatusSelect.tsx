"use client";

import { updateApplicationStatus } from "./actions";

const LABELS: Record<string, string> = {
  envoyee: "Envoyée",
  relancee: "Relancée",
  entretien: "Entretien",
  sans_reponse: "Sans réponse",
  refus: "Refus",
  embauche: "Embauche",
};

export default function ApplicationStatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <form action={updateApplicationStatus}>
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-[11px] font-semibold rounded-full px-3 py-1 border border-line bg-white text-navy cursor-pointer"
      >
        {Object.entries(LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </form>
  );
}
