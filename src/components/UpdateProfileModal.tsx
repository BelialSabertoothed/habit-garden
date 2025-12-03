import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useMe, useLogout } from "../hooks/useAuth";
import { clearAccessToken } from "../lib/authToken";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  theme: "day" | "night";
};

const EMOJIS = [
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

export default function EditProfileModal({
  open,
  onOpenChange,
  theme,
}: Props) {
  const { t } = useTranslation();
  const { data: me } = useMe();
  const qc = useQueryClient();
  const logout = useLogout();
  const isDark = theme === "night";

  const [nickname, setNickname] = useState(me?.nickname ?? "");
  const [avatar, setAvatar] = useState(me?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Delete dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open || !me) return;
    setNickname(me.nickname ?? "");
    setAvatar(me.avatar ?? "");
    setErr(null);
  }, [open, me]);

  const canSave = useMemo(
    () => nickname.trim().length >= 2 && avatar.trim().length > 0,
    [nickname, avatar]
  );

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setErr(null);

    const prev = qc.getQueryData(["me"]);
    qc.setQueryData(["me"], (curr: any) =>
      curr ? { ...curr, nickname, avatar } : curr
    );

    try {
      await api.post("profile/update", { json: { nickname, avatar } });
      await qc.invalidateQueries({ queryKey: ["me"] });
      onOpenChange(false);
    } catch (e: any) {
      setErr(e?.message ?? "Save failed");
      qc.setQueryData(["me"], prev);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await api.del("profile");
      clearAccessToken();
      await logout.mutateAsync();
      qc.cancelQueries();
      qc.clear();
      window.location.href = "/";
    } catch (_e) {
      toast.error("Failed to delete account.");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const modeClasses = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
        <DialogContent
          className={`${modeClasses} rounded-2xl max-w-md w-[95vw] max-h-[90vh] flex flex-col`}
        >
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              {t("profile.updateModal.title")}
            </DialogTitle>
            <DialogDescription
              className={isDark ? "text-gray-400" : "text-gray-600"}
            >
              {t("profile.updateModal.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
            {/* Nickname */}
            <div className="space-y-2">
              <label
                htmlFor="profile-nickname"
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {t("profile.updateModal.nicknameLabel")}
              </label>
              <Input
                id="profile-nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={t("profile.updateModal.nicknamePlaceholder")}
                maxLength={40}
                className={`rounded-lg ${
                  isDark
                    ? "bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
                    : "bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400"
                }`}
              />
            </div>

            {/* Avatar / emoji */}
            <div className="space-y-2">
              <div
                className={`text-sm font-medium ${
                  isDark ? "text-gray-200" : "text-gray-800"
                }`}
              >
                {t("profile.updateModal.avatarLabel")}
              </div>
              <p
                className={`text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {t("profile.updateModal.avatarDescription")}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mt-2">
                {EMOJIS.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => setAvatar(e.emoji)}
                    className={`p-2.5 sm:p-3 rounded-xl border-2 text-base sm:text-lg transition-all duration-200 
                    ${
                      avatar === e.emoji
                        ? "border-green-500 bg-green-50"
                        : isDark
                        ? "border-slate-600 bg-slate-700 hover:border-slate-500"
                        : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                    aria-label={e.name}
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            </div>

            {err && (
              <div
                className={`text-sm ${
                  isDark ? "text-red-400" : "text-red-600"
                }`}
              >
                {err}
              </div>
            )}

            {/* DANGER ZONE */}
            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-slate-700">
              <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">
                {t("profile.dangerZone.title")}
              </h4>
              <Button
                type="button"
                variant="destructive"
                className="w-full rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/40"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("profile.dangerZone.deleteButton")}
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className={`flex-1 rounded-full ${
                isDark
                  ? "border-slate-500 bg-slate-800 text-gray-200 hover:bg-slate-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {t("profile.updateModal.cancel")}
            </Button>
            <Button
              type="button"
              onClick={onSave}
              disabled={saving || !canSave}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
            >
              {saving
                ? t("profile.updateModal.saving")
                : t("profile.updateModal.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ALERT DIALOG PRO DELETE */}
      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialogContent className="rounded-2xl bg-white dark:bg-slate-900 border-red-100 dark:border-red-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {t("profile.dangerZone.dialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("profile.dangerZone.dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">
              {t("profile.dangerZone.dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full"
              disabled={isDeleting}
            >
              {isDeleting
                ? t("profile.dangerZone.dialog.deleting")
                : t("profile.dangerZone.dialog.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}