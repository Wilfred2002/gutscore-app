import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Camera, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Meal, UserGoal } from '@/types';
import { analyzeTriggers } from '@/lib/trigger-engine';

// Today's Focus interfaces
interface TodaysFocusData {
  lines: { label: string; value: string; highlight?: boolean }[];
  tip: string;
}

interface DailyStats {
  mealsLogged: number;
  calories: number;
  protein: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  highRiskFoods: string[];
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, meals, symptoms, onboarding, isLoading, getTodaysMeals } = useApp();

  const todaysMeals = getTodaysMeals();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!isLoading && !onboarding.completed) {
      router.replace('/onboarding');
    }
  }, [isLoading, onboarding.completed, router]);

  // Calculate daily stats
  const dailyStats = useMemo((): DailyStats => {
    const calories = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const protein = todaysMeals.reduce((sum, m) => sum + (m.protein || 0), 0);

    // Calculate risk level based on FODMAP scores
    const avgFodmap = todaysMeals.length > 0
      ? todaysMeals.reduce((sum, m) => sum + (m.gutScores?.fodmap || 0), 0) / todaysMeals.length
      : 0;

    // Detect triggers
    const triggers = analyzeTriggers(meals, symptoms);
    const triggerNames = triggers.slice(0, 3).map(t => t.name);

    // High risk foods to watch
    const highRiskFoods: string[] = [];
    if (user?.hasIBS) highRiskFoods.push('High FODMAP');
    if (user?.lactoseIntolerant) highRiskFoods.push('Dairy');
    if (triggerNames.length > 0) highRiskFoods.push(...triggerNames.slice(0, 2));

    let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
    if (avgFodmap > 70) riskLevel = 'High';
    else if (avgFodmap > 40) riskLevel = 'Medium';

    return {
      mealsLogged: todaysMeals.length,
      calories,
      protein,
      riskLevel,
      highRiskFoods: highRiskFoods.slice(0, 3)
    };
  }, [todaysMeals, meals, symptoms, user]);

  // Get Today's Focus based on user goal
  const getTodaysFocus = (): TodaysFocusData => {
    const goal = user?.goal || 'manage_digestion';
    const calorieTarget = user?.dailyCalorieTarget || 2000;
    const proteinTarget = user?.proteinTarget || 100;
    const caloriesLeft = Math.max(0, calorieTarget - dailyStats.calories);

    if (goal === 'weight_loss' || goal === 'weight_maintenance' || goal === 'weight_gain') {
      return {
        lines: [
          { label: 'Target', value: `${calorieTarget} cal` },
          { label: 'Used', value: `${dailyStats.calories} cal (${dailyStats.mealsLogged} meals)` },
          { label: 'Left', value: `${caloriesLeft} cal`, highlight: true },
          { label: 'Protein', value: `${dailyStats.protein}g / ${proteinTarget}g` },
        ],
        tip: caloriesLeft > 0
          ? `Try: Keep dinner under ${Math.round(caloriesLeft * 0.8)} cal`
          : 'You\'ve reached your calorie target!'
      };
    }

    // Digestive / Trigger understanding goals
    return {
      lines: [
        { label: 'Risk level', value: dailyStats.riskLevel, highlight: dailyStats.riskLevel !== 'Low' },
        { label: 'Watch', value: dailyStats.highRiskFoods.length > 0 ? dailyStats.highRiskFoods.join(', ') : 'Nothing specific' },
        { label: 'Meals logged', value: `${dailyStats.mealsLogged}` },
      ],
      tip: dailyStats.mealsLogged < 3
        ? 'Try: Scan all meals today to learn your patterns'
        : 'Try: Choose low-FODMAP options for your next meal'
    };
  };

  const todaysFocus = getTodaysFocus();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const formatMealTime = (date: Date) => {
    const hour = new Date(date).getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 15) return 'Lunch';
    if (hour < 18) return 'Snack';
    return 'Dinner';
  };

  const renderRecentMeal = (meal: Meal, index: number) => {
    const mealType = formatMealTime(meal.timestamp);
    const foodNames = meal.foods.map(f => f.name).join(' & ');

    return (
      <TouchableOpacity
        key={meal.id}
        style={styles.recentMealItem}
        onPress={() => router.push({ pathname: '/meal-detail', params: { mealId: meal.id } })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: meal.imageUri }}
          style={styles.recentMealImage}
          contentFit="cover"
        />
        <View style={styles.recentMealInfo}>
          <Text style={styles.recentMealType}>{mealType}</Text>
          <Text style={styles.recentMealName} numberOfLines={1}>{foodNames}</Text>
        </View>
        <ChevronRight size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  if (isLoading || !onboarding.completed) {
    return null;
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </Text>
        </View>

        {/* Card 1: Today's Focus */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TODAY'S FOCUS</Text>
          <View style={styles.focusLines}>
            {todaysFocus.lines.map((line, index) => (
              <View key={index} style={styles.focusLine}>
                <Text style={styles.focusLabel}>{line.label}</Text>
                <Text style={[
                  styles.focusValue,
                  line.highlight && styles.focusValueHighlight
                ]}>
                  {line.value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.focusTip}>
            <Text style={styles.focusTipText}>{todaysFocus.tip}</Text>
          </View>
        </View>

        {/* Scan Button */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => router.push('/(tabs)/scan')}
          activeOpacity={0.9}
        >
          <Camera size={24} color={Colors.white} />
          <Text style={styles.scanButtonText}>SCAN NOW</Text>
        </TouchableOpacity>

        {/* Card 3: Recent Meals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>TODAY'S MEALS</Text>
          {todaysMeals.length > 0 ? (
            <View style={styles.recentMealsList}>
              {todaysMeals.slice(0, 3).map(renderRecentMeal)}
            </View>
          ) : (
            <View style={styles.emptyMeals}>
              <Text style={styles.emptyMealsText}>No meals logged today</Text>
              <Text style={styles.emptyMealsSubtext}>Scan your first meal to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },

  // Card styles
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginBottom: 16,
  },

  // Today's Focus styles
  focusLines: {
    gap: 12,
  },
  focusLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  focusValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  focusValueHighlight: {
    color: Colors.primary,
    fontWeight: '700',
  },
  focusTip: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  focusTipText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Scan Button styles
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 10,
  },
  scanButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Recent Meals styles
  recentMealsList: {
    gap: 12,
  },
  recentMealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentMealImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  recentMealInfo: {
    flex: 1,
  },
  recentMealType: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  recentMealName: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 2,
  },
  emptyMeals: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyMealsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  emptyMealsSubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
