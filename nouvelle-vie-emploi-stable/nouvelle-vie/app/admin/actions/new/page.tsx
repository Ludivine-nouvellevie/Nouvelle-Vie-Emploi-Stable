import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAction } from "./actions";
import ActionTitleField from "./ActionTitleField";

type BeneficiaryOption = {
  id: string;
  users: { firstname: string | null; lastname: string | null; email: string | null } | null;
};

export default async function NewActionPage({
  searchParams,
}: {
  searchParams: { beneficiary?: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("id, users:user_id(firstname, lastname, email)")
    .returns<BeneficiaryOption[]>();

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin" className="text-sm text-navy underline">
          ← Retour au tableau de bord
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-6">Attribuer une action</h1>

        <form action={createAction} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-navy">Bénéficiaire</label>
            <select
              name="beneficiary_id"
              required
              defaultValue={searchParams.beneficiary || ""}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            >
              <option value="">— Choisir —</option>
              {(beneficiaries ?? []).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.users?.firstname || "Sans nom"} {b.users?.lastname || ""} ({b.users?.email})
                </option>
              ))}
            </select>
          </div>

          <ActionTitleField />

          <div>
            <label className="text-xs font-medium text-navy">Description</label>
            <textarea
              name="description"
              rows={2}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy">Priorité</label>
              <select
                name="priority"
                defaultValue="moyenne"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              >
                <option value="basse">Basse</option>
                <option value="moyenne">Moyenne</option>
                <option value="haute">Haute</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-navy">Échéance</label>
              <input
                type="date"
                name="due_date"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Attribuer l'action
          </button>
        </form>
      </div>
    </div>
  );
}
