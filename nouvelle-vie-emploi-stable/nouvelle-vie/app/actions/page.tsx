import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActionCard from "./ActionCard";

export default async function ActionsPage() {
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

  const { data: actionsList } = await supabase
    .from("actions")
    .select("id, title, description, priority, due_date, status, comment")
    .eq("beneficiary_id", beneficiary.id)
    .order("due_date", { ascending: true, nullsFirst: false });

  const list = actionsList ?? [];
  const todo = list.filter((a) => a.status !== "fait");
  const done = list.filter((a) => a.status === "fait");

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-5">Mes actions</h1>

        {list.length === 0 ? (
          <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
            Aucune action attribuée pour le moment.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {todo.length > 0 && (
              <div className="flex flex-col gap-3">
                {todo.map((a) => (
                  <ActionCard key={a.id} action={a} />
                ))}
              </div>
            )}
            {done.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#8A8577] mb-2 mt-2">Terminées</p>
                <div className="flex flex-col gap-3">
                  {done.map((a) => (
                    <ActionCard key={a.id} action={a} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
