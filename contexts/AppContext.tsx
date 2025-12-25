import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import createContextHook from '@nkzw/create-context-hook';
import { User, Meal, Symptom, OnboardingState } from '@/types';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';

// Initialize the browser for OAuth
WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEYS = {
  ONBOARDING: 'gutscore_onboarding',
};

const defaultOnboarding: OnboardingState = {
  completed: false,
  currentStep: 0,
  quizAnswers: {},
  permissionsGranted: {
    camera: false,
    health: false,
  },
  checklistItems: {
    scannedFirstMeal: false,
    loggedSymptom: false,
    setupNotifications: false,
    invitedFriend: false,
    upgradedToPro: false,
  },
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [isLoading, setIsLoading] = useState(true);
  const [onboarding, setOnboarding] = useState<OnboardingState>(defaultOnboarding);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    } else {
      setUser(null);
      setMeals([]);
      setSymptoms([]);
    }
  }, [session]);

  const initializeApp = async () => {
    try {
      // Load onboarding state from AsyncStorage (local only)
      const storedOnboarding = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING);
      if (storedOnboarding) {
        setOnboarding(JSON.parse(storedOnboarding));
      }

      // Set up Supabase auth state listener
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
      });

      // Cleanup subscription on unmount
      return () => subscription.unsubscribe();
    } catch (error) {
      console.log('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    if (!session?.user) return;

    try {
      // Fetch user profile from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (userError) throw userError;

      if (userData) {
        // Convert Supabase user to app User type
        setUser({
          id: userData.id,
          email: userData.email,
          name: userData.name || '',
          hasIBS: userData.has_ibs,
          dietaryRestrictions: userData.dietary_restrictions || [],
          age: userData.age,
        });
      }

      // Fetch meals from Supabase
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .limit(50);

      if (mealsError) throw mealsError;

      if (mealsData) {
        setMeals(mealsData.map((m: any) => ({
          id: m.id,
          foods: m.foods,
          timestamp: new Date(m.logged_at),
          score: m.overall_score,
          imageUri: m.photo_url,
          gutScores: m.gut_scores,
          notes: m.notes,
        })));
      }

      // Fetch symptoms from Supabase
      const { data: symptomsData, error: symptomsError } = await supabase
        .from('symptoms')
        .select('*')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false })
        .limit(50);

      if (symptomsError) throw symptomsError;

      if (symptomsData) {
        setSymptoms(symptomsData.map((s: any) => ({
          id: s.id,
          mealId: s.meal_id,
          timestamp: new Date(s.logged_at),
          bloating: s.bloating,
          cramping: s.cramping,
          energy: s.energy,
          notes: s.notes,
        })));
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const updateOnboarding = useCallback(async (updates: Partial<OnboardingState>) => {
    const newOnboarding = { ...onboarding, ...updates };
    setOnboarding(newOnboarding);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(newOnboarding));
  }, [onboarding]);

  const completeOnboarding = useCallback(async () => {
    if (!session?.user) {
      console.error('No authenticated user found');
      return;
    }

    try {
      // Update user profile with onboarding answers
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: onboarding.quizAnswers.name,
          has_ibs: onboarding.quizAnswers.hasIBS,
          dietary_restrictions: onboarding.quizAnswers.dietaryRestrictions || [],
          age: onboarding.quizAnswers.age,
        })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      // Mark onboarding as completed locally
      await updateOnboarding({ completed: true });

      // Insert sample data so users see the UI with example meals
      await insertSampleData();

      // Reload user data
      await loadUserData();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [session, onboarding, updateOnboarding]);

  const insertSampleData = async () => {
    if (!session?.user) return;

    try {
      // Insert 2 sample meals marked as examples
      const sampleMeals = [
        {
          user_id: session.user.id,
          foods: [
            { id: '1', name: 'Grilled Chicken', confidence: 95, emoji: '🍗' },
            { id: '2', name: 'Brown Rice', confidence: 92, emoji: '🍚' },
            { id: '3', name: 'Steamed Broccoli', confidence: 89, emoji: '🥦' },
          ],
          gut_scores: {
            fodmap: 85,
            fermentation: 70,
            fiber_diversity: 90,
            probiotic: 45,
          },
          overall_score: 78,
          notes: 'Example meal - This is what a gut-friendly meal looks like!',
          is_sample: true,
          logged_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        },
        {
          user_id: session.user.id,
          foods: [
            { id: '1', name: 'Greek Yogurt', confidence: 96, emoji: '🥛' },
            { id: '2', name: 'Blueberries', confidence: 94, emoji: '🫐' },
            { id: '3', name: 'Granola', confidence: 88, emoji: '🥣' },
          ],
          gut_scores: {
            fodmap: 75,
            fermentation: 65,
            fiber_diversity: 85,
            probiotic: 90,
          },
          overall_score: 82,
          notes: 'Example meal - Great source of probiotics and fiber!',
          is_sample: true,
          logged_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        },
      ];

      const { error: mealsError } = await supabase
        .from('meals')
        .insert(sampleMeals);

      if (mealsError) throw mealsError;

      console.log('Sample data inserted successfully');
    } catch (error) {
      console.error('Error inserting sample data:', error);
    }
  };

  const addMeal = useCallback(async (meal: Meal) => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('meals')
        .insert({
          user_id: session.user.id,
          foods: meal.foods,
          gut_scores: meal.gutScores,
          overall_score: meal.score,
          photo_url: meal.imageUri,
          notes: meal.notes,
          is_sample: false,
          logged_at: meal.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setMeals([meal, ...meals]);

      if (!onboarding.checklistItems.scannedFirstMeal) {
        await updateOnboarding({
          checklistItems: { ...onboarding.checklistItems, scannedFirstMeal: true },
        });
      }
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  }, [session, meals, onboarding, updateOnboarding]);

  const addSymptom = useCallback(async (symptom: Symptom) => {
    if (!session?.user) return;

    try {
      const { data, error } = await supabase
        .from('symptoms')
        .insert({
          user_id: session.user.id,
          meal_id: symptom.mealId,
          bloating: symptom.bloating,
          cramping: symptom.cramping,
          energy: symptom.energy,
          notes: symptom.notes,
          logged_at: symptom.timestamp.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSymptoms([symptom, ...symptoms]);

      if (!onboarding.checklistItems.loggedSymptom) {
        await updateOnboarding({
          checklistItems: { ...onboarding.checklistItems, loggedSymptom: true },
        });
      }
    } catch (error) {
      console.error('Error adding symptom:', error);
      throw error;
    }
  }, [session, symptoms, onboarding, updateOnboarding]);

  const deleteMeal = useCallback(async (mealId: string) => {
    if (!session?.user) return;

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      // Update local state
      setMeals(meals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  }, [session, meals]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!session?.user || !user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          has_ibs: updates.hasIBS,
          dietary_restrictions: updates.dietaryRestrictions,
          age: updates.age,
        })
        .eq('id', session.user.id);

      if (error) throw error;

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }, [session, user]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { data: null, error: error.message || 'Failed to sign up' };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error signing in:', error);
      return { data: null, error: error.message || 'Failed to sign in' };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local data
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setOnboarding(defaultOnboarding);
      setUser(null);
      setMeals([]);
      setSymptoms([]);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return { error: error.message || 'Failed to reset password' };
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      // 1. Get OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'gutscore://google-auth',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned from Supabase');

      // 2. Open the OAuth URL in a browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'gutscore://google-auth',
        { showInRecents: true }
      );

      // 3. Handle the OAuth result
      if (result.type === 'success') {
        const url = result.url;

        // Extract tokens from the URL hash
        const params = new URLSearchParams(url.split('#')[1] || '');
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          // 4. Set the session in Supabase
          const { data: sessionData, error: sessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (sessionError) throw sessionError;

          return { data: sessionData, error: null };
        } else {
          throw new Error('No tokens returned from OAuth');
        }
      } else if (result.type === 'cancel') {
        return { data: null, error: 'User cancelled Google Sign-In' };
      }

      return { data: null, error: 'Google Sign-In was not successful' };
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      return { data: null, error: error.message || 'Failed to sign in with Google' };
    }
  }, []);

  const resetApp = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const getWeeklyStats = useCallback(() => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekMeals = meals.filter(m => new Date(m.timestamp) >= weekAgo);
    const avgScore = weekMeals.length > 0 
      ? Math.round(weekMeals.reduce((sum, m) => sum + m.score, 0) / weekMeals.length)
      : 0;
    
    return {
      avgScore,
      scoreChange: 5,
      mealsScanned: weekMeals.length,
      triggersIdentified: 2,
    };
  }, [meals]);

  const getTodaysMeals = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return meals.filter(m => new Date(m.timestamp) >= today);
  }, [meals]);

  return {
    isLoading,
    session,
    onboarding,
    user,
    meals,
    symptoms,
    updateOnboarding,
    completeOnboarding,
    addMeal,
    addSymptom,
    deleteMeal,
    updateUser,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    resetApp,
    getWeeklyStats,
    getTodaysMeals,
  };
});
