"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";

type Mood = "Calm" | "Motivated" | "Happy" | "Stressed" | "Lonely";

type Exam = {
  id: number;
  user_id: string;
  subject: string;
  date: string;
  max_marks: number | null;
  target_marks: number | null;
  obtained_marks?: number | null;
  created_at?: string;
};

type NotificationRow = {
  id: number;
  user_id: string;
  message: string;
  read_status: boolean | null;
  created_at: string;
};

const moodColor: Record<Mood, string> = {
  Calm: "#0077FF",
  Motivated: "#00C851",
  Happy: "#FFDD00",
  Stressed: "#FF3D00",
  Lonely: "#9B59B6",
};

function getMoodFromText(text: string): { mood: Mood; score: number } {
  const t = text.toLowerCase();
  if (/(i want to die|suicide|kill myself)/.test(t)) {
    return { mood: "Stressed", score: 5 };
  }
  if (/calm|relax|peace/.test(t)) return { mood: "Calm", score: 80 };
  if (/motivat|focus|study/.test(t)) return { mood: "Motivated", score: 85 };
  if (/happy|great|good/.test(t)) return { mood: "Happy", score: 90 };
  if (/lonely|alone|isolated/.test(t)) return { mood: "Lonely", score: 40 };
  if (/stress|anx|overwhelmed|tired/.test(t)) return { mood: "Stressed", score: 35 };
  return { mood: "Calm", score: 75 };
}

function tipsForMood(mood: Mood): string[] {
  switch (mood) {
    case "Calm":
      return ["Keep a steady rhythm: short stretch + water break.", "Plan two small wins for today."]; 
    case "Motivated":
      return ["Use a 25/5 Pomodoro for your top subject.", "Write one sentence goal for this session."];
    case "Happy":
      return ["Share a kind note with a friend.", "Channel that energy into 30 focused minutes."];
    case "Stressed":
      return ["Try 4-7-8 breathing for 2 minutes.", "Break tasks into 10‑minute micro-goals."];
    case "Lonely":
      return ["Message a classmate to co-study.", "Step outside for a 3‑minute walk."];
  }
}

function daysUntil(dateStr: string) {
  const days = differenceInDays(new Date(dateStr), new Date());
  return days;
}

function ProgressBar({ obtained = 0, target = 100 }: { obtained: number; target: number }) {
  const pct = Math.min(100, Math.round((obtained / target) * 100));
  return (
    <div className="w-full h-3 bg-gray-200 rounded">
      <motion.div
        className="h-3 rounded bg-[#008080]"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ type: "spring", stiffness: 120 }}
      />
    </div>
  );
}

export default function Dashboard() {
  const user = useUser();
  const supabase = createClient();
  const [journal, setJournal] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; content: string }[]>([]);
  const [latestMood, setLatestMood] = useState<Mood>("Calm");
  const [wellness, setWellness] = useState<number>(0);
  const [exams, setExams] = useState<Exam[]>([]);
  const [showSOS, setShowSOS] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const ringColor = moodColor[latestMood];

  useEffect(() => {
    if (!user) return;
    supabase.from("exams").select("*").order("date", { ascending: true }).then(({ data }) => setExams((data || []) as Exam[]));
    supabase.from("users").select("wellness_points").eq("id", user.id).single().then(({ data }) => setWellness(data?.wellness_points || 0));
    supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setNotifications((data || []) as NotificationRow[]));
  }, [user, supabase]);

  const handleJournalSubmit = async () => {
    if (!user) return;
    const { mood, score } = getMoodFromText(journal);
    setLatestMood(mood);
    const botTips = tipsForMood(mood).join("\n• ");
    setMessages((m) => [...m, { role: "user", content: journal }, { role: "bot", content: `Mood: ${mood}\nTips:\n• ${botTips}` }]);

    if (/(i want to die|suicide|kill myself)/i.test(journal)) {
      setShowSOS(true);
    }

    try {
      await supabase.rpc("increment_wellness", { user_id_input: user.id, delta: 5 });
    } catch (e) {
      await supabase.from("users").update({ wellness_points: (wellness || 0) + 5 }).eq("id", user.id);
    }
    setWellness((w) => w + 5);
    setJournal("");
  };

  const addExam = async (form: FormData) => {
    if (!user) return;
    const subject = String(form.get("subject"));
    const date = String(form.get("date"));
    const max_marks = Number(form.get("max"));
    const target_marks = Number(form.get("target"));
    const { data } = await supabase
      .from("exams")
      .insert({ user_id: user.id, subject, date, max_marks, target_marks })
      .select();
    if (data) setExams((e) => [...e, ...(data as Exam[])]);
    await supabase.from("notifications").insert({ user_id: user.id, message: `Added exam: ${subject}` });
    setWellness((w) => w + 3);
  };

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#008080] grid place-items-center text-white font-bold">MM</div>
          <h1 className="text-xl md:text-2xl font-bold">MindMitra</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm"><span className="font-semibold">Wellness:</span> {wellness}</div>
          <div className="relative">
            <button onClick={() => setNotifOpen((v) => !v)} className="relative">🔔</button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg max-h-72 overflow-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-3 text-sm border-b last:border-0">{n.message}</div>
                  ))
                )}
              </div>
            )}
          </div>
          <button onClick={() => createClient().auth.signOut()} className="text-[#008080]">Logout</button>
        </div>
      </header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">
        {/* Mental Health Companion */}
        <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">🧠 Mental Health Companion</h2>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <motion.div className="w-20 h-20 rounded-full border-4" style={{ borderColor: ringColor }} animate={{ boxShadow: `0 0 0 6px ${ringColor}33` }} />
            <div>
              <div className="text-sm text-gray-600">Current Mood</div>
              <div className="text-xl font-semibold">{latestMood}</div>
            </div>
          </div>
          <textarea value={journal} onChange={(e) => setJournal(e.target.value)} placeholder="How are you feeling today?" className="w-full border rounded-md p-3 mb-3" rows={4} />
          <div className="flex gap-3 mb-4">
            <button onClick={handleJournalSubmit} className="bg-[#008080] text-white px-4 py-2 rounded-md">Save & Analyze</button>
            <button onClick={() => setJournal("Try a 2‑minute breathing exercise: inhale 4, hold 7, exhale 8.")} className="px-4 py-2 rounded-md border">Breathing Exercise</button>
            <button onClick={() => setJournal("Guided meditation: close eyes, relax shoulders, follow your breath for 1 minute.")} className="px-4 py-2 rounded-md border">Guided Meditation</button>
          </div>
          <div className="space-y-2 max-h-60 overflow-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg ${m.role === "user" ? "bg-[#008080] text-white" : "bg-gray-100"}`}>{m.content}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Exam Tracker */}
        <motion.section initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">📚 Exam Tracker</h2>
          </div>
          <form action={async (formData) => addExam(formData)} className="grid grid-cols-2 gap-3 mb-4">
            <input name="subject" placeholder="Subject" className="border rounded px-3 py-2 col-span-2" required />
            <input name="date" type="date" className="border rounded px-3 py-2" required />
            <input name="max" type="number" placeholder="Max Marks" className="border rounded px-3 py-2" required />
            <input name="target" type="number" placeholder="Target Marks" className="border rounded px-3 py-2" required />
            <button className="col-span-2 bg-[#008080] text-white px-4 py-2 rounded-md">Add Exam</button>
          </form>
          <div className="space-y-3">
            {exams.map((e) => (
              <div key={e.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{e.subject}</div>
                  <div className="text-sm text-gray-600">{format(new Date(e.date), "MMM d, yyyy")} · {daysUntil(e.date)} days</div>
                </div>
                <div className="mt-2">
                  <ProgressBar obtained={e.obtained_marks || 0} target={e.target_marks || 100} />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>

      {showSOS && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-2">Immediate Support</h3>
            <p className="mb-4">You matter. If you are in danger or thinking about self-harm, please contact local emergency services or a trusted adult now.</p>
            <ul className="text-sm list-disc pl-5 mb-4 space-y-1">
              <li>Call your regional emergency number (e.g., 112/911).</li>
              <li>Reach out to a friend, family member, or counselor.</li>
              <li>Use your SOS contact in profile if configured.</li>
            </ul>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSOS(false)} className="px-4 py-2 border rounded-md">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

