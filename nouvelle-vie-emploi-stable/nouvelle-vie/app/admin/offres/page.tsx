import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OffresPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const { data: offers } = await supabase
    .from("job_offers")
    .select("id, title, company, description, url, posted_at")
    .gte("posted_at", fiveDaysAgo.toISOString())
    .order("posted_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Offres d'emploi</h1>

        {!offers || offers.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Aucune offre publiée pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {offers.map((o) => (
              <div key={o.id} className="bg-white rounded-xl2 border border-line p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-sm font-semibold text-navy">{o.title}</div>
                    {o.company && <div className="text-xs text-[#8A8577] mt-0.5">{o.company}</div>}
                  </div>
                  <span className="text-[10px] text-[#8A8577] whitespace-nowrap">
                    {new Date(o.posted_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {o.description && <p className="text-xs text-[#8A8577] mt-2">{o.description}</p>}
                {o.url && (
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-navy underline mt-2 inline-block"
                  >
                    Voir l'offre →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
