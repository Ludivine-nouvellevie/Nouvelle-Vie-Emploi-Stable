import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ApplicationStatusSelect from "./ApplicationStatusSelect";

export default async function CandidaturesPage() {
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

  if (!beneficiary) {
    return (
      <div className="min-h-screen bg-[#F4F0E6] flex items-center justify-center p-6">
        <div className="max-w-sm bg-white rounded-xl2 border border-line p-6 text-sm text-[#8A8577] text-center">
          Votre profil bénéficiaire n'est pas encore complété par votre conseillère.
          <div className="mt-4">
            <Link href="/dashboard" className="text-navy underline text-xs">
              ← Retour au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_title, company, application_date, source, status, comment")
    .eq("beneficiary_id", beneficiary.id)
    .order("application_date", { ascending: false, nullsFirst: false });

  const list = applications ?? [];
  const entretiens = list.filter((a) => a.status === "entretien").length;
  const positifs = list.filter((a) => a.status === "entretien" || a.status === "embauche").length;

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className="text-xs text-navy underline">
            ← Tableau de bord
          </Link>
          <Link
            href="/candidatures/new"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-navy text-white"
          >
            + Ajouter
          </Link>
        </div>
        <h1 className="text-lg font-bold text-navy mt-3 mb-4">Mes candidatures</h1>

        <div className="flex gap-4 mb-5 bg-white rounded-xl2 border border-line px-4 py-3">
          <div>
            <div className="text-base font-bold text-navy">{list.length}</div>
            <div className="text-[10px] text-[#8A8577]">candidatures</div>
          </div>
          <div>
            <div className="text-base font-bold text-navy">{entretiens}</div>
            <div className="text-[10px] text-[#8A8577]">entretiens</div>
          </div>
          <div>
            <div className="text-base font-bold text-navy">{positifs}</div>
            <div className="text-[10px] text-[#8A8577]">retours positifs</div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Aucune candidature pour le moment. Cliquez sur "+ Ajouter" pour commencer.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {list.map((a) => (
              <div key={a.id} className="bg-white rounded-xl2 border border-line p-4">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <div className="text-sm font-semibold text-navy">{a.job_title}</div>
                    <div className="text-xs text-[#8A8577] mt-0.5">
                      {a.company}
                      {a.application_date &&
                        ` · ${new Date(a.application_date).toLocaleDateString("fr-FR")}`}
                    </div>
                  </div>
                  <ApplicationStatusSelect id={a.id} status={a.status} />
                </div>
                {a.comment && <p className="text-xs text-[#8A8577] mt-2">{a.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
