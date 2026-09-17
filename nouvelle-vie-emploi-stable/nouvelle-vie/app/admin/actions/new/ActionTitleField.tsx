"use client";

import { useState } from "react";

const PRESET_ACTIONS = [
  "Mettre à jour son CV",
  "Rédiger une lettre de motivation",
  "Envoyer des candidatures",
  "Faire des relances",
  "Préparer un entretien",
  "Simuler un entretien",
  "Participer à un atelier",
  "Mettre à jour son profil en ligne",
  "Rechercher des offres d'emploi",
  "Travailler sa présentation / pitch",
  "Contacter son réseau",
];

export default function ActionTitleField() {
  const [selected, setSelected] = useState(PRESET_ACTIONS[0]);
  const [custom, setCustom] = useState("");
  const isCustom = selected === "autre";

  return (
    <div>
      <label className="text-xs font-medium text-navy">Titre de l'action</label>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
      >
        {PRESET_ACTIONS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
        <option value="autre">Autre (personnalisée)...</option>
      </select>

      {isCustom && (
        <input
          name="title"
          required
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Titre personnalisé"
          className="w-full mt-2 px-3 py-2 rounded-lg border border-line bg-white text-sm"
        />
      )}
      {!isCustom && <input type="hidden" name="title" value={selected} />}
    </div>
  );
}
