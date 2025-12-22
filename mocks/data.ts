import { Meal, Symptom, Trigger, DailyScore, DetectedFood, FoodSwap } from '@/types';

export const mockUser = {
  id: '1',
  email: 'sarah@email.com',
  name: 'Sarah J.',
  hasIBS: true,
  dietaryRestrictions: ['Vegetarian', 'Gluten-Free'],
  ageRange: '25-40',
  symptomFrequency: '2-3 times per week',
  gutConcern: 'IBS',
  streak: 7,
  isPro: false,
};

export const mockFoods: DetectedFood[] = [
  { id: '1', name: 'Scrambled Eggs', confidence: 98, emoji: '🍳' },
  { id: '2', name: 'Toast', confidence: 94, emoji: '🍞' },
  { id: '3', name: 'Butter', confidence: 87, emoji: '🧈' },
];

export const mockSwaps: FoodSwap[] = [
  { id: '1', name: 'Whole Wheat Toast', emoji: '🌾', scoreIncrease: 3 },
  { id: '2', name: 'Avocado', emoji: '🥑', scoreIncrease: 5 },
  { id: '3', name: 'Lactose-Free Butter', emoji: '🧈', scoreIncrease: 2 },
];

export const mockMeals: Meal[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    imageUri: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    foods: mockFoods,
    score: 92,
    fodmapRisk: 18,
    fermentation: 25,
    fiberDiversity: 8,
    probioticBoost: 2,
    status: 'safe',
    analysis: [
      'Low-FODMAP vegetables',
      'Easily digestible protein',
      'Moderate fiber content',
    ],
    triggers: [
      'You may have mild sensitivity to butter (lactose). Consider lactose-free alternative.',
    ],
    swaps: mockSwaps,
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    imageUri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    foods: [
      { id: '4', name: 'Grilled Chicken', confidence: 96, emoji: '🍗' },
      { id: '5', name: 'Quinoa', confidence: 91, emoji: '🌾' },
      { id: '6', name: 'Steamed Broccoli', confidence: 89, emoji: '🥦' },
    ],
    score: 88,
    fodmapRisk: 22,
    fermentation: 30,
    fiberDiversity: 7,
    probioticBoost: 3,
    status: 'safe',
    analysis: [
      'High-quality protein source',
      'Good fiber diversity',
      'Low fermentation risk',
    ],
    triggers: [],
    swaps: [
      { id: '4', name: 'Brown Rice', emoji: '🍚', scoreIncrease: 2 },
    ],
  },
];

export const mockSymptoms: Symptom[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    types: ['Bloating', 'Gas'],
    intensity: 4,
    mealAssociation: '2_3_hours',
    associatedMealId: '1',
    notes: 'Felt a bit uncomfortable after lunch',
  },
];

export const mockTriggers: Trigger[] = [
  { id: '1', name: 'Onions', confidence: 92, status: 'avoid' },
  { id: '2', name: 'Wheat', confidence: 78, status: 'limit' },
  { id: '3', name: 'Dairy', confidence: 64, status: 'monitor' },
];

export const mockWeeklyScores: DailyScore[] = [
  { day: 'Mon', score: 75 },
  { day: 'Tue', score: 82 },
  { day: 'Wed', score: 78 },
  { day: 'Thu', score: 85 },
  { day: 'Fri', score: 72 },
  { day: 'Sat', score: 88 },
  { day: 'Sun', score: 80 },
];

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
  { id: 'ibs', label: 'IBS - Bloating, cramping, irregular BMs', emoji: '🔹' },
  { id: 'sibo', label: 'SIBO - Severe gas, food sensitivities', emoji: '🔹' },
  { id: 'wellness', label: 'General Wellness - Optimize digestion', emoji: '🔹' },
  { id: 'skip', label: 'Prefer not to say', emoji: '🔹' },
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
