/**
 * Constants & Temporary Demo Data
 *
 * This file contains:
 * - UI constants (symptom types, dietary options, etc.)
 * - Temporary mock data for demo features (until AI integration)
 */

import { Trigger, DailyScore, DetectedFood, FoodSwap } from '@/types';

// ============================================
// TEMPORARY - For demo UI only
// ============================================
// Will be replaced with real AI/database integration

/** Temporary: Mock food detection results - Replace with OpenAI Vision API */
export const mockFoods: DetectedFood[] = [
  { id: '1', name: 'Scrambled Eggs', confidence: 98, emoji: '🍳' },
  { id: '2', name: 'Toast', confidence: 94, emoji: '🍞' },
  { id: '3', name: 'Butter', confidence: 87, emoji: '🧈' },
];

/** Temporary: Mock food swaps - Replace with AI recommendations */
export const mockSwaps: FoodSwap[] = [
  { id: '1', name: 'Whole Wheat Toast', emoji: '🌾', scoreIncrease: 3 },
  { id: '2', name: 'Avocado', emoji: '🥑', scoreIncrease: 5 },
  { id: '3', name: 'Lactose-Free Butter', emoji: '🧈', scoreIncrease: 2 },
];

/** Temporary: Mock triggers - Replace with real ML-based trigger detection */
export const mockTriggers: Trigger[] = [
  { id: '1', name: 'Onions', confidence: 92, status: 'avoid' },
  { id: '2', name: 'Wheat', confidence: 78, status: 'limit' },
  { id: '3', name: 'Dairy', confidence: 64, status: 'monitor' },
];

/** Temporary: Mock weekly scores - Replace with Supabase weekly_scores aggregation */
export const mockWeeklyScores: DailyScore[] = [
  { day: 'Mon', score: 75 },
  { day: 'Tue', score: 82 },
  { day: 'Wed', score: 78 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 72 },
  { day: 'Sat', score: 88 },
  { day: 'Sun', score: 80 },
];

// ============================================
// UI CONSTANTS - Active
// ============================================

export const symptomTypes = [
  'Bloating',
  'Cramping',
  'Gas/Flatulence',
  'Irregular BMs',
  'Fatigue',
  'Brain Fog',
  'Skin Issues',
];

export const gutConcerns = [
  { id: 'ibs', label: 'IBS - Bloating, cramping, irregular BMs' },
  { id: 'sibo', label: 'SIBO - Severe gas, food sensitivities' },
  { id: 'wellness', label: 'General Wellness - Optimize digestion' },
  { id: 'skip', label: 'Prefer not to say' },
];

export const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Low-FODMAP',
  'None / Not sure',
];

export const ageRanges = [
  { id: 'under25', label: 'Under 25' },
  { id: '25-40', label: '25-40' },
  { id: '40-60', label: '40-60' },
  { id: '60+', label: '60+' },
];

export const symptomFrequencies = [
  { id: 'daily', label: 'Daily' },
  { id: '2-3_week', label: '2-3 times per week' },
  { id: 'occasionally', label: 'Occasionally (1-2x/week)' },
  { id: 'rarely', label: 'Rarely' },
];
