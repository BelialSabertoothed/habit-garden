import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Sprout, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export function ResetPassword() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Získání tokenu z URL
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error(t("auth.reset.errors.missingToken"));
      return;
    }
    if (password.length < 8) {
      toast.error(t("auth.reset.errors.tooShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("auth.reset.errors.mismatch"));
      return;
    }

    setLoading(true);
    try {
      await api.post("auth/reset-password", {
        json: { token, password },
      });
      setSuccess(true);
      toast.success(t("auth.reset.successDesc"));
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Failed to reset password";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {t("auth.reset.invalidTitle")}
        </h2>
        <p className="text-gray-600 mt-2">{t("auth.reset.invalidDesc")} </p>
        <Button
          className="mt-6 rounded-full"
          onClick={() => (window.location.href = "/")}
        >
          {t("auth.reset.homeButton")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-8 shadow-xl max-w-md w-full">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-green-900">All set!</h2>
            <p className="text-gray-600 mt-2 mb-6">
              {t("auth.reset.successTitle")}{" "}
            </p>
            <Button
              className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => (window.location.href = "/")}
            >
              {t("auth.reset.loginButton")}{" "}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
            </div>

            <h2 className="text-center text-xl font-bold text-gray-900 mb-2">
              {t("auth.reset.title")}{" "}
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              {t("auth.reset.subtitle")}{" "}
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  {t("auth.reset.fields.newPassword.label")}{" "}
                </label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl pr-10"
                    placeholder={t("auth.reset.fields.newPassword.placeholder")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700 ml-1">
                  {t("auth.reset.fields.confirm.label")}{" "}
                </label>
                <Input
                  type={showPw ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="rounded-xl"
                  placeholder={t("auth.reset.fields.confirm.placeholder")}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
              >
                {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
