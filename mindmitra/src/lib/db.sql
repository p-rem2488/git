-- Users table
create table if not exists users (
  id uuid primary key,
  name text,
  email text unique,
  avatar_url text,
  wellness_points integer default 0,
  created_at timestamp with time zone default now()
);

-- Journal Entries
create table if not exists journal_entries (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  content text,
  mood_score integer,
  created_at timestamp with time zone default now()
);

-- Exams
create table if not exists exams (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  subject text,
  date date,
  max_marks integer,
  target_marks integer,
  obtained_marks integer,
  created_at timestamp with time zone default now()
);

-- Notifications
create table if not exists notifications (
  id bigserial primary key,
  user_id uuid references users(id) on delete cascade,
  message text,
  read_status boolean default false,
  created_at timestamp with time zone default now()
);

-- Function to increment wellness points
create or replace function increment_wellness(user_id_input uuid, delta int)
returns void as $$
begin
  update users set wellness_points = coalesce(wellness_points,0) + delta where id = user_id_input;
end;
$$ language plpgsql;

