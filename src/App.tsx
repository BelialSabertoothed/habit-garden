import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAccessToken, clearAccessToken } from "./lib/authToken";
import { LandingPage } from "./components/LandingPage";
import { RegistrationPage } from "./components/FinishRegistrationModal";
import { OnboardingTour } from "./components/OnboardingTour";
import { DashboardGarden } from "./components/DashboardGarden";
import { HabitsList } from "./components/HabitsList";
import { StatsGrowthLog } from "./components/StatsGrowthLog";
import { ProfileRewards } from "./components/ProfileRewards";
import { useMe, loginWithGoogle, useLogout } from "./hooks/useAuth";
import { api } from "./lib/api";

type Page = "garden" | "habits" | "stats" | "profile";

/** Dočasný minimalistický header – můžeš později nahradit svojí <Navigation /> */
function HeaderBar({
  current,
  onChange,
  onLogout,
}: {
  current: Page;
  onChange: (p: Page) => void;
  onLogout: () => void;
}) {
  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center gap-4">
        <div className="font-semibold">🌱 Habit Garden</div>
        <nav className="flex gap-3 text-sm">
          {(["garden", "habits", "stats", "profile"] as Page[]).map((p) => (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`px-3 py-1 rounded ${
                current === p ? "bg-emerald-100 text-emerald-800" : "hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
        <div className="ml-auto">
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded border hover:bg-gray-50 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();
  const qc = useQueryClient();

  // uloží access_token z /oauth-callback#access_token=...
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    if (token) {
      setAccessToken(token);
      history.replaceState(null, "", window.location.pathname + window.location.search);
      qc.invalidateQueries({ queryKey: ["me"] });
    }
  }, [qc]);

  // UI-only stav
  const [theme,] = useState<"day" | "night">("day");
  const [currentPage, setCurrentPage] = useState<Page>("garden");

  if (isLoading) {
    return <div className="p-6">Načítám…</div>;
  }

  // 1) Nepřihlášený → Landing (Google login + Email login panel v komponentě)
  if (!me) {
    return <LandingPage onGoogleLogin={loginWithGoogle} />;
  }

  // 2) Přihlášený, ale nedokončený profil → Registration
  if (!me.profileComplete) {
    return (
      <RegistrationPage
        onComplete={async ({ nickname, avatar }) => {
          await api.post("profile/init", { json: { nickname, avatar } });
          await qc.invalidateQueries({ queryKey: ["me"] });
        }}
      />
    );
  }

  // 3) Přihlášený + profil hotový, ale chybí onboarding → OnboardingTour
  if (!me.onboardingDone) {
    return (
      <OnboardingTour
        theme={theme}
        onComplete={async () => {
          await api.post("profile/onboarding", { json: { done: true } });
          await qc.invalidateQueries({ queryKey: ["me"] });
        }}
      />
    );
  }

  // 4) Vše hotovo → hlavní aplikace
  return (
    <div
      className={`min-h-screen ${
        theme === "night"
          ? "bg-slate-900"
          : "bg-gradient-to-br from-green-50 via-blue-50 to-beige-50"
      } transition-colors duration-300 pb-20 md:pb-0`}
    >
      <HeaderBar
        current={currentPage}
        onChange={setCurrentPage}
          onLogout={async () => {
    clearAccessToken();                           // 1) smazat token
    await logout.mutateAsync();                   // 2) BE logout (cookie pryč)
    // 3) zastavit / vynulovat "me", žádné cycle:
    qc.cancelQueries({ queryKey: ["me"] });
    qc.setQueryData(["me"], null);
    // volitelně: qc.removeQueries({ queryKey: ["me"] });
  }}
/>


      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {currentPage === "garden" && <DashboardGarden theme={theme} />}
        {currentPage === "habits" && <HabitsList theme={theme} />}
        {currentPage === "stats" && <StatsGrowthLog theme={theme} />}
        {currentPage === "profile" && <ProfileRewards />}
      </main>
    </div>
  );
}
