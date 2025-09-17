"use client";
import { getSupabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

export default function NotificationsDropdown({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ id: string; message: string; created_at: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("notifications")
        .select("id, message, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setMessages(data || []);
    };
    load();
  }, []);

  return (
    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Notifications</h3>
        <button className="text-sm opacity-70" onClick={onClose}>Close</button>
      </div>
      <div className="space-y-2 max-h-64 overflow-auto">
        {messages.length === 0 && <p className="text-sm opacity-70">No notifications</p>}
        {messages.map((n) => (
          <div key={n.id} className="text-sm bg-[#F4F4F4] p-2 rounded-md">
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}

