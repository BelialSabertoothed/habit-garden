import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/authToken";

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
import { User, Mail, Lock, Sparkles } from "lucide-react";

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

export function RegistrationModal({ open, onOpenChange, onComplete }: RegistrationModalProps) {
  const qc = useQueryClient();

  // form state
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [avatar, setAvatar] = useState<string>(avatars[0].id);

  // ui state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email";

    if (!nickname.trim()) e.nickname = "Nickname is required";
    else if (nickname.trim().length < 2) e.nickname = "Nickname must be at least 2 characters";
    else if (nickname.trim().length > 20) e.nickname = "Nickname must be less than 20 characters";

    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";

    if (password !== confirm) e.confirm = "Passwords do not match";

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
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setServerErr(null);
    if (!validate()) return;

    try {
      setLoading(true);
      const { accessToken } = await api.post<{ accessToken: string }>("auth/register", {
        json: { email: email.trim(), password, nickname: nickname.trim(), avatar },
      });
      setAccessToken(accessToken);
      await qc.invalidateQueries({ queryKey: ["me"] });

      onComplete?.();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      const msg =
        err?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Registration failed. Please try again.";
      setServerErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm border-green-200 rounded-3xl">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-green-900">Create Your Account</DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Join Habit Garden and start growing your habits today
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: "" })); }}
                className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                autoComplete="email"
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((x) => ({ ...x, password: "" })); }}
                className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                autoComplete="new-password"
              />
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-gray-700">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirm"
                type="password"
                placeholder="Confirm your password"
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: "" })); }}
                className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <p className="text-sm text-red-500">{errors.confirm}</p>}
          </div>

          {/* Nickname */}
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-gray-700">Nickname</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="nickname"
                type="text"
                placeholder="Choose a nickname"
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); setErrors((x) => ({ ...x, nickname: "" })); }}
                className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                maxLength={20}
                autoComplete="nickname"
              />
            </div>
            {errors.nickname && <p className="text-sm text-red-500">{errors.nickname}</p>}
          </div>

          {/* Avatar picker */}
          <div className="space-y-3">
            <Label className="text-gray-700">Choose your avatar</Label>
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
            {loading ? "Creating…" : "Create Account & Start Growing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
