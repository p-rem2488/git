"use client";
import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { Bell, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import MentalHealthCard from "@/components/MentalHealthCard";
import ExamTrackerCard from "@/components/ExamTrackerCard";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function Home() {
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState<string>("Student");
  const [points, setPoints] = useState<number>(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("name, avatar_url, wellness_points").eq("id", user.id).single();
      if (data) {
        setName(data.name || "Student");
        setAvatar(data.avatar_url);
        setPoints(data.wellness_points || 0);
      }
    };
    load();
  }, []);

  const logout = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#008080]"></div>
            <span className="text-xl font-bold">MindMitra</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#F4F4F4] px-3 py-1 rounded-full text-sm">
              <span className="font-semibold">{points}</span>
              <span className="opacity-70">Wellness Points</span>
            </div>
            <button className="relative" onClick={() => setDropdownOpen((v) => !v)}>
              <Bell className="h-6 w-6" />
              {dropdownOpen && <NotificationsDropdown onClose={() => setDropdownOpen(false)} />}
            </button>
            <button onClick={logout} className="flex items-center gap-1 text-sm">
              <LogOut className="h-5 w-5" /> Logout
            </button>
            <img src={avatar || "/vercel.svg"} className="h-8 w-8 rounded-full" alt="avatar" />
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <MentalHealthCard onPoints={(p) => setPoints((v) => v + p)} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <ExamTrackerCard onPoints={(p) => setPoints((v) => v + p)} />
        </motion.div>
      </main>
    </div>
  );
}
