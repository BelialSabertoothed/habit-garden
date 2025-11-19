import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useMe } from "../hooks/useAuth";
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
  const { data: me } = useMe();
  const qc = useQueryClient();
  const isDark = theme === "night";

  const [nickname, setNickname] = useState(me?.nickname ?? "");
  const [avatar, setAvatar] = useState(me?.avatar ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

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

  const modeClasses = isDark
    ? "bg-slate-800 border-slate-700 text-white"
    : "bg-white border-gray-200 text-gray-900";

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent
        className={`${modeClasses} rounded-2xl max-w-md w-[95vw] max-h-[90vh] flex flex-col`}
      >
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
            Edit profile
          </DialogTitle>
          <DialogDescription
            className={isDark ? "text-gray-400" : "text-gray-600"}
          >
            Update your nickname and garden avatar. This is how you&apos;ll be
            shown across Habit Garden.
          </DialogDescription>
        </DialogHeader>

        {/* scrollovatelný obsah */}
        <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
          {/* Nickname */}
          <div className="space-y-2">
            <label
              htmlFor="profile-nickname"
              className={`text-sm font-medium ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              Nickname
            </label>
            <Input
              id="profile-nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your display name"
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
              Avatar (emoji)
            </div>
            <p
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Pick a small plant friend to represent you in your garden.
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
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={saving || !canSave}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}