import { useState } from "react";
import { api } from "../lib/api";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { User, Mail, Lock, Sparkles, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";

interface RegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const avatars = [
  { id: "🌱", emoji: "🌱", name: "Seedling" },
  { id: "🌿", emoji: "🌿", name: "Herb" },
  { id: "🌸", emoji: "🌸", name: "Blossom" },
  { id: "🌻", emoji: "🌻", name: "Sunflower" },
  { id: "🌺", emoji: "🌺", name: "Hibiscus" },
  { id: "🌹", emoji: "🌹", name: "Rose" },
  { id: "🌵", emoji: "🌵", name: "Cactus" },
  { id: "🌳", emoji: "🌳", name: "Tree" },
  { id: "🍀", emoji: "🍀", name: "Clover" },
  { id: "🌾", emoji: "🌾", name: "Grain" },
  { id: "🪴", emoji: "🪴", name: "Potted Plant" },
  { id: "🌼", emoji: "🌼", name: "Daisy" },
];

export function RegistrationModal({
  open,
  onOpenChange,
  onComplete,
}: RegistrationModalProps) {
  const { t } = useTranslation();

  // form state
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState<string>(avatars[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ui state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false); // když true = STEP 2 (info)

  const validate = () => {
    const e: Record<string, string> = {};

    if (!email.trim()) {
      e.email = t("auth.register.validation.email.required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = t("auth.register.validation.email.invalid");
    }

    if (!nickname.trim()) {
      e.nickname = t("auth.register.validation.nickname.required");
    } else if (nickname.trim().length < 2) {
      e.nickname = t("auth.register.validation.nickname.tooShort");
    } else if (nickname.trim().length > 20) {
      e.nickname = t("auth.register.validation.nickname.tooLong");
    }

    if (!password) {
      e.password = t("auth.register.validation.password.required");
    } else if (password.length < 8) {
      e.password = t("auth.register.validation.password.tooShort");
    }

    if (password !== confirm) {
      e.confirm = t("auth.register.validation.confirm.mismatch");
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setEmail("");
    setNickname("");
    setPassword("");
    setConfirm("");
    setAvatar(avatars[0].id);
    setErrors({});
    setServerErr(null);
    setSuccess(false);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerErr(null);
    setSuccess(false);
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post<{ ok: boolean; message?: string }>(
        "auth/register",
        {
          json: {
            email: email.trim(),
            password,
            nickname: nickname.trim(),
            avatar,
          },
        }
      );

      if (!res.ok) {
        setServerErr(res.message || t("auth.register.errors.generic"));
        return;
      }

      // STEP 2 – přepneme modal do info režimu
      setSuccess(true);
      onComplete?.();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        t("auth.register.errors.generic");
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) resetForm();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className="max-w-md max-h-[90vh] overflow-y-auto scrollbar-soft
             bg-white/95 backdrop-blur-sm border-green-200 rounded-3xl
             flex flex-col px-1"
      >
        {!success ? (
          <>
            {/* STEP 1 – registrační formulář */}
            <DialogHeader>
              <div className="flex justify-center mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-green-900">
                {t("auth.register.dialog.title")}
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                {t("auth.register.dialog.description")}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  {t("auth.register.fields.email.label")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.register.fields.email.placeholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((x) => ({ ...x, email: "" }));
                    }}
                    className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                    autoComplete="email"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  {t("auth.register.fields.password.label")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.register.fields.password.placeholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((x) => ({ ...x, password: "" }));
                    }}
                    className="pl-10 pr-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword
                        ? t("auth.register.fields.password.hide")
                        : t("auth.register.fields.password.show")
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              {/* Confirm password */}
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-gray-700">
                  {t("auth.register.fields.confirm.label")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder={t("auth.register.fields.confirm.placeholder")}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setErrors((x) => ({ ...x, confirm: "" }));
                    }}
                    className="pl-10 pr-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showConfirm
                        ? t("auth.register.fields.confirm.hide")
                        : t("auth.register.fields.confirm.show")
                    }
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-sm text-red-500">{errors.confirm}</p>
                )}
              </div>

              {/* Nickname */}
              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-gray-700">
                  {t("auth.register.fields.nickname.label")}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="nickname"
                    type="text"
                    placeholder={t("auth.register.fields.nickname.placeholder")}
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setErrors((x) => ({ ...x, nickname: "" }));
                    }}
                    className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                    maxLength={20}
                    autoComplete="nickname"
                    disabled={loading}
                  />
                </div>
                {errors.nickname && (
                  <p className="text-sm text-red-500">{errors.nickname}</p>
                )}
              </div>

              {/* Avatar picker */}
              <div className="space-y-3">
                <Label className="text-gray-700">
                  {t("auth.register.fields.avatar.label")}
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAvatar(a.id)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
                        avatar === a.id
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-md scale-105 ring-2 ring-green-300"
                          : "bg-green-50 hover:bg-green-100 border border-green-200 hover:border-green-300 hover:scale-105"
                      }`}
                      title={a.name}
                      disabled={loading}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {serverErr && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                  {serverErr}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-6 shadow-md transition-all duration-200 mt-6"
              >
                {loading
                  ? t("auth.register.actions.creating")
                  : t("auth.register.actions.primary")}
              </Button>
            </form>
          </>
        ) : (
          <>
            {/* STEP 2 – info o ověření e-mailu */}
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <DialogTitle className="text-center text-green-900">
                {t("auth.register.success.title")}
              </DialogTitle>
              <DialogDescription className="text-center text-gray-600">
                {t("auth.register.success.subtitle")}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <p className="text-center">{t("auth.register.success.info")}</p>
              <p className="text-center text-xs text-gray-500">
                {t("auth.register.success.note")}
              </p>

              <Button
                type="button"
                onClick={handleClose}
                className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-3 shadow-md"
              >
                {t("auth.register.success.close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
