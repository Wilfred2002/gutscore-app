import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Clock, TrendingUp, Camera, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Meal } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, meals, onboarding, getWeeklyStats, getTodaysMeals } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const weeklyStats = getWeeklyStats();
  const todaysMeals = getTodaysMeals();

  useEffect(() => {
    if (!onboarding.completed) {
      router.replace('/onboarding');
    }
  }, [onboarding.completed, router]);

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

  const getDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  const renderMealCard = (meal: Meal) => {
    const statusColor = meal.status === 'safe' ? Colors.success : 
                       meal.status === 'caution' ? Colors.warning : Colors.danger;
    
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
              {meal.status === 'safe' ? '✓ Safe' : meal.status === 'caution' ? '⚠ Caution' : '✕ Avoid'}
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

  if (!onboarding.completed) {
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey {user?.name?.split(' ')[0] || 'there'}, {getDayName()} {getGreeting()}</Text>
            <View style={styles.timeRow}>
              <Clock size={14} color={Colors.textTertiary} />
              <Text style={styles.timeText}>
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Gut This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.avgScore || 78}</Text>
              <View style={styles.statChange}>
                <TrendingUp size={12} color={Colors.success} />
                <Text style={styles.statChangeText}>{weeklyStats.scoreChange}%</Text>
              </View>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.mealsScanned || meals.length}</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weeklyStats.triggersIdentified}</Text>
              <Text style={styles.statLabel}>Triggers</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today&apos;s Meals</Text>
          {todaysMeals.length > 0 ? (
            <View style={styles.mealsList}>
              {todaysMeals.map(renderMealCard)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Camera size={40} color={Colors.textTertiary} />
              <Text style={styles.emptyText}>No meals yet today</Text>
              <Text style={styles.emptySubtext}>Tap the camera to scan your first meal</Text>
            </View>
          )}
        </View>

        {meals.length > todaysMeals.length && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Meals</Text>
            <View style={styles.mealsList}>
              {meals.slice(0, 3).filter(m => !todaysMeals.includes(m)).map(renderMealCard)}
            </View>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: 20 }]}
        onPress={() => router.push('/(tabs)/scan')}
        activeOpacity={0.9}
      >
        <Camera size={24} color={Colors.white} />
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
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  statsCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statChangeText: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '500' as const,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});
