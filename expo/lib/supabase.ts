import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client if credentials are missing (for development without Supabase)
const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Using mock mode. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    // Return a valid client with placeholder URL to avoid crashes
    // Note: Auth operations will fail, but app will still load
    return createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const supabase = createSupabaseClient();

// Database types (based on your Supabase schema)
export interface User {
  id: string;
  email: string;
  name?: string;
  has_ibs?: boolean;
  dietary_restrictions?: string[];
  age?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  photo_url?: string;
  foods: Array<{ name: string; amount?: string }>;
  gut_scores: {
    fodmap: number;
    fermentation: number;
    fiber_diversity: number;
    probiotic: number;
  };
  overall_score: number;
  notes?: string;
  is_sample?: boolean;
  logged_at: string;
  created_at?: string;
}

export interface Symptom {
  id: string;
  user_id: string;
  meal_id?: string;
  bloating: number;
  cramping: number;
  energy: number;
  notes?: string;
  logged_at: string;
  created_at?: string;
}

export interface Trigger {
  id: string;
  user_id: string;
  food_name: string;
  confidence_score: number;
  avg_bloating?: number;
  avg_cramping?: number;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklyScore {
  id: string;
  user_id: string;
  week_start: string;
  avg_fodmap: number;
  avg_fermentation: number;
  avg_fiber_diversity: number;
  avg_probiotic: number;
  created_at?: string;
}
