import { useState } from "react";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/authToken";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

export default function EmailLogin() {
  const qc = useQueryClient();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null); // jen pro invalid login
  const [loading, setLoading] = useState(false);

  // modal pro verifikaci
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
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
      // tady můžeš zavřít parent login modal
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

  return (
    <>
      {/* FORM */}
      <form onSubmit={onSubmit} className="space-y-2">
        <input
          className="border rounded px-3 py-2 w-full"
          placeholder={t("auth.emailLogin.fields.email.placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border rounded px-3 py-2 w-full"
          placeholder={t("auth.emailLogin.fields.password.placeholder")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {err && <div className="text-red-600 text-sm">{err}</div>}

        <button disabled={loading} className="border rounded px-3 py-2 w-full">
          {loading
            ? t("auth.emailLogin.actions.signingIn")
            : t("auth.emailLogin.actions.signIn")}
        </button>
      </form>

      {/* VERIFICATION MODAL */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t("auth.emailLogin.verify.title")}
            </DialogTitle>
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
    </>
  );
}
