import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useMe } from "../hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

const EMOJIS = ["🌱","🌿","🍀","🌵","🌻","🌼","🌸","🌺","🍃","🪴","🍄","✨"];

export default function EditProfileModal({ open, onOpenChange }: Props) {
  const { data: me } = useMe();
  const qc = useQueryClient();

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
    // optimistic update
    const prev = qc.getQueryData(["me"]);
    qc.setQueryData(["me"], (curr: any) => curr ? { ...curr, nickname, avatar } : curr);

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

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && onOpenChange(v)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block text-sm font-medium">Nickname</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your display name"
            maxLength={40}
          />

          <div>
            <div className="mb-2 text-sm font-medium">Avatar (emoji)</div>
            <div className="grid grid-cols-8 gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setAvatar(e)}
                  className={`h-10 rounded border flex items-center justify-center text-xl ${
                    avatar === e ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving || !canSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
