import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAccessToken, clearAccessToken } from "./lib/authToken";

import { LandingPage } from "./components/LandingPage";
import { OnboardingTour } from "./components/OnboardingTour";
import { DashboardGarden } from "./components/DashboardGarden";
import { HabitsList } from "./components/HabitsList";
import { StatsGrowthLog } from "./components/StatsGrowthLog";
import { ProfileRewards } from "./components/ProfileRewards";
import { useMe, loginWithGoogle, useLogout } from "./hooks/useAuth";
import { api } from "./lib/api";
import { Navigation } from "./components/Navigation";
import { useBadgeToasts } from "./hooks/useBadgeToasts";
import { askNotificationPermission } from "./lib/notificationPermission";
import { FlowerLoader } from "./components/FlowerLoader";
import "./i18n/i18n";

type Page = "garden" | "habits" | "stats" | "profile";

export default function App() {
  const { data: me, isLoading } = useMe();
  const logout = useLogout();
  const qc = useQueryClient();

  const [currentPage, setCurrentPage] = useState<Page>("garden");

  // theme taháme rovnou z /me (fallback na "day")
  const theme = (me?.theme ?? "day") as "day" | "night";

  // badge toasty jen pro gamified variantu
  const badgeToastsEnabled = me?.experimentVariant === "gamified";
  useBadgeToasts(theme, badgeToastsEnabled);

  useEffect(() => {
    if (!me) return;
    if (!me.onboardingDone) return;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        askNotificationPermission();
      }
    }
  }, [me]);

  // Google OAuth callback – access_token v URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const token = params.get("access_token");

    if (token) {
      setAccessToken(token);

      window.location.replace("/");
    }
  }, []);

  /* ---------------------- LOADING / NO USER ---------------------- */

  if (isLoading) {
    return <FlowerLoader theme={theme} />;
  }

  // Nepřihlášený user → landing (login + registrační modal)
  if (!me) {
    return <LandingPage onGoogleLogin={loginWithGoogle} />;
  }

  /* ---------------------- ONBOARDING ---------------------- */

  // OnboardingTour běží po prvním přihlášení, dokud neproběhne POST /profile/onboarding
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

  /* ---------------------- HLAVNÍ APLIKACE ---------------------- */

  return (
    <div
      className={`min-h-screen ${
        theme === "night"
          ? "bg-slate-900"
          : "bg-gradient-to-br from-green-50 via-blue-50 to-beige-50"
      } transition-colors duration-300 pb-20 md:pb-0`}
    >
      <Navigation
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        theme={theme}
        onLogout={async () => {
          clearAccessToken();
          await logout.mutateAsync();
          qc.cancelQueries({ queryKey: ["me"] });
          qc.setQueryData(["me"], null);
          setCurrentPage("garden");
        }}
      />

      <main className="max-w-[1200px] mx-auto px-6 pb-8 pt-20 md:pt-24">
        {currentPage === "garden" && <DashboardGarden theme={theme} />}
        {currentPage === "habits" && <HabitsList theme={theme} />}
        {currentPage === "stats" && <StatsGrowthLog theme={theme} />}
        {currentPage === "profile" && <ProfileRewards />}
      </main>
    </div>
  );
}
