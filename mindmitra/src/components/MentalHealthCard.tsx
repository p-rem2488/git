"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import MoodRing, { Mood, getMoodColor } from "@/components/MoodRing";

const SYSTEM_PROMPT = `You are MindMitra, a student mental health assistant. Analyze the user's journal or chat input. Detect mood (Calm, Motivated, Happy, Stressed, Lonely) and provide 2-3 actionable motivational tips. Do not give medical advice.`;

function detectMood(text: string): Mood {
  const t = text.toLowerCase();
  if (t.includes("stressed") || t.includes("overwhelmed") || t.includes("anxious")) return "Stressed";
  if (t.includes("motivated") || t.includes("focus") || t.includes("determined")) return "Motivated";
  if (t.includes("happy") || t.includes("great") || t.includes("good")) return "Happy";
  if (t.includes("lonely") || t.includes("alone")) return "Lonely";
  return "Calm";
}

function containsSOS(text: string) {
  return /\b(i\s*want\s*to\s*die|suicide|kill\s*myself)\b/i.test(text);
}

export default function MentalHealthCard({ onPoints }: { onPoints: (p: number) => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I'm MindMitra. How are you feeling today?" },
  ]);
  const [mood, setMood] = useState<Mood>("Calm");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const placeholder = useMemo(() => "How are you feeling today?", []);

  const send = async () => {
    if (!input.trim()) return;

    // SOS handling
    if (containsSOS(input)) {
      const sosUrl = process.env.NEXT_PUBLIC_SOS_HELP_URL || "https://www.opencounseling.com/suicide-hotlines";
      const msg = `I'm really sorry you're feeling this way. I cannot provide medical advice. You are not alone. Please consider reaching out immediately: ${sosUrl}. If you're in immediate danger, call your local emergency number.`;
      setMessages((m) => [...m, { role: "user", content: input }, { role: "assistant", content: msg }]);
      setInput("");
      // create a notification as an extra nudge
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("notifications").insert({ user_id: user.id, message: "SOS resources shared. Please reach out to a trusted person or hotline." });
      }
      return;
    }

    setLoading(true);
    setMessages((m) => [...m, { role: "user", content: input }]);
    const analyzedMood = detectMood(input);
    setMood(analyzedMood);

    // store journal entry
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("journal_entries").insert({ user_id: user.id, content: input, mood_score: analyzedMood });
      await supabase.from("users").update({ wellness_points: (await getPoints(user.id)) + 5 }).eq("id", user.id);
      onPoints(5);
    }

    // local response (no external API call by default)
    const tipsMap: Record<Mood, string[]> = {
      Calm: ["Keep a short gratitude note.", "Maintain a steady study rhythm.", "Take a mindful walk for 5 minutes."],
      Motivated: ["Break tasks into 25-minute sprints.", "Review one past exam paper.", "Share goals with a friend."],
      Happy: ["Channel energy into a topic you enjoy.", "Teach a concept to someone.", "Keep hydration up."] ,
      Stressed: ["Try a 4-7-8 breathing cycle.", "Write down 3 worries and 3 actions.", "Do a 2-minute stretch."],
      Lonely: ["Send a message to a friend.", "Study in a public space.", "Join a campus group or forum."],
    };
    const tips = tipsMap[analyzedMood].slice(0,3).map((t) => `• ${t}`).join("\n");
    const reply = `I sense your mood as ${analyzedMood}. Here are some tips:\n${tips}`;

    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setInput("");
    setLoading(false);
  };

  async function getPoints(userId: string) {
    const supabase = getSupabase();
    const { data } = await supabase.from("users").select("wellness_points").eq("id", userId).single();
    return data?.wellness_points || 0;
  }

  const startBreathing = async () => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ wellness_points: (await getPoints(user.id)) + 3 }).eq("id", user.id);
      onPoints(3);
      await supabase.from("notifications").insert({ user_id: user.id, message: "You completed a breathing exercise (+3 points)" });
    }
  };

  const startMeditation = async () => {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("users").update({ wellness_points: (await getPoints(user.id)) + 4 }).eq("id", user.id);
      onPoints(4);
      await supabase.from("notifications").insert({ user_id: user.id, message: "You completed a guided meditation (+4 points)" });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">🧠 Mental Health Companion</h2>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <div className="font-semibold">{mood}</div>
            <div className="opacity-70">Current Mood</div>
          </div>
          <MoodRing mood={mood} />
        </div>
      </div>

      <textarea
        placeholder={placeholder}
        className="w-full border rounded-md p-3 h-24 mb-3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex gap-2 mb-4">
        <button onClick={send} disabled={loading} className="bg-[#008080] text-white px-4 py-2 rounded-md">Send</button>
        <button onClick={startBreathing} className="border px-3 py-2 rounded-md">Breathing Exercise</button>
        <button onClick={startMeditation} className="border px-3 py-2 rounded-md">Guided Meditation</button>
        <button onClick={() => setInput("Share one small thing you're grateful for today.")} className="border px-3 py-2 rounded-md">Mindfulness Prompt</button>
      </div>

      <div ref={listRef} className="h-64 overflow-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[80%] p-3 rounded-lg ${m.role === "assistant" ? "bg-[#F4F4F4]" : "bg-[#008080] text-white ml-auto"}`}
          >
            {m.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

