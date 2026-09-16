import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("firstname")
    .eq("id", user.id)
    .single();

  const { data: beneficiary } = await supabase
    .from("beneficiaries")
    .select("id, six_month_goal")
    .eq("user_id", user.id)
    .single();

  const firstname = profile?.firstname || "à vous";

  return (
    <div className="min-h-screen bg-[#F4F0E6] flex justify-center py-10 px-4">
      <div className="w-full max-w-sm bg-cream rounded-xl2 overflow-hidden shadow-lg">
        <div className="px-5 pt-6 flex justify-between items-start">
          <div>
            <h1 className="text-lg font-bold text-navy">Bonjour {firstname} 👋</h1>
            <p className="text-xs text-[#8A8577] mt-1">Ravi(e) de vous revoir !</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center text-sm font-semibold">
              {firstname?.[0]?.toUpperCase() ?? "?"}
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="mx-5 mt-4 p-3 rounded-xl bg-[#FBF3E4] text-xs text-gold-deep italic">
          « Crois en toi, tu es plus capable que tu ne le penses. »
        </div>

        <div className="mx-5 mt-4">
          <p className="text-xs font-semibold text-navy mb-2">Mon objectif</p>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-line bg-white">
            <div>
              <p className="text-sm font-bold text-navy">Un emploi stable</p>
              <p className="text-xs text-[#8A8577]">
                {beneficiary?.six_month_goal || "CDD +6 mois ou CDI"}
              </p>
            </div>
          </div>
        </div>

        {!beneficiary && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-50 text-xs text-blue-800">
            Votre profil bénéficiaire n'est pas encore complété par votre conseillère.
            Les données affichées sont des exemples en attendant.
          </div>
        )}

        <div className="mx-5 mt-4 mb-2 flex gap-2">
          <Link
            href="/parcours"
            className="flex-1 text-center py-3 rounded-full bg-navy text-white text-sm font-semibold"
          >
            Mon parcours
          </Link>
          <Link
            href="/mental"
            className="flex-1 text-center py-3 rounded-full bg-gold text-navy-deep text-sm font-semibold"
          >
            Mon mental
          </Link>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}
