"use client";

import { updateStepStatus } from "./actions";

const LABELS: Record<string, string> = {
  non_commencee: "Non commencée",
  en_cours: "En cours",
  terminee: "Terminée",
};

export default function StepStatusSelect({ stepId, status }: { stepId: string; status: string }) {
  return (
    <form action={updateStepStatus}>
      <input type="hidden" name="stepId" value={stepId} />
      <select
        name="status"
        defaultValue={status}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="text-xs font-medium rounded-full px-3 py-1.5 border border-line bg-white text-navy cursor-pointer"
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
