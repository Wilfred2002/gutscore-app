-- GutScore Database Schema
-- This migration creates all the necessary tables for the GutScore app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  has_ibs BOOLEAN DEFAULT false,
  dietary_restrictions TEXT[] DEFAULT '{}',
  age INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT,
  foods JSONB DEFAULT '[]',
  gut_scores JSONB DEFAULT '{"fodmap": 0, "fermentation": 0, "fiber_diversity": 0, "probiotic": 0}',
  overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  notes TEXT,
  is_sample BOOLEAN DEFAULT false,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on meals table
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Users can only access their own meals
CREATE POLICY "Users can view own meals" ON public.meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals" ON public.meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals" ON public.meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals" ON public.meals
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON public.meals(user_id);
CREATE INDEX IF NOT EXISTS meals_logged_at_idx ON public.meals(logged_at DESC);

-- Symptoms table
CREATE TABLE IF NOT EXISTS public.symptoms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  bloating INTEGER DEFAULT 0 CHECK (bloating >= 0 AND bloating <= 10),
  cramping INTEGER DEFAULT 0 CHECK (cramping >= 0 AND cramping <= 10),
  energy INTEGER DEFAULT 0 CHECK (energy >= 0 AND energy <= 10),
  notes TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on symptoms table
ALTER TABLE public.symptoms ENABLE ROW LEVEL SECURITY;

-- Users can only access their own symptoms
CREATE POLICY "Users can view own symptoms" ON public.symptoms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own symptoms" ON public.symptoms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own symptoms" ON public.symptoms
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own symptoms" ON public.symptoms
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS symptoms_user_id_idx ON public.symptoms(user_id);
CREATE INDEX IF NOT EXISTS symptoms_logged_at_idx ON public.symptoms(logged_at DESC);
CREATE INDEX IF NOT EXISTS symptoms_meal_id_idx ON public.symptoms(meal_id);

-- Triggers table (detected food triggers based on symptom correlation)
CREATE TABLE IF NOT EXISTS public.triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  confidence_score INTEGER DEFAULT 0 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  avg_bloating DECIMAL(3, 1),
  avg_cramping DECIMAL(3, 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_name)
);

-- Enable Row Level Security on triggers table
ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own triggers
CREATE POLICY "Users can view own triggers" ON public.triggers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triggers" ON public.triggers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triggers" ON public.triggers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own triggers" ON public.triggers
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS triggers_user_id_idx ON public.triggers(user_id);
CREATE INDEX IF NOT EXISTS triggers_confidence_idx ON public.triggers(confidence_score DESC);

-- Weekly Scores table (aggregated gut health metrics per week)
CREATE TABLE IF NOT EXISTS public.weekly_scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  avg_fodmap INTEGER DEFAULT 0 CHECK (avg_fodmap >= 0 AND avg_fodmap <= 100),
  avg_fermentation INTEGER DEFAULT 0 CHECK (avg_fermentation >= 0 AND avg_fermentation <= 100),
  avg_fiber_diversity INTEGER DEFAULT 0 CHECK (avg_fiber_diversity >= 0 AND avg_fiber_diversity <= 100),
  avg_probiotic INTEGER DEFAULT 0 CHECK (avg_probiotic >= 0 AND avg_probiotic <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Enable Row Level Security on weekly_scores table
ALTER TABLE public.weekly_scores ENABLE ROW LEVEL SECURITY;

-- Users can only access their own weekly scores
CREATE POLICY "Users can view own weekly scores" ON public.weekly_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly scores" ON public.weekly_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly scores" ON public.weekly_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS weekly_scores_user_id_idx ON public.weekly_scores(user_id);
CREATE INDEX IF NOT EXISTS weekly_scores_week_start_idx ON public.weekly_scores(week_start DESC);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to auto-update updated_at on triggers table
CREATE TRIGGER update_triggers_updated_at
  BEFORE UPDATE ON public.triggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
