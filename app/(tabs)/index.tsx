import { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Clock, TrendingUp, Camera, ChevronRight, AlertTriangle, Shield, Ban, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Meal, Trigger } from '@/types';
import { analyzeTriggers } from '@/lib/trigger-engine';

// Gut Risk Forecast calculation
type RiskLevel = 'low' | 'medium' | 'high';

interface GutRiskForecast {
  level: RiskLevel;
  emoji: string;
  color: string;
  message: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, meals, symptoms, onboarding, isLoading, getWeeklyStats, getTodaysMeals } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  const weeklyStats = getWeeklyStats();
  const todaysMeals = getTodaysMeals();

  // Run trigger analysis when data changes
  useEffect(() => {
    const detectedTriggers = analyzeTriggers(meals, symptoms);
    setTriggers(detectedTriggers);
  }, [meals, symptoms]);

  useEffect(() => {
    if (!isLoading && !onboarding.completed) {
      router.replace('/onboarding');
    }
  }, [isLoading, onboarding.completed, router]);

  // Calculate Gut Risk Forecast
  const gutRiskForecast = useMemo((): GutRiskForecast => {
    // Check recent symptoms (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentSymptoms = symptoms.filter(s => new Date(s.timestamp) >= oneDayAgo);

    // Calculate symptom severity
    const avgSeverity = recentSymptoms.length > 0
      ? recentSymptoms.reduce((sum, s) => sum + Math.max(s.bloat, s.pain) + (5 - s.energy), 0) / recentSymptoms.length
      : 0;

    // Check if any trigger foods were eaten recently
    const recentMealFoods = todaysMeals.flatMap(m => m.foods.map(f => f.name.toLowerCase()));
    const triggersEatenToday = triggers.filter(t =>
      recentMealFoods.some(food => food.includes(t.name.toLowerCase()))
    );

    // Determine risk level
    if (avgSeverity >= 6 || triggersEatenToday.length >= 2) {
      return {
        level: 'high',
        emoji: '🔴',
        color: Colors.danger,
        message: recentSymptoms.length > 0
          ? "You've had symptoms recently. Take it easy today."
          : triggersEatenToday.length > 0
            ? `Watch out - you had ${triggersEatenToday[0]?.name} which often bothers you.`
            : "Your gut may be sensitive today."
      };
    }

    if (avgSeverity >= 3 || triggersEatenToday.length >= 1) {
      return {
        level: 'medium',
        emoji: '🟡',
        color: Colors.warning,
        message: triggersEatenToday.length > 0
          ? `You had ${triggersEatenToday[0]?.name} - monitor how you feel.`
          : "Mild symptoms detected. Stick to safe foods."
      };
    }

    return {
      level: 'low',
      emoji: '🟢',
      color: Colors.success,
      message: "Looking good! Your gut is feeling great."
    };
  }, [symptoms, todaysMeals, triggers]);

  // Get top 3 triggers for display
  const topTriggers = useMemo(() => triggers.slice(0, 3), [triggers]);

  // Get safe foods (foods eaten without symptoms)
  const safeFoods = useMemo(() => {
    const foodsWithSymptoms = new Set<string>();

    // Find foods that are followed by symptoms
    symptoms.forEach(symptom => {
      const symptomTime = new Date(symptom.timestamp).getTime();
      const isSevere = symptom.bloat >= 3 || symptom.pain >= 3 || symptom.energy <= 2;

      if (isSevere) {
        meals.forEach(meal => {
          const mealTime = new Date(meal.timestamp).getTime();
          const diffHours = (symptomTime - mealTime) / (1000 * 60 * 60);
          if (diffHours >= 0.5 && diffHours <= 6) {
            meal.foods.forEach(f => foodsWithSymptoms.add(f.name.toLowerCase()));
          }
        });
      }
    });

    // Find foods eaten 3+ times without symptoms
    const foodCounts: Record<string, { name: string; count: number }> = {};
    meals.forEach(meal => {
      meal.foods.forEach(f => {
        const key = f.name.toLowerCase();
        if (!foodsWithSymptoms.has(key)) {
          if (!foodCounts[key]) {
            foodCounts[key] = { name: f.name, count: 0 };
          }
          foodCounts[key].count++;
        }
      });
    });

    return Object.values(foodCounts)
      .filter(f => f.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [meals, symptoms]);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getStatus = (meal: Meal): 'safe' | 'caution' | 'avoid' => {
    if (meal.status) return meal.status;
    if (meal.score >= 80) return 'safe';
    if (meal.score >= 50) return 'caution';
    return 'avoid';
  };

  const getStatusColor = (status: Trigger['status']) => {
    switch (status) {
      case 'avoid': return Colors.danger;
      case 'limit': return Colors.warning;
      case 'monitor': return '#FF9500';
      default: return Colors.warning;
    }
  };

  const renderMealCard = (meal: Meal) => {
    const status = getStatus(meal);
    const statusColor = status === 'safe' ? Colors.success :
      status === 'caution' ? Colors.warning : Colors.danger;

    return (
      <TouchableOpacity
        key={meal.id}
        style={styles.mealCard}
        onPress={() => router.push({ pathname: '/meal-detail', params: { mealId: meal.id } })}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: meal.imageUri }}
          style={styles.mealImage}
          contentFit="cover"
        />
        <View style={styles.mealInfo}>
          <Text style={styles.mealName} numberOfLines={1}>
            {meal.foods.map(f => f.name).join(' & ')}
          </Text>
          <View style={styles.mealMeta}>
            <Text style={[styles.mealStatus, { color: statusColor }]}>
              {status === 'safe' ? '✓ Safe' : status === 'caution' ? '⚠ Caution' : '✕ Avoid'}
            </Text>
            <Text style={styles.mealScore}>Score: {meal.score}/100</Text>
          </View>
          <View style={styles.mealTimeRow}>
            <Clock size={12} color={Colors.textTertiary} />
            <Text style={styles.mealTime}>{formatTime(meal.timestamp)}</Text>
          </View>
        </View>
        <ChevronRight size={20} color={Colors.textTertiary} />
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                Good {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
              </Text>
            </View>
            {(user?.streak || 0) > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakEmoji}>🔥</Text>
                <Text style={styles.streakText}>{user?.streak}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Gut Risk Forecast - PROMINENT */}
        <View style={[styles.riskCard, { borderLeftColor: gutRiskForecast.color }]}>
          <View style={styles.riskHeader}>
            <Text style={styles.riskEmoji}>{gutRiskForecast.emoji}</Text>
            <View style={styles.riskTextContainer}>
              <Text style={styles.riskTitle}>
                Today's Gut Risk: <Text style={{ color: gutRiskForecast.color, textTransform: 'capitalize' }}>{gutRiskForecast.level}</Text>
              </Text>
              <Text style={styles.riskMessage}>{gutRiskForecast.message}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.safeButton]}
            onPress={() => router.push('/food-lists')}
            activeOpacity={0.7}
          >
            <Shield size={20} color={Colors.success} />
            <Text style={styles.quickActionText}>Safe Foods</Text>
            <Text style={styles.quickActionCount}>{safeFoods.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickActionButton, styles.avoidButton]}
            onPress={() => router.push('/food-lists')}
            activeOpacity={0.7}
          >
            <Ban size={20} color={Colors.danger} />
            <Text style={styles.quickActionText}>Avoid</Text>
            <Text style={styles.quickActionCount}>{triggers.filter(t => t.status === 'avoid').length}</Text>
          </TouchableOpacity>
        </View>

        {/* Safe Foods Preview */}
        {safeFoods.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✅ Safe for You</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.safeFoodsList}>
              {safeFoods.map((food, index) => (
                <View key={index} style={styles.safeFoodChip}>
                  <Text style={styles.safeFoodText}>{food.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Today's Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
          {todaysMeals.length > 0 ? (
            <View style={styles.mealsList}>
              {todaysMeals.map(renderMealCard)}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptyState}
              onPress={() => router.push('/(tabs)/scan')}
              activeOpacity={0.8}
            >
              <Camera size={40} color={Colors.primary} />
              <Text style={styles.emptyText}>No meals yet today</Text>
              <Text style={styles.emptySubtext}>Tap to scan your first meal</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Large Scan FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: 20 }]}
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.9}
      >
        <Camera size={28} color={Colors.white} />
        <Text style={styles.fabText}>Scan Meal</Text>
      </TouchableOpacity>
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
    paddingBottom: 120,
  },
  header: {
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },

  // Risk Forecast Card
  riskCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  riskTextContainer: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  riskMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  safeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  avoidButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  quickActionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Triggers
  triggersList: {
    gap: 8,
  },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 12,
  },
  triggerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  triggerBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  triggerName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  triggerConfidence: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Safe Foods
  safeFoodsList: {
    gap: 8,
  },
  safeFoodChip: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  safeFoodText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: '600',
  },

  // Meals
  mealsList: {
    gap: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  mealInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mealName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  mealMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  mealStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  mealScore: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  mealTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealTime: {
    fontSize: 11,
    color: Colors.textTertiary,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.primary,
    marginTop: 4,
    fontWeight: '500',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    left: 20,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
  },
});
