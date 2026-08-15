-- ============================================================
-- HABIT TRACKER — SUPABASE SCHEMA
-- Run this in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

-- 1. PROFILES (mirrors auth.users, adds a role column)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. HABITS
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  position int not null default 0,
  month text not null, -- format 'YYYY-MM'
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists habits_user_month_idx on public.habits(user_id, month);

-- 3. DAILY LOGS
create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  status text not null default 'done' check (status in ('done','partial','not_done')),
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, log_date);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.daily_logs enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- HABITS policies (owner-only, admin read-only)
create policy "Users manage their own habits"
  on public.habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can read all habits"
  on public.habits for select
  using (public.is_admin());

-- DAILY_LOGS policies (owner-only, admin read-only)
create policy "Users manage their own logs"
  on public.daily_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can read all logs"
  on public.daily_logs for select
  using (public.is_admin());

-- ============================================================
-- MAKING YOURSELF ADMIN
-- After you sign up once through the normal /signup page, run:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
--
-- Only do this for your own account, in the SQL editor. There is
-- no UI path that lets a regular user grant themselves admin.
-- ============================================================
