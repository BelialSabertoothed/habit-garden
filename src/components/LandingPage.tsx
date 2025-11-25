import { useState } from "react";
import {
  Sprout,
  Mail,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "./ui/button";
import EmailLogin from "./EmailLogin";
import { RegistrationModal } from "./RegistrationModal";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { motion, useScroll, useTransform } from "framer-motion";

interface LandingPageProps {
  onGoogleLogin: () => void;
  emailLoginSlot?: React.ReactNode;
}

const featureItems = [
  {
    icon: Sprout,
    titleKey: "landing.features.grow.title",
    descriptionKey: "landing.features.grow.description",
  },
  {
    icon: TrendingUp,
    titleKey: "landing.features.progress.title",
    descriptionKey: "landing.features.progress.description",
  },
  {
    icon: Award,
    titleKey: "landing.features.rewards.title",
    descriptionKey: "landing.features.rewards.description",
  },
];

export function LandingPage({ onGoogleLogin, emailLoginSlot }: LandingPageProps) {
  const [showEmail, setShowEmail] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { t } = useTranslation();

  // parallax – pomalejší posun pozadí při scrollu
  const { scrollY } = useScroll();
  const ySlow = useTransform(scrollY, [0, 300], [0, 40]);
  const yMedium = useTransform(scrollY, [0, 300], [0, 80]);
  const yFast = useTransform(scrollY, [0, 300], [0, 120]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50">
      {/* ✨ parallax pozadí */}
      <motion.div
        style={{ y: ySlow }}
        className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-300/45 blur-3xl"
      />
      <motion.div
        style={{ y: yMedium }}
        className="pointer-events-none absolute top-1/3 -right-40 w-[28rem] h-[28rem] rounded-full bg-teal-300/45 blur-3xl"
      />
      <motion.div
        style={{ y: yFast }}
        className="pointer-events-none absolute -bottom-52 left-1/3 w-[30rem] h-[30rem] rounded-full bg-lime-200/45 blur-3xl"
      />
      {/* jemný wash, aby to nebylo moc křiklavé */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/55 via-transparent to-emerald-100/40" />

      {/* top bar – jazyk */}
      <div className="relative max-w-6xl mx-auto px-6 pt-6 flex justify-end">
        <LanguageSwitcher />
      </div>

      {/* hlavní obsah */}
      <main className="relative max-w-6xl mx-auto px-6 pb-16 pt-6">
        <div
          className="
            grid
            gap-10
            lg:gap-14
            xl:gap-20
            items-start
            xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]
            xl:items-center
            xl:min-h-[calc(100vh-7rem)]
          "
        >
          {/* LEFT – hero + features */}
          <section className="space-y-8 max-w-2xl w-full mx-auto xl:max-w-none xl:mx-0">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-green-900">
                {t("landing.hero.title.line1")}
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("landing.hero.title.line2")}
                </span>
              </h1>
              <p className="text-green-800/90 text-base sm:text-lg leading-relaxed">
                {t("landing.hero.subtitle")}
              </p>
            </div>

            {/* FEATURE CARDS – 3 pod sebou, nižší a kompaktní */}
            <div className="grid gap-4 max-w-xl w-full mx-auto xl:mx-0">
              {featureItems.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100 shadow-sm flex items-start gap-3"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 flex-shrink-0">
                      <Icon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug">
                        {t(feature.titleKey)}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        {t(feature.descriptionKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* RIGHT – login card */}
          <aside className="w-full flex justify-center mt-6 xl:mt-0 xl:justify-end">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-emerald-100 max-w-md w-full space-y-8 mx-auto xl:mx-0">
              {/* dekorativní odlesky uvnitř cardu */}
              <div className="pointer-events-none absolute -top-6 -right-10 w-24 h-24 rounded-full bg-emerald-300/40 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-teal-300/35 blur-3xl" />

              <div className="relative space-y-6">
                {/* header cardu */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-[0.3em] text-green-600 uppercase">
                    {t("landing.card.header")}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                      <Sprout className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {t("landing.brand")}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {t("landing.card.tagline")}
                  </p>
                </div>

                {/* CTA buttons */}
                <div className="space-y-4">
                  {/* Google */}
                  <Button
                    onClick={onGoogleLogin}
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-full py-5 shadow-sm flex items-center justify-center transition-all"
                  >
                    <svg
                      className="w-5 h-5 mr-3"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    {t("landing.actions.google")}
                  </Button>

                  {/* Email toggle */}
                  <Button
                    onClick={() => setShowEmail((v) => !v)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full py-5 shadow-md flex items-center justify-center transition-all"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    {showEmail
                      ? t("landing.actions.hideEmail")
                      : t("landing.actions.email")}
                  </Button>

                  {/* Email panel */}
                  {showEmail && (
                    <div className="mt-2 bg-white/95 backdrop-blur-sm border border-green-200 rounded-2xl p-4 shadow-sm">
                      {emailLoginSlot ?? <EmailLogin />}
                    </div>
                  )}

                  {/* Register */}
                  <Button
                    onClick={() => setShowRegister(true)}
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-full py-4 shadow-sm flex items-center justify-center transition-all"
                  >
                    <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                    {t("landing.actions.register")}
                  </Button>
                </div>
              </div>

              {/* mini text dole */}
              <p className="text-xs text-gray-500 leading-relaxed pt-2">
                {t("landing.card.footer")}
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Registration modal */}
      <RegistrationModal
        open={showRegister}
        onOpenChange={setShowRegister}
        onComplete={() => setShowEmail(false)}
      />
    </div>
  );
}
