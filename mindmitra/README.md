MindMitra — student-friendly mental health companion + exam tracker built with Next.js, Tailwind CSS, Supabase, and Framer Motion.

### Quickstart
1) Copy `.env.local.example` to `.env.local` and fill values:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - OPENAI_API_KEY (optional; not required for local rule-based tips)
   - NEXT_PUBLIC_SOS_HELP_URL (optional; fallback included)
2) In Supabase SQL editor, run `src/lib/db.sql`.
3) Start dev server:
```bash
npm run dev
```

Open http://localhost:3000. First visit redirects to `/login`.

### Features
- Authentication: Email + Google via Supabase Auth
- Dashboard: Mental Health Companion and Exam Tracker cards
- Journal with mood detection and animated Mood Ring
- AI-style tips (local rules) and mandatory SOS trigger for phrases like “I want to die”
- Exam modal, countdown, animated progress bar
- Notifications dropdown and Wellness Points gamification

### Safety: SOS Trigger
- If input contains phrases such as "I want to die", "suicide", or "kill myself":
  - The app responds with supportive language and a help link from `NEXT_PUBLIC_SOS_HELP_URL`.
  - It creates a notification for the user with resource info.
  - No medical advice is given.
