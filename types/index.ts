export interface User {
  id: string;
  email: string;
  name: string;
  hasIBS: boolean;
  dietaryRestrictions: string[];
  ageRange: string;
  symptomFrequency: string;
  gutConcern: string;
  streak: number;
  isPro: boolean;
}

export interface Meal {
  id: string;
  timestamp: Date;
  imageUri: string;
  foods: DetectedFood[];
  score: number;
  fodmapRisk?: number;
  fermentation?: number;
  fiberDiversity?: number;
  probioticBoost?: number;
  gutScores?: {
    fodmap: number;
    fermentation: number;
    fiber_diversity: number;
    probiotic: number;
  };
  status?: 'safe' | 'caution' | 'avoid';
  analysis?: string[];
  triggers?: string[];
  swaps?: FoodSwap[];
  notes?: string;
}

export interface DetectedFood {
  id: string;
  name: string;
  confidence: number;
  emoji: string;
}

export interface FoodSwap {
  id: string;
  name: string;
  emoji: string;
  scoreIncrease: number;
}

export interface Symptom {
  id: string;
  timestamp: Date;
  bloat: number;      // 0-5 scale
  energy: number;     // 0-5 scale
  pain: number;       // 0-5 scale
  associatedMealId?: string;
  notes?: string;
}

export interface FoodListItem {
  id: string;
  name: string;
  category: 'safe' | 'limit' | 'avoid';
  source: 'ai' | 'manual' | 'trigger_engine';
  confidence: number;
  lastEaten?: Date;
}

export interface Trigger {
  id: string;
  name: string;
  confidence: number;
  status: 'avoid' | 'limit' | 'monitor';
  lastEaten?: Date;
}

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  quizAnswers: {
    gutConcern?: string;
    dietaryRestrictions?: string[];
    ageRange?: string;
    symptomFrequency?: string;
    hasCoach?: boolean;
    mainGoal?: string;
    barriers?: string;
    triedOtherApps?: boolean;
  };
  permissionsGranted: {
    camera: boolean;
    health: boolean;
  };
  checklistItems: {
    scannedFirstMeal: boolean;
    loggedSymptom: boolean;
    setupNotifications: boolean;
    invitedFriend: boolean;
    upgradedToPro: boolean;
  };
}

export interface WeeklyStats {
  avgScore: number;
  scoreChange: number;
  mealsScanned: number;
  triggersIdentified: number;
}

export interface DailyScore {
  day: string;
  score: number;
}
