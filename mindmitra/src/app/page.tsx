"use client";
import Link from "next/link";
import { useUser } from "@supabase/auth-helpers-react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabaseClient";

export default function Home() {
  const user = useUser();
  const supabase = createClient();
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-xl">
          <h1 className="text-2xl font-bold mb-4 text-[#1A1A1A]">MindMitra</h1>
          <Auth
            supabaseClient={supabase}
            view="sign_in"
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
            redirectTo="/"
          />
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <Link href="/dashboard" className="bg-[#008080] text-white px-4 py-2 rounded-md">Go to Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
