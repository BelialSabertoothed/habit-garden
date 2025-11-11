import { useState } from "react";
import { api } from "../lib/api";
import { setAccessToken } from "../lib/authToken";
import { useQueryClient } from "@tanstack/react-query";

export default function EmailRegister() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setErr(null); setLoading(true);
        try {
          const { accessToken } = await api.post<{ accessToken: string }>("auth/register", {
            json: { email, password, nickname },
          });
          setAccessToken(accessToken);
          await qc.invalidateQueries({ queryKey: ["me"] });
        } catch (e: any) {
          setErr(e?.message ?? "Registration failed");
        } finally { setLoading(false); }
      }}
      className="space-y-2"
    >
      <input className="border rounded px-3 py-2 w-full" placeholder="Nickname" value={nickname} onChange={(e)=>setNickname(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" placeholder="E-mail" value={email} onChange={(e)=>setEmail(e.target.value)} />
      <input className="border rounded px-3 py-2 w-full" placeholder="Password (min 8)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
      {err && <div className="text-red-600 text-sm">{err}</div>}
      <button disabled={loading} className="border rounded px-3 py-2 w-full">
        {loading ? "Creating…" : "Create account"}
      </button>
    </form>
  );
}
