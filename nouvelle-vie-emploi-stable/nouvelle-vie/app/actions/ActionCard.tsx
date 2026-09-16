"use client";

import { updateActionStatus, updateActionComment } from "./actions";

type ActionRow = {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  due_date: string | null;
  status: string;
  comment: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  fait: "Fait",
};

const PRIORITY_STYLES: Record<string, string> = {
  haute: "bg-red-50 text-red-700",
  moyenne: "bg-[#FBF3E4] text-gold-deep",
  basse: "bg-[#EEF3FA] text-navy",
};

export default function ActionCard({ action }: { action: ActionRow }) {
  const isDone = action.status === "fait";

  return (
    <div className="bg-white rounded-xl2 border border-line p-4 flex flex-col gap-2">
      <div className="flex items-start gap-3">
        <form action={updateActionStatus}>
          <input type="hidden" name="actionId" value={action.id} />
          <input type="hidden" name="status" value={isDone ? "a_faire" : "fait"} />
          <button
            type="submit"
            aria-label="Marquer comme fait"
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
              isDone ? "bg-navy border-navy text-white" : "border-line"
            }`}
          >
            {isDone && "✓"}
          </button>
        </form>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${isDone ? "text-[#8A8577] line-through" : "text-navy"}`}>
            {action.title}
          </div>
          {action.description && (
            <div className="text-xs text-[#8A8577] mt-1">{action.description}</div>
          )}
          <div className="flex flex-wrap gap-2 mt-2">
            {action.priority && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  PRIORITY_STYLES[action.priority] || "bg-[#F1EFE8] text-[#8A8577]"
                }`}
              >
                Priorité {action.priority}
              </span>
            )}
            {action.due_date && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#8A8577]">
                Échéance {new Date(action.due_date).toLocaleDateString("fr-FR")}
              </span>
            )}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1EFE8] text-navy">
              {STATUS_LABELS[action.status] || action.status}
            </span>
          </div>
        </div>
      </div>

      <form action={updateActionComment} className="mt-1 flex gap-2">
        <input type="hidden" name="actionId" value={action.id} />
        <input
          type="text"
          name="comment"
          defaultValue={action.comment || ""}
          placeholder="Ajouter un commentaire..."
          className="flex-1 text-xs px-3 py-2 rounded-lg border border-line bg-[#FAF8F3]"
        />
        <button
          type="submit"
          className="text-xs font-medium text-navy px-3 py-2 rounded-lg border border-line bg-white"
        >
          OK
        </button>
      </form>
    </div>
  );
}
