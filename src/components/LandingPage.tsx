// src/components/LandingPage.tsx
import { useState } from "react";
import { Sprout, Mail, Sparkles, TrendingUp, Award } from "lucide-react";
import { Button } from "./ui/button";
import EmailLogin from "./EmailLogin";
import { RegistrationModal } from "./RegistrationModal";
import { useTranslation } from "react-i18next";

interface LandingPageProps {
  onGoogleLogin: () => void;
  /** Volitelný override panelu pro e-mail přihlášení */
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left side - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-green-200">
              <Sparkles className="w-4 h-4 text-green-600" />
              <span className="text-green-800">
                {t("landing.hero.pill")}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-green-900">
                {t("landing.hero.title.line1")}
                <br />
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t("landing.hero.title.line2")}
                </span>
              </h1>

              <p className="text-green-700 max-w-lg opacity-90">
                {t("landing.hero.subtitle")}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3 pt-4">
              {/* Continue with Google */}
              <Button
                onClick={onGoogleLogin}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-full py-6 px-8 shadow-sm transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t("landing.actions.google")}
              </Button>

              {/* Toggle Email Login */}
              <Button
                onClick={() => setShowEmail((v) => !v)}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full py-6 px-8 shadow-md transition-all duration-200"
              >
                <Mail className="w-5 h-5 mr-2" />
                {showEmail
                  ? t("landing.actions.hideEmail")
                  : t("landing.actions.email")}
              </Button>

              {/* Email login panel */}
              {showEmail && (
                <div className="mt-4 bg-white/80 backdrop-blur-sm border border-green-200 rounded-2xl p-4 shadow-sm">
                  {emailLoginSlot ?? <EmailLogin />}
                </div>
              )}

              {/* Register (modal) */}
              <Button
                onClick={() => setShowRegister(true)}
                className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-full py-6 px-8 shadow-sm transition-all duration-200"
              >
                <Sparkles className="w-5 h-5 mr-2 text-green-600" />
                {t("landing.actions.register")}
              </Button>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className="relative">
            <div className="relative bg-white/40 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-green-200">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-20 blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full opacity-20 blur-2xl" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                    <Sprout className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-green-900">
                    {t("landing.brand")}
                  </h2>
                </div>

                {/* Feature cards */}
                <div className="space-y-3">
                  {featureItems.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={index}
                        className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="text-gray-900 mb-1">
                              {t(feature.titleKey)}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {t(feature.descriptionKey)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Registration modal – render mimo tlačítko */}
      <RegistrationModal
        open={showRegister}
        onOpenChange={setShowRegister}
        onComplete={() => {
          // volitelné: po registraci můžeš skrýt email panel, spustit onboarding apod.
          setShowEmail(false);
        }}
      />
    </div>
  );
}
