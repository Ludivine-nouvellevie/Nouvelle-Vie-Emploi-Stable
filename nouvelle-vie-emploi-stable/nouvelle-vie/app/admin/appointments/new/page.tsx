import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "./actions";

type BeneficiaryOption = {
  id: string;
  users: { firstname: string | null; lastname: string | null; email: string | null } | null;
};

export default async function NewAppointmentPage() {
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
        <h1 className="text-xl font-bold text-navy mt-3 mb-6">Programmer un rendez-vous</h1>

        <form action={createAppointment} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-navy">Bénéficiaire</label>
            <select
              name="beneficiary_id"
              required
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-navy">Date</label>
              <input
                type="date"
                name="date"
                required
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-navy">Heure</label>
              <input
                type="time"
                name="time"
                defaultValue="09:00"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-navy">Mode</label>
            <select
              name="mode"
              defaultValue="presentiel"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            >
              <option value="presentiel">Présentiel</option>
              <option value="telephone">Téléphone</option>
              <option value="visio">Visio</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-navy">
              Objectifs d'ici là (affichés au bénéficiaire)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder={"Ex :\nEnvoyer 5 candidatures\nFaire 2 relances\nMettre à jour son CV"}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Programmer le rendez-vous
          </button>
        </form>
      </div>
    </div>
  );
}
