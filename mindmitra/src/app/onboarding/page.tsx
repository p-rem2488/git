"use client";
import { useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [branchYear, setBranchYear] = useState("");
  const [sosContact, setSosContact] = useState("");
  const [loading, setLoading] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").upsert({
      id: user.id,
      email: user.email,
      name,
      branch_year: branchYear,
      sos_contact: sosContact || null,
    });
    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#F4F4F4]">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg">
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Welcome to MindMitra</h1>
        <form onSubmit={saveProfile} className="space-y-4">
          <input className="w-full border rounded-md p-2" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded-md p-2" placeholder="Branch / Year" value={branchYear} onChange={(e) => setBranchYear(e.target.value)} />
          <input className="w-full border rounded-md p-2" placeholder="SOS Contact (optional)" value={sosContact} onChange={(e) => setSosContact(e.target.value)} />
          <button className="w-full bg-[#008080] text-white py-2 rounded-md" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

