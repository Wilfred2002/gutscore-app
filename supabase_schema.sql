-- GutScore Database Schema
-- Run this in the Supabase SQL Editor to set up your tables.
-- It is safe to run this multiple times (it will update existing tables).

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- Users Table
-- ==========================================
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  created_at timestamp with time zone default now()
);

-- Safely add columns if they don't exist (in case table already exists)
do $$ 
begin
  alter table public.users add column if not exists name text;
  alter table public.users add column if not exists has_ibs boolean default false;
  alter table public.users add column if not exists dietary_restrictions text[] default '{}';
  alter table public.users add column if not exists age integer;
  alter table public.users add column if not exists is_pro boolean default false;
  alter table public.users add column if not exists streak integer default 0;
  alter table public.users add column if not exists updated_at timestamp with time zone default now();
exception
  when others then null;
end $$;

-- Enable RLS on Users
alter table public.users enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own data" on public.users;
drop policy if exists "Users can update own data" on public.users;
drop policy if exists "Users can insert own data" on public.users;

-- Re-create policies
create policy "Users can view own data" on public.users for select using (auth.uid() = id);
create policy "Users can update own data" on public.users for update using (auth.uid() = id);
create policy "Users can insert own data" on public.users for insert with check (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, created_at)
  values (new.id, new.email, now())
  on conflict (id) do nothing; -- Prevent error if user exists
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==========================================
-- Meals Table
-- ==========================================
create table if not exists public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  photo_url text,
  foods jsonb default '[]',
  gut_scores jsonb default '{"fodmap": 0, "fermentation": 0, "fiber_diversity": 0, "probiotic": 0}',
  overall_score integer default 0,
  notes text,
  is_sample boolean default false,
  logged_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS on Meals
alter table public.meals enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own meals" on public.meals;
drop policy if exists "Users can insert own meals" on public.meals;
drop policy if exists "Users can update own meals" on public.meals;
drop policy if exists "Users can delete own meals" on public.meals;

-- Re-create policies
create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can update own meals" on public.meals for update using (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- ==========================================
-- Symptoms Table
-- ==========================================
create table if not exists public.symptoms (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  meal_id uuid references public.meals(id) on delete set null,
  bloating integer default 0,
  cramping integer default 0,
  energy integer default 0,
  types text[] default '{}',
  meal_association text,
  associated_meal_id uuid references public.meals(id),
  notes text,
  logged_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Enable RLS on Symptoms
alter table public.symptoms enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own symptoms" on public.symptoms;
drop policy if exists "Users can insert own symptoms" on public.symptoms;
drop policy if exists "Users can update own symptoms" on public.symptoms;
drop policy if exists "Users can delete own symptoms" on public.symptoms;

-- Re-create policies
create policy "Users can view own symptoms" on public.symptoms for select using (auth.uid() = user_id);
create policy "Users can insert own symptoms" on public.symptoms for insert with check (auth.uid() = user_id);
create policy "Users can update own symptoms" on public.symptoms for update using (auth.uid() = user_id);
create policy "Users can delete own symptoms" on public.symptoms for delete using (auth.uid() = user_id);

-- ==========================================
-- Triggers Table
-- ==========================================
create table if not exists public.triggers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  confidence integer default 0,
  status text check (status in ('avoid', 'limit', 'monitor')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, name)
);

-- Enable RLS on Triggers
alter table public.triggers enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own triggers" on public.triggers;
drop policy if exists "Users can insert own triggers" on public.triggers;
drop policy if exists "Users can update own triggers" on public.triggers;
drop policy if exists "Users can delete own triggers" on public.triggers;

-- Re-create policies
create policy "Users can view own triggers" on public.triggers for select using (auth.uid() = user_id);
create policy "Users can insert own triggers" on public.triggers for insert with check (auth.uid() = user_id);
create policy "Users can update own triggers" on public.triggers for update using (auth.uid() = user_id);
create policy "Users can delete own triggers" on public.triggers for delete using (auth.uid() = user_id);

-- ==========================================
-- Weekly Scores Table
-- ==========================================
create table if not exists public.weekly_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  week_start date not null,
  avg_fodmap integer default 0,
  avg_fermentation integer default 0,
  created_at timestamp with time zone default now(),
  unique(user_id, week_start)
);

-- Enable RLS on Weekly Scores
alter table public.weekly_scores enable row level security;

-- Drop existing policies
drop policy if exists "Users can view own weekly scores" on public.weekly_scores;
drop policy if exists "Users can insert own weekly scores" on public.weekly_scores;
drop policy if exists "Users can update own weekly scores" on public.weekly_scores;

-- Re-create policies
create policy "Users can view own weekly scores" on public.weekly_scores for select using (auth.uid() = user_id);
create policy "Users can insert own weekly scores" on public.weekly_scores for insert with check (auth.uid() = user_id);
create policy "Users can update own weekly scores" on public.weekly_scores for update using (auth.uid() = user_id);

-- ==========================================
-- Phase 5: Personalization Columns
-- ==========================================
do $$ 
begin
  alter table public.users add column if not exists primary_goal text;
  alter table public.users add column if not exists top_symptom text;
  alter table public.users add column if not exists scan_count integer default 0;
exception
  when others then null;
end $$;

do $$ 
begin
  alter table public.meals add column if not exists personalized_output jsonb;
exception
  when others then null;
end $$;
