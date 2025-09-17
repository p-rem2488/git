"use client";
import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

type Exam = {
  id: string;
  subject: string;
  date: string;
  max_marks: number | null;
  target_marks: number | null;
  obtained_marks: number | null;
};

function countdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Today";
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  return `${d}d ${h}h`;
}

function progress(obtained: number | null, target: number | null) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round(((obtained || 0) / target) * 100)));
}

export default function ExamTrackerCard({ onPoints }: { onPoints: (p: number) => void }) {
  const [open, setOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [form, setForm] = useState({ subject: "", date: "", max_marks: "", target_marks: "" });

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("exams")
        .select("id, subject, date, max_marks, target_marks, obtained_marks")
        .eq("user_id", user.id)
        .order("date", { ascending: true });
      setExams(data || []);
    };
    load();
  }, []);

  const addExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload = {
      user_id: user.id,
      subject: form.subject,
      date: form.date,
      max_marks: form.max_marks ? Number(form.max_marks) : null,
      target_marks: form.target_marks ? Number(form.target_marks) : null,
    };
    const { data, error } = await supabase.from("exams").insert(payload).select("id, subject, date, max_marks, target_marks, obtained_marks").single();
    if (!error && data) {
      setExams((l) => [...l, data]);
      setOpen(false);
      setForm({ subject: "", date: "", max_marks: "", target_marks: "" });
      await supabase.from("notifications").insert({ user_id: user.id, message: `Exam added: ${data.subject}` });
      const { data: u } = await supabase.from("users").select("wellness_points").eq("id", user.id).single();
      await supabase.from("users").update({ wellness_points: (u?.wellness_points || 0) + 2 }).eq("id", user.id);
      onPoints(2);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">📚 Exam Tracker</h2>
        <button onClick={() => setOpen(true)} className="bg-[#008080] text-white px-4 py-2 rounded-md">Add Exam</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg p-4 shadow-xl">
            <h3 className="font-semibold mb-3">Add Exam</h3>
            <form onSubmit={addExam} className="grid gap-2">
              <input className="border rounded-md p-2" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              <input className="border rounded-md p-2" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded-md p-2" placeholder="Max Marks" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} />
                <input className="border rounded-md p-2" placeholder="Target Marks" value={form.target_marks} onChange={(e) => setForm({ ...form, target_marks: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => setOpen(false)} className="border px-4 py-2 rounded-md">Cancel</button>
                <button className="bg-[#008080] text-white px-4 py-2 rounded-md">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {exams.length === 0 && <p className="text-sm opacity-70">No exams yet</p>}
        {exams.map((e) => {
          const pct = progress(e.obtained_marks, e.target_marks);
          return (
            <div key={e.id} className="border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{e.subject}</div>
                  <div className="text-sm opacity-70">{new Date(e.date).toLocaleDateString()} • {countdown(e.date)}</div>
                </div>
                <div className="text-sm">Target: {e.target_marks ?? "-"}</div>
              </div>
              <div className="mt-2 h-2 bg-[#F4F4F4] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full bg-[#008080]"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

