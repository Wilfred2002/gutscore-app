import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User, Meal, Symptom, OnboardingState } from '@/types';
import { mockUser, mockMeals, mockSymptoms } from '@/mocks/data';

const STORAGE_KEYS = {
  ONBOARDING: 'gutscore_onboarding',
  USER: 'gutscore_user',
  MEALS: 'gutscore_meals',
  SYMPTOMS: 'gutscore_symptoms',
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
  const [user, setUser] = useState<User | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const [storedOnboarding, storedUser, storedMeals, storedSymptoms] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING),
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.MEALS),
        AsyncStorage.getItem(STORAGE_KEYS.SYMPTOMS),
      ]);

      if (storedOnboarding) {
        setOnboarding(JSON.parse(storedOnboarding));
      }
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedMeals) {
        const parsedMeals = JSON.parse(storedMeals);
        setMeals(parsedMeals.map((m: Meal) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
      if (storedSymptoms) {
        const parsedSymptoms = JSON.parse(storedSymptoms);
        setSymptoms(parsedSymptoms.map((s: Symptom) => ({ ...s, timestamp: new Date(s.timestamp) })));
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOnboarding = useCallback(async (updates: Partial<OnboardingState>) => {
    const newOnboarding = { ...onboarding, ...updates };
    setOnboarding(newOnboarding);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(newOnboarding));
  }, [onboarding]);

  const completeOnboarding = useCallback(async () => {
    const newUser = {
      ...mockUser,
      ...onboarding.quizAnswers,
    };
    setUser(newUser);
    await updateOnboarding({ completed: true });
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    
    setMeals(mockMeals);
    setSymptoms(mockSymptoms);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(mockMeals));
    await AsyncStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(mockSymptoms));
  }, [onboarding, updateOnboarding]);

  const addMeal = useCallback(async (meal: Meal) => {
    const newMeals = [meal, ...meals];
    setMeals(newMeals);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(newMeals));
    
    if (!onboarding.checklistItems.scannedFirstMeal) {
      await updateOnboarding({
        checklistItems: { ...onboarding.checklistItems, scannedFirstMeal: true },
      });
    }
  }, [meals, onboarding, updateOnboarding]);

  const addSymptom = useCallback(async (symptom: Symptom) => {
    const newSymptoms = [symptom, ...symptoms];
    setSymptoms(newSymptoms);
    await AsyncStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(newSymptoms));
    
    if (!onboarding.checklistItems.loggedSymptom) {
      await updateOnboarding({
        checklistItems: { ...onboarding.checklistItems, loggedSymptom: true },
      });
    }
  }, [symptoms, onboarding, updateOnboarding]);

  const deleteMeal = useCallback(async (mealId: string) => {
    const newMeals = meals.filter(m => m.id !== mealId);
    setMeals(newMeals);
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(newMeals));
  }, [meals]);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updates };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
  }, [user]);

  const resetApp = useCallback(async () => {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    setOnboarding(defaultOnboarding);
    setUser(null);
    setMeals([]);
    setSymptoms([]);
  }, []);

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
    resetApp,
    getWeeklyStats,
    getTodaysMeals,
  };
});
