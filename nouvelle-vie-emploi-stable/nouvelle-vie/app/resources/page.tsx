import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RessourcesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: publicResources } = await supabase
    .from("resources")
    .select("id, title, category, type, url")
    .eq("visible", true);

  let targetedResources: typeof publicResources = [];
  if (beneficiary) {
    const { data: assignedIds } = await supabase
      .from("beneficiary_resources")
      .select("resource_id")
      .eq("beneficiary_id", beneficiary.id);

    const ids = (assignedIds ?? []).map((a) => a.resource_id);
    if (ids.length > 0) {
      const { data } = await supabase
        .from("resources")
        .select("id, title, category, type, url")
        .in("id", ids);
      targetedResources = data ?? [];
    }
  }

  const merged = [...(publicResources ?? [])];
  for (const r of targetedResources ?? []) {
    if (!merged.find((m) => m.id === r.id)) merged.push(r);
  }

  const grouped: Record<string, typeof merged> = {};
  for (const r of merged) {
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

        {merged.length === 0 ? (
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
