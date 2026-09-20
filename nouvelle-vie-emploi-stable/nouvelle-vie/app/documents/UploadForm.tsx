"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TYPES = [
  { value: "cv", label: "CV" },
  { value: "lettre", label: "Lettre de motivation" },
  { value: "contrat", label: "Contrat de travail" },
  { value: "autre", label: "Autre" },
];

export default function UploadForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [type, setType] = useState("cv");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${type}__${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);

    setLoading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl2 border border-line p-4 flex flex-col gap-3">
      <div>
        <label className="text-xs font-medium text-navy">Type de document</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-xs font-medium text-navy">Fichier</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mt-1 text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full py-2.5 rounded-full bg-gold text-navy-deep font-semibold text-sm disabled:opacity-60"
      >
        {loading ? "Envoi..." : "Envoyer le document"}
      </button>
    </form>
  );
}
