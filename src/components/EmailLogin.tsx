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
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

export default function EmailLogin() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Verify modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { accessToken } = await api.post<{ accessToken: string }>(
        "auth/login",
        { json: { email, password } }
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
      toast.error(t("auth.emailLogin.forgot.error"));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      {/* HLAVNÍ LOGIN FORMULÁŘ */}
      <form onSubmit={onSubmit} className="space-y-4">
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

        <div className="space-y-1">
          <div className="flex justify-between items-center">
             <label className="text-xs font-medium text-gray-700">
               {t("auth.emailLogin.fields.password.label")}
             </label>
             {/* 👇 TLAČÍTKO PRO OTEVŘENÍ MODÁLU (type="button" je klíčové) */}
             <button
               type="button"
               onClick={() => setShowForgot(true)}
               className="text-xs text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
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
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {err && (
          <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl shadow-sm">
            {err}
          </div>
        )}

        <Button
          disabled={loading}
          className="w-full py-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md"
        >
          {loading ? t("auth.emailLogin.actions.signingIn") : t("auth.emailLogin.actions.signIn")}
        </Button>
      </form>

      {/* VERIFY EMAIL MODAL */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="rounded-2xl max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>{t("auth.emailLogin.verify.title")}</DialogTitle>
            <DialogDescription>{verifyMessage}</DialogDescription>
          </DialogHeader>
          <div className="pt-3 flex justify-end">
            <Button onClick={() => setShowVerifyModal(false)} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
              {t("auth.emailLogin.verify.button")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 👇 FORGOT PASSWORD MODAL */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <DialogContent className="rounded-2xl max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>{t("auth.emailLogin.forgot.title")}</DialogTitle>
            <DialogDescription>
              {t("auth.emailLogin.forgot.description")}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleForgotSubmit} className="space-y-4 mt-2">
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">{t("auth.emailLogin.fields.email.label")}</label>
               <Input 
                 type="email" 
                 placeholder={t("auth.emailLogin.fields.email.placeholder")}
                 value={forgotEmail}
                 onChange={(e) => setForgotEmail(e.target.value)}
                 required
                 className="rounded-xl"
               />
             </div>
             <DialogFooter>
               <Button type="submit" disabled={forgotLoading} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
                 {forgotLoading ? t("auth.emailLogin.forgot.submitting") : t("auth.emailLogin.forgot.submit")}
               </Button>
             </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}