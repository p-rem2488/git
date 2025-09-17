-- MindMitra Database Schema
create table if not exists public.users (
  id uuid primary key,
  name text,
  email text unique,
  avatar_url text,
  branch_year text,
  sos_contact text,
  wellness_points int default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  content text not null,
  mood_score text check (mood_score in ('Calm','Motivated','Happy','Stressed','Lonely')),
  created_at timestamp with time zone default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  subject text not null,
  date date not null,
  max_marks int,
  target_marks int,
  obtained_marks int,
  created_at timestamp with time zone default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  read_status boolean default false,
  created_at timestamp with time zone default now()
);

-- Policies (basic RLS)
alter table public.users enable row level security;
alter table public.journal_entries enable row level security;
alter table public.exams enable row level security;
alter table public.notifications enable row level security;

create policy "Users can view their profile" on public.users for select using (auth.uid() = id);
create policy "Users can upsert their profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update their profile" on public.users for update using (auth.uid() = id);

create policy "User reads own journals" on public.journal_entries for select using (auth.uid() = user_id);
create policy "User writes own journals" on public.journal_entries for insert with check (auth.uid() = user_id);

create policy "User reads own exams" on public.exams for select using (auth.uid() = user_id);
create policy "User writes own exams" on public.exams for insert with check (auth.uid() = user_id);
create policy "User updates own exams" on public.exams for update using (auth.uid() = user_id);

create policy "User reads own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "User inserts own notifications" on public.notifications for insert with check (auth.uid() = user_id);
