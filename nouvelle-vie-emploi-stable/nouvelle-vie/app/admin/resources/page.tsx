import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ResourcesAdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, category, type, visible")
    .order("category", { ascending: true });

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <div className="flex justify-between items-center mt-3 mb-6">
          <h1 className="text-xl font-bold text-navy">Ressources</h1>
          <Link
            href="/admin/resources/new"
            className="px-4 py-2 rounded-full bg-navy text-white text-sm font-semibold"
          >
            + Ajouter une ressource
          </Link>
        </div>

        {!resources || resources.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577]">
            Aucune ressource pour le moment.
          </div>
        ) : (
          <div className="bg-white rounded-xl2 border border-line overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FBF3E4] text-navy text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Titre</th>
                  <th className="text-left px-4 py-3">Catégorie</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Visibilité</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="px-4 py-3 text-navy font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-[#8A8577]">{r.category}</td>
                    <td className="px-4 py-3 text-[#8A8577]">{r.type || "—"}</td>
                    <td className="px-4 py-3">
                      {r.visible ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#E6F3EB] text-green-700">
                          Visible par tous
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#8A8577]">
                          Ciblée
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/resources/${r.id}`} className="text-xs text-navy underline">
                        Modifier / attribuer
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
