MindMitra — Student Mental Health Companion + Exam Tracker

Stack: Next.js App Router, Tailwind CSS, Supabase, Framer Motion.

Quick start

1) Create a Supabase project and enable Auth providers: Email and Google.
2) Create tables by running SQL from `src/lib/db.sql` in Supabase SQL editor.
3) Copy `.env.local.example` to `.env.local` and set values:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4) Install and run:

```
npm install
npm run dev
```

Key features

- Authentication: Email + Google via Supabase
- Dashboard with two cards: Mental Health Companion and Exam Tracker
- Journal with mood analysis, animated Mood Ring, wellness points
- Exam Tracker with add form, countdown, animated progress bar
- SOS safety: if journal contains "I want to die" (or similar), an emergency modal appears

Notes

- Wellness points increment when journaling or adding exams. Adjust logic in `src/app/dashboard/page.tsx`.
