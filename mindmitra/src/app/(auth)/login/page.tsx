"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    setLoading(false);
    if (error) setError(error.message);
  };

  const signUp = async () => {
    setLoading(true);
    setError(null);
    const supabase = getSupabase();
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else router.push("/onboarding");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#F4F4F4]">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">MindMitra</h1>
        <form onSubmit={signInWithEmail} className="space-y-3">
          <input
            className="w-full border rounded-md p-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-md p-2"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} className="w-full bg-[#008080] text-white py-2 rounded-md">
            {loading ? "Loading..." : "Login"}
          </button>
        </form>
        <div className="mt-4 grid gap-2">
          <button onClick={signInWithGoogle} className="w-full border py-2 rounded-md">
            Continue with Google
          </button>
          <button onClick={signUp} className="w-full text-sm text-[#008080]">
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}

