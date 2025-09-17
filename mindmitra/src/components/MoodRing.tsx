"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

export type Mood = "Calm" | "Motivated" | "Happy" | "Stressed" | "Lonely";

const moodToColor: Record<Mood, string> = {
  Calm: "#0077FF",
  Motivated: "#00C851",
  Happy: "#FFDD00",
  Stressed: "#FF3D00",
  Lonely: "#9B59B6",
};

export default function MoodRing({ mood, size = 120 }: { mood: Mood; size?: number }) {
  const controls = useAnimation();
  useEffect(() => {
    const color = moodToColor[mood];
    controls.start({ stroke: color, transition: { duration: 0.5 } });
  }, [mood, controls]);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E6F0FF" strokeWidth="10" fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#0077FF"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: circumference, strokeDashoffset: circumference * 0.25 }}
        animate={controls}
      />
    </svg>
  );
}

export function getMoodColor(mood: Mood) {
  return moodToColor[mood];
}

