import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RessourcesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: resources } = await supabase
    .from("resources")
    .select("id, title, category, type, url")
    .eq("visible", true)
    .order("category", { ascending: true });

  const list = resources ?? [];
  const grouped: Record<string, typeof list> = {};
  for (const r of list) {
    const key = r.category || "Autres";
    grouped[key] = grouped[key] || [];
    grouped[key].push(r);
  }

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Mes ressources</h1>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Aucune ressource disponible pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold text-navy mb-2">{category}</p>
                <div className="flex flex-col gap-2">
                  {items.map((r) => (
                    <a
                      key={r.id}
                      href={r.url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-white rounded-xl border border-line p-3 flex justify-between items-center"
                    >
                      <span className="text-sm text-navy font-medium">{r.title}</span>
                      {r.type && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#8A8577]">
                          {r.type}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
