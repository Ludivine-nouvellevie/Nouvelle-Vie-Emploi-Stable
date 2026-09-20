import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import UploadForm from "./UploadForm";
import { deleteDocument } from "./actions";

const TYPE_LABELS: Record<string, string> = {
  cv: "CV",
  lettre: "Lettre de motivation",
  contrat: "Contrat de travail",
  autre: "Autre",
};

export default async function DocumentsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: files } = await supabase.storage.from("documents").list(user.id, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });

  const list = files ?? [];
  const withUrls = await Promise.all(
    list.map(async (f) => {
      const path = `${user.id}/${f.name}`;
      const { data: signed } = await supabase.storage
        .from("documents")
        .createSignedUrl(path, 60 * 60);
      const [typePrefix] = f.name.split("__");
      return {
        path,
        name: f.name,
        url: signed?.signedUrl,
        type: TYPE_LABELS[typePrefix] || "Autre",
      };
    })
  );

  return (
    <div className="min-h-screen bg-[#F4F0E6] py-8 px-4">
      <div className="max-w-sm mx-auto">
        <Link href="/dashboard" className="text-xs text-navy underline">
          ← Tableau de bord
        </Link>
        <h1 className="text-lg font-bold text-navy mt-3 mb-1">Mes documents</h1>
        <p className="text-xs text-[#8A8577] mb-5">
          Déposez votre CV, lettre de motivation, contrat de travail ou tout autre document utile.
        </p>

        <UploadForm userId={user.id} />

        <div className="mt-5 flex flex-col gap-2">
          {withUrls.length === 0 ? (
            <div className="bg-white rounded-xl2 border border-line p-4 text-xs text-[#8A8577]">
              Aucun document déposé pour le moment.
            </div>
          ) : (
            withUrls.map((f) => (
              <div
                key={f.path}
                className="bg-white rounded-xl border border-line p-3 flex justify-between items-center gap-2"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F1EFE8] text-[#8A8577]">
                    {f.type}
                  </span>
                  {f.url ? (
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-sm text-navy underline mt-1 truncate"
                    >
                      {f.name.split("-").slice(1).join("-") || f.name}
                    </a>
                  ) : (
                    <p className="text-sm text-navy mt-1 truncate">{f.name}</p>
                  )}
                </div>
                <form action={deleteDocument}>
                  <input type="hidden" name="path" value={f.path} />
                  <button type="submit" className="text-xs text-red-600 underline whitespace-nowrap">
                    Supprimer
                  </button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
