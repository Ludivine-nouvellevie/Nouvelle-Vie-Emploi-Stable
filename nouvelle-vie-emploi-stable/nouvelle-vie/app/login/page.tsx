"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const action =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password });

    const { error } = await action;
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-white text-2xl font-bold">Nouvelle Vie</h1>
          <p className="text-gold text-sm font-semibold mt-1">Nouveau départ</p>
          <p className="text-white/80 text-sm italic mt-6">
            « Ta réussite commence ici ! »
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-cream rounded-xl2 p-6 flex flex-col gap-4"
        >
          <div className="flex gap-2 mb-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                mode === "signin" ? "bg-navy text-white" : "bg-white text-navy border border-line"
              }`}
            >
              Se connecter
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2 rounded-full text-sm font-semibold ${
                mode === "signup" ? "bg-navy text-white" : "bg-white text-navy border border-line"
              }`}
            >
              Créer mon compte
            </button>
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm disabled:opacity-60"
          >
            {loading
              ? "Un instant..."
              : mode === "signin"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
