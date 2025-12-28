import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lightbulb } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { analyzeTriggers } from '@/lib/trigger-engine';
import { generateTips, calculateProgress, calculateSafeFoods, detectPatterns, calculateFodmapExposure } from '@/lib/insights-engine';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { meals, symptoms, user } = useApp();

  // State for FODMAP week navigation
  const [fodmapWeekOffset, setFodmapWeekOffset] = useState(0);

  // Calculate real triggers
  const triggers = useMemo(() => analyzeTriggers(meals, symptoms), [meals, symptoms]);

  // Calculate progress metrics for dashboard
  const progress = useMemo(() => calculateProgress(meals, symptoms), [meals, symptoms]);

  // Calculate safe foods (foods eaten 3+ times without symptoms)
  const safeFoods = useMemo(() => calculateSafeFoods(meals, symptoms), [meals, symptoms]);

  // Detect patterns in user's data
  const patterns = useMemo(() => detectPatterns(meals, symptoms), [meals, symptoms]);

  // Calculate FODMAP exposure for the selected week
  const fodmapExposure = useMemo(() =>
    calculateFodmapExposure(meals, symptoms, fodmapWeekOffset),
    [meals, symptoms, fodmapWeekOffset]
  );

  // Helper to get week label
  const getFodmapWeekLabel = () => {
    if (fodmapWeekOffset === 0) return 'This Week';
    if (fodmapWeekOffset === 1) return 'Last Week';
    return `${fodmapWeekOffset} Weeks Ago`;
  };

  // Calculate weekly scores from real meals
  const weeklyScores = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const scores = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayMeals = meals.filter(m => {
        const mealDate = new Date(m.timestamp);
        return mealDate.toDateString() === date.toDateString();
      });
      const avgScore = dayMeals.length > 0
        ? Math.round(dayMeals.reduce((sum, m) => sum + m.score, 0) / dayMeals.length)
        : 0;
      scores.push({ day: days[date.getDay()], score: avgScore || 70 });
    }
    return scores;
  }, [meals]);

  // Calculate top foods
  const topFoods = useMemo(() => {
    const foodCounts: Record<string, { count: number; totalScore: number; name: string }> = {};
    meals.forEach(meal => {
      meal.foods.forEach(food => {
        if (!foodCounts[food.name]) {
          foodCounts[food.name] = { count: 0, totalScore: 0, name: food.name };
        }
        foodCounts[food.name].count++;
        foodCounts[food.name].totalScore += meal.score;
      });
    });
    return Object.values(foodCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(f => ({ ...f, avgScore: Math.round(f.totalScore / f.count) }));
  }, [meals]);

  // Calculate fiber diversity (unique plant foods)
  const fiberDiversity = useMemo(() => {
    const uniqueFoods = new Set<string>();
    meals.forEach(meal => {
      meal.foods.forEach(food => uniqueFoods.add(food.name.toLowerCase()));
    });
    return uniqueFoods.size;
  }, [meals]);

  // Calculate symptom frequency based on new model
  const symptomFrequency = useMemo(() => {
    const counts = { bloat: 0, pain: 0, lowEnergy: 0 };
    symptoms.forEach(s => {
      if (s.bloat >= 3) counts.bloat++;
      if (s.pain >= 3) counts.pain++;
      if (s.energy <= 2) counts.lowEnergy++;
    });
    return [
      ['Bloating', counts.bloat],
      ['Pain', counts.pain],
      ['Low Energy', counts.lowEnergy],
    ].filter(([, count]) => (count as number) > 0).sort((a, b) => (b[1] as number) - (a[1] as number));
  }, [symptoms]);

  // Calculate symptom heatmap data (real data, not random)
  const symptomHeatmap = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const heatmapData: { day: string; bloat: number; pain: number; energy: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayIndex = date.getDay();

      const daySymptoms = symptoms.filter(s => {
        const symptomDate = new Date(s.timestamp);
        return symptomDate.toDateString() === date.toDateString();
      });

      heatmapData.push({
        day: days[dayIndex === 0 ? 6 : dayIndex - 1], // Adjust for Mon-Sun order
        bloat: daySymptoms.length > 0
          ? daySymptoms.reduce((sum, s) => sum + s.bloat, 0) / daySymptoms.length
          : 0,
        pain: daySymptoms.length > 0
          ? daySymptoms.reduce((sum, s) => sum + s.pain, 0) / daySymptoms.length
          : 0,
        energy: daySymptoms.length > 0
          ? 5 - (daySymptoms.reduce((sum, s) => sum + s.energy, 0) / daySymptoms.length) // Invert so low energy = worse
          : 0
      });
    }
    return heatmapData;
  }, [symptoms]);

  const avgScore = weeklyScores.length > 0
    ? Math.round(weeklyScores.reduce((sum, d) => sum + d.score, 0) / weeklyScores.length)
    : 0;

  // Generate dynamic tips based on user data
  const dynamicTips = useMemo(() =>
    generateTips(meals, symptoms, triggers, fiberDiversity),
    [meals, symptoms, triggers, fiberDiversity]
  );

  // Chart dimensions
  const chartWidth = 300;
  const chartHeight = 120;
  const padding = 30;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - 40;

  const getTriggerColor = (status: string) => {
    if (status === 'avoid') return Colors.danger;
    if (status === 'limit') return Colors.warning;
    return Colors.warning;
  };

  const getPathData = () => {
    if (weeklyScores.length < 2) return '';
    const points = weeklyScores.map((d, i) => {
      const x = padding + (i / (weeklyScores.length - 1)) * graphWidth;
      const y = chartHeight - 20 - ((d.score - 60) / 40) * graphHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  };

  const getAreaPath = () => {
    const linePath = getPathData();
    if (!linePath) return '';
    const lastX = padding + graphWidth;
    const firstX = padding;
    const bottomY = chartHeight - 20;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Insights</Text>
        </View>

        {/* Progress Dashboard */}
        {progress.mealsLogged >= 3 ? (
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>This Week's Progress</Text>
            <View style={styles.progressMetrics}>
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>{progress.avgScore}</Text>
                <Text style={styles.progressLabel}>Avg Score</Text>
                {progress.weekOverWeek !== 0 && (
                  <Text style={[
                    styles.progressChange,
                    { color: progress.weekOverWeek > 0 ? Colors.success : Colors.danger }
                  ]}>
                    {progress.weekOverWeek > 0 ? '+' : ''}{progress.weekOverWeek} vs last week
                  </Text>
                )}
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>{progress.goodDaysCount}</Text>
                <Text style={styles.progressLabel}>Good Days</Text>
                <Text style={styles.progressNote}>score ≥80</Text>
              </View>
              <View style={styles.progressDivider} />
              <View style={styles.progressMetric}>
                <Text style={styles.progressValue}>{progress.symptomFreeStreak}</Text>
                <Text style={styles.progressLabel}>Day Streak</Text>
                <Text style={styles.progressNote}>symptom-free</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.emptyStateText}>Log 3+ meals this week to see your progress</Text>
          </View>
        )}

        {/* Top Triggers Card */}
        <View style={styles.triggersCard}>
          <Text style={styles.triggersTitle}>Your Top Triggers</Text>
          {triggers.length > 0 ? (
            <View style={styles.triggersList}>
              {triggers.slice(0, 4).map((trigger) => (
                <View key={trigger.id} style={styles.triggerItem}>
                  <View style={styles.triggerInfo}>
                    <Text style={styles.triggerName}>{trigger.name}</Text>
                    <Text style={[styles.triggerStatus, { color: getTriggerColor(trigger.status) }]}>
                      {trigger.confidence}% confidence · {trigger.status.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.triggerBar}>
                    <View
                      style={[
                        styles.triggerBarFill,
                        {
                          width: `${trigger.confidence}%`,
                          backgroundColor: getTriggerColor(trigger.status)
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noTriggersText}>Log more meals and symptoms to detect triggers</Text>
          )}
          <Text style={styles.triggersNote}>Based on {meals.length} meals & {symptoms.length} symptom logs</Text>
        </View>

        {/* Safe Foods Card */}
        {safeFoods.length > 0 ? (
          <View style={styles.safeFoodsCard}>
            <Text style={styles.safeFoodsTitle}>Your Safe Foods</Text>
            <View style={styles.safeFoodsList}>
              {safeFoods.slice(0, 5).map((food, index) => (
                <View key={index} style={styles.safeFoodItem}>
                  <View style={styles.safeFoodInfo}>
                    <Text style={styles.safeFoodCheck}>✓</Text>
                    <Text style={styles.safeFoodName}>{food.name}</Text>
                  </View>
                  <Text style={styles.safeFoodCount}>Eaten {food.count}x</Text>
                </View>
              ))}
            </View>
            <Text style={styles.safeFoodsNote}>Foods eaten 3+ times without symptoms</Text>
          </View>
        ) : meals.length >= 5 && symptoms.length >= 2 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Safe Foods</Text>
            <Text style={styles.emptyStateText}>Keep logging to identify your safe foods</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gut Health Score Trend</Text>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight}>
              <Path
                d={getAreaPath()}
                fill="rgba(32, 141, 141, 0.1)"
              />
              <Path
                d={getPathData()}
                stroke={Colors.primary}
                strokeWidth={2}
                fill="none"
              />
              {weeklyScores.map((d, i) => {
                const x = padding + (i / Math.max(weeklyScores.length - 1, 1)) * graphWidth;
                const y = chartHeight - 20 - ((d.score - 60) / 40) * graphHeight;
                return (
                  <Circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={Colors.primary}
                  />
                );
              })}
              <Line
                x1={padding}
                y1={chartHeight - 20 - ((avgScore - 60) / 40) * graphHeight}
                x2={padding + graphWidth}
                y2={chartHeight - 20 - ((avgScore - 60) / 40) * graphHeight}
                stroke={Colors.textTertiary}
                strokeWidth={1}
                strokeDasharray="4,4"
              />
              {weeklyScores.map((d, i) => (
                <SvgText
                  key={i}
                  x={padding + (i / Math.max(weeklyScores.length - 1, 1)) * graphWidth}
                  y={chartHeight - 5}
                  fontSize={10}
                  fill={Colors.textTertiary}
                  textAnchor="middle"
                >
                  {d.day}
                </SvgText>
              ))}
            </Svg>
          </View>
          <Text style={styles.chartLegend}>Your average: {avgScore}/100</Text>
        </View>

        {/* Pattern Discoveries */}
        {patterns.length > 0 && (
          <View style={styles.card}>
            <View style={styles.patternsHeader}>
              <Lightbulb size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Discoveries</Text>
            </View>
            <View style={styles.patternsList}>
              {patterns.map((pattern, index) => (
                <Text key={index} style={styles.patternItem}>{pattern.insight}</Text>
              ))}
            </View>
          </View>
        )}

        {/* FODMAP Exposure Card */}
        {fodmapExposure.totalMeals > 0 ? (
          <View style={styles.card}>
            <View style={styles.fodmapHeader}>
              <Text style={styles.cardTitle}>FODMAP Exposure</Text>
              <View style={styles.fodmapNav}>
                <TouchableOpacity
                  onPress={() => setFodmapWeekOffset(prev => prev + 1)}
                  style={styles.fodmapNavButton}
                  disabled={fodmapWeekOffset >= 4}
                >
                  <ChevronLeft size={20} color={fodmapWeekOffset >= 4 ? Colors.textLight : Colors.primary} />
                </TouchableOpacity>
                <Text style={styles.fodmapWeekLabel}>{getFodmapWeekLabel()}</Text>
                <TouchableOpacity
                  onPress={() => setFodmapWeekOffset(prev => Math.max(0, prev - 1))}
                  style={styles.fodmapNavButton}
                  disabled={fodmapWeekOffset === 0}
                >
                  <ChevronRight size={20} color={fodmapWeekOffset === 0 ? Colors.textLight : Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fodmapBars}>
              <View style={styles.fodmapRow}>
                <View style={styles.fodmapLabelContainer}>
                  <View style={[styles.fodmapDot, { backgroundColor: Colors.danger }]} />
                  <Text style={styles.fodmapLabel}>High</Text>
                </View>
                <View style={styles.fodmapBarContainer}>
                  <View style={[styles.fodmapBar, styles.fodmapBarHigh, { width: `${Math.min((fodmapExposure.high / Math.max(fodmapExposure.totalMeals, 1)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.fodmapCount}>{fodmapExposure.high}</Text>
              </View>
              <View style={styles.fodmapRow}>
                <View style={styles.fodmapLabelContainer}>
                  <View style={[styles.fodmapDot, { backgroundColor: Colors.warning }]} />
                  <Text style={styles.fodmapLabel}>Medium</Text>
                </View>
                <View style={styles.fodmapBarContainer}>
                  <View style={[styles.fodmapBar, styles.fodmapBarMedium, { width: `${Math.min((fodmapExposure.medium / Math.max(fodmapExposure.totalMeals, 1)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.fodmapCount}>{fodmapExposure.medium}</Text>
              </View>
              <View style={styles.fodmapRow}>
                <View style={styles.fodmapLabelContainer}>
                  <View style={[styles.fodmapDot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.fodmapLabel}>Low</Text>
                </View>
                <View style={styles.fodmapBarContainer}>
                  <View style={[styles.fodmapBar, styles.fodmapBarLow, { width: `${Math.min((fodmapExposure.low / Math.max(fodmapExposure.totalMeals, 1)) * 100, 100)}%` }]} />
                </View>
                <Text style={styles.fodmapCount}>{fodmapExposure.low}</Text>
              </View>
            </View>

            {fodmapExposure.high > 0 && fodmapExposure.correlation > 0 && (
              <View style={styles.fodmapCorrelation}>
                <Text style={styles.fodmapCorrelationText}>
                  {fodmapExposure.symptomDaysAfterHigh} symptom day{fodmapExposure.symptomDaysAfterHigh !== 1 ? 's' : ''} after high FODMAP meals ({fodmapExposure.correlation}% correlation)
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>FODMAP Exposure</Text>
            <Text style={styles.emptyStateText}>Scan meals to track your FODMAP intake</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Symptom Heatmap</Text>
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapHeader}>
              {symptomHeatmap.map((day, idx) => (
                <Text key={idx} style={styles.heatmapDay}>{day.day}</Text>
              ))}
            </View>
            {[
              { label: 'Bloating', key: 'bloat' as const },
              { label: 'Pain', key: 'pain' as const },
              { label: 'Low Energy', key: 'energy' as const }
            ].map((symptom) => (
              <View key={symptom.label} style={styles.heatmapRow}>
                <Text style={styles.heatmapLabel}>{symptom.label}</Text>
                <View style={styles.heatmapCells}>
                  {symptomHeatmap.map((dayData, dayIdx) => {
                    const intensity = dayData[symptom.key] / 5; // Normalize to 0-1
                    const bgColor = intensity === 0 ? Colors.border :
                      intensity < 0.4 ? Colors.background :
                      intensity < 0.7 ? Colors.warningLight :
                        Colors.dangerLight;
                    return (
                      <View
                        key={dayIdx}
                        style={[styles.heatmapCell, { backgroundColor: bgColor }]}
                      />
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
          {symptoms.length === 0 && (
            <Text style={styles.heatmapEmpty}>Log symptoms to see patterns</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Personalized Tips</Text>
          </View>
          <View style={styles.tipsList}>
            {dynamicTips.map((tip, index) => (
              <Text key={index} style={styles.tipItem}>{tip}</Text>
            ))}
          </View>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  // Progress Dashboard styles
  progressCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  progressMetrics: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    alignItems: 'flex-start' as const,
  },
  progressMetric: {
    flex: 1,
    alignItems: 'center' as const,
  },
  progressValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressChange: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  progressNote: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  progressDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  // Safe Foods styles
  safeFoodsCard: {
    backgroundColor: Colors.success,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  safeFoodsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 16,
  },
  safeFoodsList: {
    gap: 10,
  },
  safeFoodItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
  },
  safeFoodInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  safeFoodCheck: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  safeFoodName: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500' as const,
  },
  safeFoodCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  safeFoodsNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  // Patterns styles
  patternsHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 12,
  },
  patternsList: {
    gap: 10,
  },
  patternItem: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    paddingLeft: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryLight,
  },
  // Empty state styles
  emptyStateText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center' as const,
    paddingVertical: 20,
    fontStyle: 'italic' as const,
  },
  // FODMAP Exposure styles
  fodmapHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  fodmapNav: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
  },
  fodmapNavButton: {
    padding: 4,
  },
  fodmapWeekLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
    minWidth: 80,
    textAlign: 'center' as const,
  },
  fodmapBars: {
    gap: 12,
  },
  fodmapRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  fodmapLabelContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: 70,
    gap: 6,
  },
  fodmapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fodmapLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  fodmapBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden' as const,
  },
  fodmapBar: {
    height: '100%' as const,
    borderRadius: 4,
  },
  fodmapBarHigh: {
    backgroundColor: Colors.danger,
  },
  fodmapBarMedium: {
    backgroundColor: Colors.warning,
  },
  fodmapBarLow: {
    backgroundColor: Colors.success,
  },
  fodmapCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    width: 24,
    textAlign: 'right' as const,
  },
  fodmapCorrelation: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  fodmapCorrelationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center' as const,
  },
  triggersCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  triggersTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 16,
  },
  triggersList: {
    gap: 12,
  },
  triggerItem: {
    gap: 6,
  },
  triggerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerName: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500' as const,
  },
  triggerStatus: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  triggerBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  triggerBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  noTriggersText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: 16,
  },
  triggersNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chartLegend: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
  },
  fiberContainer: {
    alignItems: 'center',
  },
  fiberRing: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  fiberCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fiberNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  fiberLabel: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  fiberTip: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 16,
    textAlign: 'center',
  },
  heatmapContainer: {
    gap: 8,
  },
  heatmapHeader: {
    flexDirection: 'row',
    marginLeft: 70,
    gap: 4,
  },
  heatmapDay: {
    flex: 1,
    fontSize: 10,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heatmapLabel: {
    width: 66,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  heatmapCells: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  heatmapCell: {
    flex: 1,
    height: 24,
    borderRadius: 4,
  },
  heatmapEmpty: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
});
