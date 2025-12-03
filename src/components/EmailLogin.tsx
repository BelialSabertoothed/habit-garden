import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/authToken";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter, // Přidat
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input"; // Přidat, pokud tam není
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast"; // Přidat pro notifikace

export default function EmailLogin() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  // ... (stávající state: email, password, showPw, err, loading, verifyModal...)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  // 👇 NOVÝ STATE PRO FORGOT PASSWORD
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // ... (stávající onSubmit funkce)
  const onSubmit = async (e: React.FormEvent) => {
    // ... (stejný kód jako dřív)
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { accessToken } = await api.post<{ accessToken: string }>(
        "auth/login",
        {
          json: { email, password },
        }
      );

      setAccessToken(accessToken);
      await qc.invalidateQueries({ queryKey: ["me"] });

      setLoading(false);
    } catch (err: any) {
      const code = err?.response?.status;
      const body = err?.response?.data;

      if (code === 403 && body?.error === "email_not_verified") {
        setVerifyMessage(t("auth.emailLogin.verify.message"));
        setShowVerifyModal(true);
        setLoading(false);
        return;
      }

      setErr(t("auth.emailLogin.errors.invalidCredentials"));
      setLoading(false);
    }
  };

  // 👇 NOVÁ FUNKCE
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    try {
      await api.post("auth/forgot-password", { json: { email: forgotEmail } });
      toast.success(t("auth.emailLogin.forgot.success"));
      setShowForgot(false);
      setForgotEmail("");
    } catch (error) {
      console.error(error);
      toast.error(t("auth.emailLogin.forgot.error"));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        {/* ... (Email field - beze změny) */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">
            {t("auth.emailLogin.fields.email.label")}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder={t("auth.emailLogin.fields.email.placeholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
        </div>

        {/* PASSWORD FIELD + FORGOT LINK */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-gray-700">
              {t("auth.emailLogin.fields.password.label")}
            </label>
            {/* 👇 TLAČÍTKO ZAPOMENUTÉ HESLO */}
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {t("auth.emailLogin.actions.forgotPassword")}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              placeholder={t("auth.emailLogin.fields.password.placeholder")}
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        {/* ... (Error + Submit button beze změny) */}
        {err && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl shadow-sm">
            {err}
          </div>
        )}

        <Button
          disabled={loading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t("auth.emailLogin.actions.signingIn")}
            </span>
          ) : (
            t("auth.emailLogin.actions.signIn")
          )}
        </Button>
      </form>

      {/* ... (Verify Modal beze změny) */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("auth.emailLogin.verify.title")}</DialogTitle>
            <DialogDescription>{verifyMessage}</DialogDescription>
          </DialogHeader>
          <div className="pt-3 flex justify-end">
            <Button
              onClick={() => setShowVerifyModal(false)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full"
            >
              {t("auth.emailLogin.verify.button")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/*  MODAL PRO FORGOT PASSWORD */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="...">
          <DialogHeader>
            <DialogTitle>{t("auth.emailLogin.forgot.title")}</DialogTitle>{" "}
            {/* ZMĚNA */}
            <DialogDescription>
              {t("auth.emailLogin.forgot.description")} {/* ZMĚNA */}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                {t("auth.emailLogin.fields.email.label")}{" "}
                {/* Reuse existing key */}
              </label>
              <Input
              // ...
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={forgotLoading} className="...">
                {forgotLoading
                  ? t("auth.emailLogin.forgot.submitting")
                  : t("auth.emailLogin.forgot.submit")}{" "}
                {/* ZMĚNA */}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
