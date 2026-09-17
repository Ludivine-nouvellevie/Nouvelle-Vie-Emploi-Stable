"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

export type BeneficiarySummary = {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  job_target: string;
  mental: number | null;
  actionsProgress: number | null;
  lateCount: number;
  applicationsCount: number;
  nextAppointmentLabel: string;
  isActive: boolean;
  lastActivityLabel: string;
  daysSinceActivity: number | null;
};

export default function BeneficiariesTable({ list }: { list: BeneficiarySummary[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"actif" | "inactif" | "tous">("actif");

  const filtered = useMemo(() => {
    return list.filter((b) => {
      if (statusFilter === "actif" && !b.isActive) return false;
      if (statusFilter === "inactif" && b.isActive) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${b.firstname} ${b.lastname} ${b.email}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [list, search, statusFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Rechercher un nom ou un email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-line bg-white text-sm"
        />
        <div className="flex gap-1">
          {(["actif", "inactif", "tous"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border ${
                statusFilter === s ? "bg-navy text-white border-navy" : "bg-white text-navy border-line"
              }`}
            >
              {s === "actif" ? "Actifs" : s === "inactif" ? "Inactifs" : "Tous"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-[#8A8577] mb-2">
        {filtered.length} bénéficiaire(s) affiché(s) sur {list.length}
      </p>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577]">
          Aucun bénéficiaire ne correspond à ce filtre.
        </div>
      ) : (
        <div className="bg-white rounded-xl2 border border-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FBF3E4] text-navy text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-3">Bénéficiaire</th>
                <th className="text-left px-4 py-3">Objectif</th>
                <th className="text-left px-4 py-3">Mental</th>
                <th className="text-left px-4 py-3">Actions</th>
                <th className="text-left px-4 py-3">Candidatures</th>
                <th className="text-left px-4 py-3">Prochain RDV</th>
                <th className="text-left px-4 py-3">Dernière activité</th>
                <th className="text-left px-4 py-3">Alertes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/admin/beneficiaires/${b.id}`} className="font-medium text-navy underline">
                      {b.firstname || "Sans nom"} {b.lastname}
                    </Link>
                    {!b.isActive && (
                      <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F1EFE8] text-[#8A8577]">
                        Inactif
                      </span>
                    )}
                    <div className="text-xs text-[#8A8577]">{b.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[#4A4636] whitespace-nowrap">{b.job_target || "—"}</td>
                  <td className="px-4 py-3">
                    {b.mental !== null ? (
                      <span className={b.mental < 40 ? "text-red-600 font-semibold" : "text-navy"}>
                        {b.mental}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy">
                    {b.actionsProgress !== null ? `${b.actionsProgress}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-navy">{b.applicationsCount}</td>
                  <td className="px-4 py-3 text-navy whitespace-nowrap">{b.nextAppointmentLabel}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {b.daysSinceActivity !== null && b.daysSinceActivity > 30 ? (
                      <span className="text-[11px] text-[#8A8577]">
                        {b.lastActivityLabel} ⚠️
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#8A8577]">{b.lastActivityLabel}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {b.lateCount > 0 ? (
                      <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-full whitespace-nowrap">
                        {b.lateCount} action(s) en retard
                      </span>
                    ) : (
                      <span className="text-xs text-[#8A8577]">Aucune</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
