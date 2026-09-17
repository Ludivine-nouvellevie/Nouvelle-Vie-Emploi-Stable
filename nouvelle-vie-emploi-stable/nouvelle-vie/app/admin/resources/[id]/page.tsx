import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateResource, deleteResource, assignResource } from "./actions";

const CATEGORIES = [
  "Modèles de CV",
  "Lettres de motivation",
  "Préparer un entretien",
  "Offres d'emploi",
  "Formations et aides",
  "Mes documents",
];

type BeneficiaryOption = {
  id: string;
  users: { firstname: string | null; lastname: string | null } | null;
};

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (me?.role !== "admin") redirect("/dashboard");

  const { data: resource } = await supabase
    .from("resources")
    .select("id, title, category, type, url, visible")
    .eq("id", params.id)
    .single();

  if (!resource) redirect("/admin/resources");

  const { data: beneficiaries } = await supabase
    .from("beneficiaries")
    .select("id, users:user_id(firstname, lastname)")
    .returns<BeneficiaryOption[]>();

  const { data: assigned } = await supabase
    .from("beneficiary_resources")
    .select("beneficiary_id")
    .eq("resource_id", resource.id);

  const assignedIds = new Set((assigned ?? []).map((a) => a.beneficiary_id));

  return (
    <div className="min-h-screen bg-[#F4F0E6] p-6">
      <div className="max-w-xl mx-auto">
        <Link href="/admin/resources" className="text-sm text-navy underline">
          ← Retour aux ressources
        </Link>
        <h1 className="text-xl font-bold text-navy mt-3 mb-6">Modifier la ressource</h1>

        <form action={updateResource} className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-4 mb-6">
          <input type="hidden" name="id" value={resource.id} />
          <div>
            <label className="text-xs font-medium text-navy">Titre</label>
            <input
              name="title"
              defaultValue={resource.title}
              required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Catégorie</label>
            <select
              name="category"
              defaultValue={resource.category}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Type</label>
            <input
              name="type"
              defaultValue={resource.type || ""}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-navy">Lien (URL)</label>
            <input
              name="url"
              defaultValue={resource.url || ""}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-line bg-white text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" name="visible" defaultChecked={resource.visible} className="w-4 h-4" />
            Visible par tous les bénéficiaires
          </label>

          <button
            type="submit"
            className="mt-2 w-full py-3 rounded-full bg-gold text-navy-deep font-semibold text-sm"
          >
            Enregistrer
          </button>
        </form>

        <form
          action={assignResource}
          className="bg-white rounded-xl2 border border-line p-6 flex flex-col gap-3 mb-6"
        >
          <input type="hidden" name="resourceId" value={resource.id} />
          <p className="text-xs font-semibold text-navy mb-1">
            Attribuer spécifiquement à (en plus de "visible par tous" si coché ci-dessus) :
          </p>
          {(beneficiaries ?? []).map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm text-navy">
              <input
                type="checkbox"
                name="beneficiary_ids"
                value={b.id}
                defaultChecked={assignedIds.has(b.id)}
                className="w-4 h-4"
              />
              {b.users?.firstname || "Sans nom"} {b.users?.lastname || ""}
            </label>
          ))}
          <button
            type="submit"
            className="mt-2 w-full py-2.5 rounded-full border-2 border-navy text-navy font-semibold text-sm"
          >
            Mettre à jour l'attribution
          </button>
        </form>

        <form action={deleteResource}>
          <input type="hidden" name="id" value={resource.id} />
          <button
            type="submit"
            className="w-full py-2.5 rounded-full border-2 border-red-500 text-red-600 font-semibold text-sm"
          >
            Supprimer cette ressource
          </button>
        </form>
      </div>
    </div>
  );
}
