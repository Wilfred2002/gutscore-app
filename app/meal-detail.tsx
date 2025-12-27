import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { X, ArrowLeft, Edit2, Trash2, Check, AlertTriangle, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

export default function MealDetailScreen() {
  const router = useRouter();
  const { mealId } = useLocalSearchParams<{ mealId: string }>();
  const insets = useSafeAreaInsets();
  const { meals, deleteMeal } = useApp();

  const meal = meals.find(m => m.id === mealId) || meals[0];

  // Safe defaults for potentially undefined properties
  const mealFoods = meal?.foods || [];
  const mealAnalysis = meal?.analysis || [];
  const mealTriggers = meal?.triggers || [];
  const mealSwaps = meal?.swaps || [];
  const gutScores = meal?.gutScores || { fodmap: 0, fermentation: 0, fiber_diversity: 0, probiotic: 0 };
  const fodmapRisk = gutScores.fodmap ?? 0;
  const fermentation = gutScores.fermentation ?? 0;
  const fiberDiversity = gutScores.fiber_diversity ?? 0;
  const probioticBoost = gutScores.probiotic ?? 0;

  // Collapsible state for Why This Score section
  const [showAnalysis, setShowAnalysis] = useState(false);

  if (!meal) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meal Details</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Meal not found</Text>
        </View>
      </View>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getScoreColor = (value: number, max: number) => {
    const percent = (value / max) * 100;
    if (percent <= 30) return Colors.success;
    if (percent <= 60) return Colors.warning;
    return Colors.danger;
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete this meal?',
      'This action cannot be undone.',
      [
        { text: 'Keep It', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMeal(meal.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meal Details</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.timestamp}>
          {formatDate(meal.timestamp)} · {formatTime(meal.timestamp)}
        </Text>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: meal.imageUri }}
            style={styles.mealImage}
            contentFit="cover"
          />
          <View style={[
            styles.scoreBadge,
            { backgroundColor: meal.score >= 70 ? Colors.success : meal.score >= 50 ? Colors.warning : Colors.danger }
          ]}>
            <Text style={styles.scoreBadgeText}>{meal.score}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Foods in This Meal</Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit2 size={16} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.foodsList}>
            {mealFoods.map((food, index) => (
              <View key={food.id || index} style={styles.foodItem}>
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodConfidence}>{food.confidence}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreCardTitle}>Your Gut Score Breakdown</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>FODMAP Risk</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(fodmapRisk, 100) }]}>
              {fodmapRisk}/100
            </Text>
            <Text style={styles.scoreStatus}>
              {fodmapRisk <= 30 ? 'Low' : fodmapRisk <= 60 ? 'Medium' : 'High'}
            </Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, {
              width: `${fodmapRisk}%`,
              backgroundColor: getScoreColor(fodmapRisk, 100)
            }]} />
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Fermentation</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(fermentation, 100) }]}>
              {fermentation}/100
            </Text>
            <Text style={styles.scoreStatus}>
              {fermentation <= 30 ? 'Low' : fermentation <= 60 ? 'Medium' : 'High'}
            </Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, {
              width: `${fermentation}%`,
              backgroundColor: getScoreColor(fermentation, 100)
            }]} />
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Fiber Diversity</Text>
            <Text style={[styles.scoreValue, { color: Colors.warning }]}>
              {fiberDiversity}/10
            </Text>
            <Text style={styles.scoreStatus}>Moderate</Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, {
              width: `${fiberDiversity * 10}%`,
              backgroundColor: Colors.warning
            }]} />
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Probiotic Impact</Text>
            <Text style={[styles.scoreValue, { color: Colors.textTertiary }]}>
              {probioticBoost}/5
            </Text>
            <Text style={styles.scoreStatus}>
              {probioticBoost <= 1 ? 'None' : probioticBoost <= 3 ? 'Some' : 'Good'}
            </Text>
          </View>
          <View style={styles.scoreBar}>
            <View style={[styles.scoreBarFill, {
              width: `${probioticBoost * 20}%`,
              backgroundColor: Colors.textTertiary
            }]} />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.analysisHeader}
            onPress={() => setShowAnalysis(!showAnalysis)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.analysisTitleGreen}>Why This Score?</Text>
              <Text style={styles.analysisSubtitle}>Tap to see how we analyzed this meal</Text>
            </View>
            {showAnalysis ? (
              <ChevronUp size={20} color={Colors.success} />
            ) : (
              <ChevronDown size={20} color={Colors.success} />
            )}
          </TouchableOpacity>
          {showAnalysis && (
            <>
              <View style={styles.analysisList}>
                {mealAnalysis.map((item, idx) => (
                  <View key={idx} style={styles.analysisItem}>
                    <Check size={16} color={Colors.success} />
                    <Text style={styles.analysisText}>{item}</Text>
                  </View>
                ))}
              </View>
              {mealTriggers.length > 0 && (
                <View style={styles.tipCard}>
                  <AlertTriangle size={16} color={Colors.warning} />
                  <Text style={styles.tipText}>
                    Tip: Consider swapping to whole grain options for better fiber diversity
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {mealTriggers.length > 0 && (
          <View style={[styles.section, styles.triggerSection]}>
            <Text style={styles.analysisTitleOrange}>Heads Up</Text>
            <Text style={styles.triggerSubtext}>
              These ingredients might not agree with everyone.
            </Text>
            {mealTriggers.map((trigger: string, index: number) => (
              <View key={index} style={styles.triggerRow}>
                <View style={styles.triggerInfo}>
                  <AlertTriangle size={16} color={Colors.warning} />
                  <Text style={styles.triggerText}>{trigger}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addTriggerButton}
                  onPress={() => {
                    Alert.alert('Added!', `"${trigger}" added to your triggers list.`);
                  }}
                >
                  <Text style={styles.addTriggerButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {mealSwaps.length > 0 && (
          <View style={[styles.section, styles.swapsSection]}>
            <Text style={styles.analysisTitleGreen}>Better Swaps</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.swapsList}>
                {mealSwaps.map((swap, index) => (
                  <TouchableOpacity key={swap.id || index} style={styles.swapCard}>
                    <Text style={styles.swapEmoji}>{swap.emoji}</Text>
                    <Text style={styles.swapName}>{swap.name}</Text>
                    <Text style={styles.swapScore}>Score: +{swap.scoreIncrease}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.deleteLink}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Trash2 size={14} color={Colors.textTertiary} />
          <Text style={styles.deleteLinkText}>Delete from History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  editButton: {
    padding: 4,
  },
  foodsList: {
    gap: 8,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 10,
  },
  foodEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  foodName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  foodConfidence: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  scoreCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  scoreCardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginRight: 8,
  },
  scoreStatus: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    width: 50,
    textAlign: 'right',
  },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  analysisHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  analysisTitleGreen: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.success,
    marginBottom: 0,
  },
  analysisSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  analysisTitleOrange: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.warning,
    marginBottom: 12,
  },
  analysisList: {
    gap: 8,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  analysisText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontStyle: 'italic',
  },
  triggerSection: {
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: -4,
  },
  triggerSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  triggerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  triggerText: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  addTriggerButton: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addTriggerButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  symptomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symptomText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
  },
  swapsSection: {
    backgroundColor: Colors.successLight,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: -4,
  },
  swapsList: {
    flexDirection: 'row',
    gap: 12,
  },
  swapCard: {
    backgroundColor: Colors.backgroundWhite,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
  },
  swapEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  swapName: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  swapScore: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600' as const,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  rescanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
  },
  rescanButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  deleteLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  deleteLinkText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textTertiary,
  },
});
