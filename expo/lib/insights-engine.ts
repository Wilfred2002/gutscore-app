import { Meal, Symptom, Trigger } from '@/types';

// ============ Types ============

export interface ProgressMetrics {
  avgScore: number;
  weekOverWeek: number;
  goodDaysCount: number;
  symptomFreeStreak: number;
  mealsLogged: number;
  symptomsLogged: number;
}

export interface SafeFood {
  name: string;
  count: number;
  avgScore: number;
}

export interface Pattern {
  type: 'timing' | 'day_of_week' | 'food_performance';
  insight: string;
  confidence: number;
}

// ============ Helper Functions ============

const getDateKey = (date: Date): string => {
  return new Date(date).toDateString();
};

const daysBetween = (date1: Date, date2: Date): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

// ============ Progress Metrics ============

export const calculateProgress = (meals: Meal[], symptoms: Symptom[]): ProgressMetrics => {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Filter meals for each period
  const last7DaysMeals = meals.filter(m => new Date(m.timestamp) >= sevenDaysAgo);
  const previous7DaysMeals = meals.filter(m => {
    const date = new Date(m.timestamp);
    return date >= fourteenDaysAgo && date < sevenDaysAgo;
  });

  // Calculate average scores
  const avgScore = last7DaysMeals.length > 0
    ? Math.round(last7DaysMeals.reduce((sum, m) => sum + m.score, 0) / last7DaysMeals.length)
    : 0;
  const prevAvgScore = previous7DaysMeals.length > 0
    ? Math.round(previous7DaysMeals.reduce((sum, m) => sum + m.score, 0) / previous7DaysMeals.length)
    : 0;
  const weekOverWeek = previous7DaysMeals.length > 0 ? avgScore - prevAvgScore : 0;

  // Calculate good days (days with avg score >= 80)
  const mealsByDay: Record<string, number[]> = {};
  last7DaysMeals.forEach(m => {
    const key = getDateKey(m.timestamp);
    if (!mealsByDay[key]) mealsByDay[key] = [];
    mealsByDay[key].push(m.score);
  });
  const goodDaysCount = Object.values(mealsByDay).filter(scores => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg >= 80;
  }).length;

  // Calculate symptom-free streak (consecutive days without severe symptoms)
  const last7DaysSymptoms = symptoms.filter(s => new Date(s.timestamp) >= sevenDaysAgo);
  const badSymptomDays = new Set<string>();
  last7DaysSymptoms.forEach(s => {
    if (s.bloat >= 3 || s.pain >= 3 || s.energy <= 2) {
      badSymptomDays.add(getDateKey(s.timestamp));
    }
  });

  let symptomFreeStreak = 0;
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(checkDate.getDate() - i);
    if (badSymptomDays.has(getDateKey(checkDate))) {
      break;
    }
    symptomFreeStreak++;
  }

  return {
    avgScore,
    weekOverWeek,
    goodDaysCount,
    symptomFreeStreak,
    mealsLogged: last7DaysMeals.length,
    symptomsLogged: last7DaysSymptoms.length
  };
};

// ============ Safe Foods ============

export const calculateSafeFoods = (meals: Meal[], symptoms: Symptom[]): SafeFood[] => {
  if (meals.length === 0) return [];

  // Find foods that preceded symptoms (problem foods)
  const foodsWithSymptoms = new Set<string>();
  const significantSymptoms = symptoms.filter(s =>
    s.bloat >= 3 || s.pain >= 3 || s.energy <= 2
  );

  significantSymptoms.forEach(symptom => {
    const symptomTime = new Date(symptom.timestamp).getTime();

    meals.forEach(meal => {
      const mealTime = new Date(meal.timestamp).getTime();
      const diffHours = (symptomTime - mealTime) / (1000 * 60 * 60);

      // Food eaten 30 min to 6 hours before symptom
      if (diffHours >= 0.5 && diffHours <= 6) {
        meal.foods.forEach(food => {
          foodsWithSymptoms.add(food.name.toLowerCase().trim());
        });
      }
    });
  });

  // Count foods eaten without symptoms
  const foodCounts: Record<string, { name: string; count: number; totalScore: number }> = {};

  meals.forEach(meal => {
    meal.foods.forEach(food => {
      const key = food.name.toLowerCase().trim();
      if (!foodsWithSymptoms.has(key)) {
        if (!foodCounts[key]) {
          foodCounts[key] = { name: food.name, count: 0, totalScore: 0 };
        }
        foodCounts[key].count++;
        foodCounts[key].totalScore += meal.score;
      }
    });
  });

  // Filter to foods eaten 3+ times and sort by count
  return Object.values(foodCounts)
    .filter(f => f.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(f => ({
      name: f.name,
      count: f.count,
      avgScore: Math.round(f.totalScore / f.count)
    }));
};

// ============ Pattern Detection ============

export const detectPatterns = (meals: Meal[], symptoms: Symptom[]): Pattern[] => {
  if (meals.length < 10) return []; // Need enough data for patterns

  const patterns: Pattern[] = [];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Pattern 1: Best time to eat
  const mealsByHour: Record<number, { scores: number[]; count: number }> = {};
  meals.forEach(m => {
    const hour = new Date(m.timestamp).getHours();
    if (!mealsByHour[hour]) mealsByHour[hour] = { scores: [], count: 0 };
    mealsByHour[hour].scores.push(m.score);
    mealsByHour[hour].count++;
  });

  // Find best hour range with at least 3 meals
  const hourEntries = Object.entries(mealsByHour)
    .filter(([, data]) => data.count >= 3)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  if (hourEntries.length > 0) {
    const best = hourEntries[0];
    const worst = hourEntries[hourEntries.length - 1];
    if (best.avgScore - worst.avgScore >= 10) {
      const formatHour = (h: number) => h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`;
      patterns.push({
        type: 'timing',
        insight: `You feel best eating around ${formatHour(best.hour)} (avg score: ${Math.round(best.avgScore)})`,
        confidence: Math.min(best.count / 10, 1)
      });
    }
  }

  // Pattern 2: Best day of week
  const mealsByDay: Record<number, { scores: number[]; count: number }> = {};
  meals.forEach(m => {
    const day = new Date(m.timestamp).getDay();
    if (!mealsByDay[day]) mealsByDay[day] = { scores: [], count: 0 };
    mealsByDay[day].scores.push(m.score);
    mealsByDay[day].count++;
  });

  const dayEntries = Object.entries(mealsByDay)
    .filter(([, data]) => data.count >= 2)
    .map(([day, data]) => ({
      day: parseInt(day),
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      count: data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  if (dayEntries.length >= 3) {
    const best = dayEntries[0];
    const worst = dayEntries[dayEntries.length - 1];
    if (best.avgScore - worst.avgScore >= 8) {
      patterns.push({
        type: 'day_of_week',
        insight: `Your best gut days are ${dayNames[best.day]}s (avg score: ${Math.round(best.avgScore)})`,
        confidence: Math.min(best.count / 5, 1)
      });
    }
  }

  // Pattern 3: Food type performance (simplified - look at high vs low scoring meals)
  const highScoringFoods: Record<string, number> = {};
  const lowScoringFoods: Record<string, number> = {};

  meals.forEach(m => {
    m.foods.forEach(food => {
      const key = food.name.toLowerCase().trim();
      if (m.score >= 80) {
        highScoringFoods[key] = (highScoringFoods[key] || 0) + 1;
      } else if (m.score <= 50) {
        lowScoringFoods[key] = (lowScoringFoods[key] || 0) + 1;
      }
    });
  });

  // Find foods that appear often in high-scoring meals but rarely in low-scoring
  const highPerformers = Object.entries(highScoringFoods)
    .filter(([food, count]) => count >= 3 && (!lowScoringFoods[food] || lowScoringFoods[food] < count * 0.3))
    .sort((a, b) => b[1] - a[1]);

  if (highPerformers.length > 0) {
    const topFood = highPerformers[0][0];
    // Capitalize first letter
    const formattedFood = topFood.charAt(0).toUpperCase() + topFood.slice(1);
    patterns.push({
      type: 'food_performance',
      insight: `${formattedFood} appears in your highest-scoring meals`,
      confidence: Math.min(highPerformers[0][1] / 5, 1)
    });
  }

  return patterns.filter(p => p.confidence >= 0.3);
};

// ============ FODMAP Exposure ============

export interface FodmapExposure {
  high: number;
  medium: number;
  low: number;
  totalMeals: number;
  symptomDaysAfterHigh: number;
  correlation: number; // percentage
}

export const calculateFodmapExposure = (
  meals: Meal[],
  symptoms: Symptom[],
  weekOffset: number = 0 // 0 = current week, 1 = last week, 2 = 2 weeks ago, etc.
): FodmapExposure => {
  const now = new Date();

  // Calculate the date range for the specified week
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() - (weekOffset * 7));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  // Filter meals from the specified week that have gutScores
  const recentMeals = meals.filter(m => {
    const mealDate = new Date(m.timestamp);
    return mealDate >= startDate && mealDate <= endDate && m.gutScores;
  });

  // Count FODMAP levels
  let high = 0, medium = 0, low = 0;
  const highFodmapDays = new Set<string>();

  recentMeals.forEach(meal => {
    const fodmap = meal.gutScores?.fodmap || 0;
    const dateKey = new Date(meal.timestamp).toDateString();

    if (fodmap > 70) {
      high++;
      highFodmapDays.add(dateKey);
    } else if (fodmap > 40) {
      medium++;
    } else {
      low++;
    }
  });

  // Count symptom days that occurred on or after high FODMAP days
  const recentSymptoms = symptoms.filter(s => {
    const symptomDate = new Date(s.timestamp);
    return symptomDate >= startDate && symptomDate <= endDate;
  });
  const significantSymptomDays = new Set<string>();

  recentSymptoms.forEach(s => {
    if (s.bloat >= 3 || s.pain >= 3 || s.energy <= 2) {
      significantSymptomDays.add(new Date(s.timestamp).toDateString());
    }
  });

  // Find overlap between high FODMAP days and symptom days (same day or next day)
  let symptomDaysAfterHigh = 0;
  highFodmapDays.forEach(fodmapDay => {
    const fodmapDate = new Date(fodmapDay);
    const nextDay = new Date(fodmapDate);
    nextDay.setDate(nextDay.getDate() + 1);

    if (significantSymptomDays.has(fodmapDay) || significantSymptomDays.has(nextDay.toDateString())) {
      symptomDaysAfterHigh++;
    }
  });

  // Calculate correlation percentage
  const correlation = highFodmapDays.size > 0
    ? Math.round((symptomDaysAfterHigh / highFodmapDays.size) * 100)
    : 0;

  return {
    high,
    medium,
    low,
    totalMeals: recentMeals.length,
    symptomDaysAfterHigh,
    correlation
  };
};

// ============ Dynamic Recommendations ============

export const generateTips = (
  meals: Meal[],
  symptoms: Symptom[],
  triggers: Trigger[],
  fiberDiversity: number
): string[] => {
  const tips: string[] = [];
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentMeals = meals.filter(m => new Date(m.timestamp) >= sevenDaysAgo);
  const recentSymptoms = symptoms.filter(s => new Date(s.timestamp) >= sevenDaysAgo);

  // Rule 1: High FODMAP intake
  const mealsWithGutScores = recentMeals.filter(m => m.gutScores);
  if (mealsWithGutScores.length >= 3) {
    const avgFodmap = mealsWithGutScores.reduce((sum, m) => sum + (m.gutScores?.fodmap || 0), 0) / mealsWithGutScores.length;
    if (avgFodmap > 50) {
      tips.push("Your FODMAP intake is elevated. Try reducing garlic, onions, and wheat this week.");
    }
  }

  // Rule 2: Low fiber diversity
  if (fiberDiversity < 15 && recentMeals.length >= 5) {
    tips.push(`Add more variety: You've eaten ${fiberDiversity} different plant foods. Aim for 30+ weekly.`);
  }

  // Rule 3: Top trigger detected
  if (triggers.length > 0 && triggers[0].confidence >= 75) {
    tips.push(`Consider limiting ${triggers[0].name} - it's associated with ${triggers[0].confidence}% of your symptoms.`);
  }

  // Rule 4: Not logging symptoms
  if (recentMeals.length >= 5 && recentSymptoms.length < recentMeals.length / 3) {
    tips.push("Log symptoms after meals to help detect your triggers. We need more data!");
  }

  // Rule 5: Late meals correlate with lower scores
  const lateMeals = recentMeals.filter(m => new Date(m.timestamp).getHours() >= 21);
  const earlyMeals = recentMeals.filter(m => new Date(m.timestamp).getHours() < 21);
  if (lateMeals.length >= 3 && earlyMeals.length >= 3) {
    const lateAvg = lateMeals.reduce((sum, m) => sum + m.score, 0) / lateMeals.length;
    const earlyAvg = earlyMeals.reduce((sum, m) => sum + m.score, 0) / earlyMeals.length;
    if (earlyAvg - lateAvg >= 10) {
      tips.push("Your late-night meals (after 9pm) score lower. Try eating dinner earlier.");
    }
  }

  // Rule 6: Good streak - positive reinforcement
  const progress = calculateProgress(meals, symptoms);
  if (progress.symptomFreeStreak >= 3) {
    tips.push(`Great job! ${progress.symptomFreeStreak} days symptom-free. Keep up the good habits!`);
  }

  // Rule 7: Improving week over week
  if (progress.weekOverWeek >= 5) {
    tips.push(`Your gut health improved by ${progress.weekOverWeek} points this week. You're on the right track!`);
  }

  // Default tips if not enough data
  if (tips.length === 0) {
    if (meals.length < 5) {
      tips.push("Log at least 5 meals to start seeing personalized insights.");
    } else if (symptoms.length < 3) {
      tips.push("Track your symptoms after meals to help identify your triggers.");
    } else {
      tips.push("Keep logging consistently. Patterns emerge after 1-2 weeks of data.");
    }
  }

  return tips.slice(0, 4); // Max 4 tips
};
