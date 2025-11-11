import { useState } from "react";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/authToken";
import { useQueryClient } from "@tanstack/react-query";

export default function EmailLogin() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    } catch (e: any) {
      setErr(e?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Heslo"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button disabled={loading} className="border rounded px-3 py-2 w-full">
        {loading ? "Přihlašuji…" : "Přihlásit"}
      </button>
    </form>
  );
}
