-- GutScore Extended Schema (v2)
-- Adds analytics, AI logging, engagement, and content tables

-- ============================================
-- NORMALIZED FOOD DATA
-- ============================================

-- Canonical food reference (FODMAP database)
CREATE TABLE IF NOT EXISTS public.food_reference (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fodmap_level TEXT CHECK (fodmap_level IN ('low', 'moderate', 'high', 'unknown')),
  category TEXT, -- e.g., 'vegetable', 'protein', 'grain'
  notes TEXT,
  source TEXT, -- e.g., 'Monash University'
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_reference_name_idx ON public.food_reference(name);
CREATE INDEX IF NOT EXISTS food_reference_fodmap_idx ON public.food_reference(fodmap_level);

-- User-specific parsed food items (from AI)
CREATE TABLE IF NOT EXISTS public.food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  fodmap_category TEXT,
  category TEXT,
  canonical_food_id UUID REFERENCES public.food_reference(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS food_items_name_idx ON public.food_items(name);
CREATE INDEX IF NOT EXISTS food_items_canonical_idx ON public.food_items(canonical_food_id);

-- Many-to-many: meals <-> food_items
CREATE TABLE IF NOT EXISTS public.meal_food_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT, -- e.g., 'g', 'oz', 'cup', 'piece'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_id, food_item_id)
);

-- Enable RLS
ALTER TABLE public.food_reference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_food_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies: food_reference is public read
CREATE POLICY "Anyone can view food reference" ON public.food_reference
  FOR SELECT USING (true);

-- food_items and meal_food_items follow meal ownership
CREATE POLICY "Users can view food items for their meals" ON public.food_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_food_items mfi
      JOIN public.meals m ON m.id = mfi.meal_id
      WHERE mfi.food_item_id = food_items.id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert food items" ON public.food_items
  FOR INSERT WITH CHECK (true); -- Anyone can add food items

CREATE POLICY "Users can view their meal food items" ON public.meal_food_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_food_items.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their meal food items" ON public.meal_food_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_food_items.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their meal food items" ON public.meal_food_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_food_items.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS meal_food_items_meal_idx ON public.meal_food_items(meal_id);
CREATE INDEX IF NOT EXISTS meal_food_items_food_idx ON public.meal_food_items(food_item_id);

-- ============================================
-- MEAL-SYMPTOM RELATIONSHIPS
-- ============================================

-- Many-to-many: meals <-> symptoms with context
CREATE TABLE IF NOT EXISTS public.meal_symptoms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  symptom_id UUID REFERENCES public.symptoms(id) ON DELETE CASCADE NOT NULL,
  severity INTEGER CHECK (severity >= 0 AND severity <= 10),
  onset_minutes INTEGER, -- Time after meal when symptom appeared
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_id, symptom_id)
);

ALTER TABLE public.meal_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meal symptoms" ON public.meal_symptoms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_symptoms.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their meal symptoms" ON public.meal_symptoms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_symptoms.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their meal symptoms" ON public.meal_symptoms
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_symptoms.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS meal_symptoms_meal_idx ON public.meal_symptoms(meal_id);
CREATE INDEX IF NOT EXISTS meal_symptoms_symptom_idx ON public.meal_symptoms(symptom_id);

-- ============================================
-- MEAL-TRIGGER RELATIONSHIPS
-- ============================================

-- Many-to-many: meals <-> triggers (AI-detected correlations)
CREATE TABLE IF NOT EXISTS public.meal_triggers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  trigger_id UUID REFERENCES public.triggers(id) ON DELETE CASCADE NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  detected_by TEXT CHECK (detected_by IN ('ai', 'manual', 'correlation')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_id, trigger_id)
);

ALTER TABLE public.meal_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their meal triggers" ON public.meal_triggers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_triggers.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their meal triggers" ON public.meal_triggers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_triggers.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their meal triggers" ON public.meal_triggers
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = meal_triggers.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS meal_triggers_meal_idx ON public.meal_triggers(meal_id);
CREATE INDEX IF NOT EXISTS meal_triggers_trigger_idx ON public.meal_triggers(trigger_id);

-- ============================================
-- USER PROFILES & SETTINGS
-- ============================================

-- Extended user profile (separate from auth)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  age INTEGER,
  sex_at_birth TEXT CHECK (sex_at_birth IN ('male', 'female', 'other', 'prefer_not_to_say')),
  country TEXT,
  diagnosis_type TEXT, -- e.g., 'IBS-D', 'IBS-C', 'SIBO', 'none'
  severity_baseline INTEGER CHECK (severity_baseline >= 0 AND severity_baseline <= 10),
  time_zone TEXT,
  preferred_units TEXT CHECK (preferred_units IN ('metric', 'imperial')),
  tracking_goals TEXT[], -- e.g., ['reduce_bloating', 'identify_triggers', 'improve_energy']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User settings (feature flags, privacy)
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  notifications_enabled BOOLEAN DEFAULT true,
  share_data_for_research BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'en',
  beta_features JSONB DEFAULT '{}', -- Feature flags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- AI LOGGING & EXPLANATIONS
-- ============================================

-- Log all AI API calls for debugging/quality
CREATE TABLE IF NOT EXISTS public.ai_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('vision', 'llm', 'embedding', 'classification')),
  model_version TEXT,
  latency_ms INTEGER,
  success BOOLEAN DEFAULT false,
  error_code TEXT,
  error_message TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_events ENABLE ROW LEVEL SECURITY;

-- Only users can see their own AI events
CREATE POLICY "Users can view own AI events" ON public.ai_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS ai_events_user_idx ON public.ai_events(user_id);
CREATE INDEX IF NOT EXISTS ai_events_type_idx ON public.ai_events(type);
CREATE INDEX IF NOT EXISTS ai_events_created_idx ON public.ai_events(created_at DESC);

-- Store user-visible AI explanations
CREATE TABLE IF NOT EXISTS public.ai_explanations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  explanation_md TEXT, -- Markdown explanation
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view explanations for their meals" ON public.ai_explanations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meals WHERE meals.id = ai_explanations.meal_id AND meals.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS ai_explanations_meal_idx ON public.ai_explanations(meal_id);

-- ============================================
-- ANALYTICS & ENGAGEMENT
-- ============================================

-- Fine-grained usage events for product analytics
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- e.g., 'app_opened', 'meal_scanned', 'symptom_logged', 'report_shared'
  metadata JSONB DEFAULT '{}', -- Flexible event properties
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS events_user_idx ON public.events(user_id);
CREATE INDEX IF NOT EXISTS events_type_idx ON public.events(event_type);
CREATE INDEX IF NOT EXISTS events_created_idx ON public.events(created_at DESC);

-- Tracking streaks for gamification
CREATE TABLE IF NOT EXISTS public.streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('meals', 'symptoms', 'both')),
  start_date DATE NOT NULL,
  end_date DATE,
  longest_streak_days INTEGER DEFAULT 0,
  current_streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks" ON public.streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks" ON public.streaks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks" ON public.streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON public.streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder_scan', 'reminder_symptom', 'weekly_report', 'trigger_alert', 'streak_milestone')),
  title TEXT,
  body TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  channel TEXT CHECK (channel IN ('push', 'email', 'in_app')),
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_scheduled_idx ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON public.notifications(status);

-- ============================================
-- CONTENT & EDUCATION
-- ============================================

CREATE TABLE IF NOT EXISTS public.education_articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  body_md TEXT, -- Markdown content
  category TEXT, -- e.g., 'IBS', 'low_fodmap', 'dining_out', 'recipes'
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Public read access for published articles
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles" ON public.education_articles
  FOR SELECT USING (published = true);

CREATE INDEX IF NOT EXISTS education_articles_slug_idx ON public.education_articles(slug);
CREATE INDEX IF NOT EXISTS education_articles_category_idx ON public.education_articles(category);

CREATE TRIGGER update_education_articles_updated_at
  BEFORE UPDATE ON public.education_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create user_profiles and user_settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_extended()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user_profiles entry
  INSERT INTO public.user_profiles (id, created_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Create user_settings entry
  INSERT INTO public.user_settings (id, created_at)
  VALUES (NEW.id, NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the trigger to also create profiles and settings
DROP TRIGGER IF EXISTS on_auth_user_created_extended ON auth.users;
CREATE TRIGGER on_auth_user_created_extended
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_extended();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
