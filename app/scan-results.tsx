import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Edit2, RefreshCw, Check, AlertTriangle, Zap } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { mockFoods, mockSwaps } from '@/mocks/data';
import { Meal } from '@/types';
import { useState } from 'react';

export default function ScanResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addMeal } = useApp();
  const params = useLocalSearchParams();

  // Parse params or fallback to mock data (for testing directly)
  const isMock = !params.overallScore;
  const score = isMock ? 92 : Number(params.overallScore);

  const foods = isMock ? mockFoods : JSON.parse(params.foods as string);
  const gutScores = isMock ? {
    fodmap: 18,
    fermentation: 25,
    fiber_diversity: 8,
    probiotic: 2
  } : JSON.parse(params.gutScores as string);

  const analysis = isMock ? [
    'Low-FODMAP vegetables',
    'Easily digestible protein'
  ] : JSON.parse(params.analysis as string);

  const triggers = isMock ? [
    'You may have mild sensitivity to butter (lactose).'
  ] : JSON.parse(params.triggers as string);

  const swaps = isMock ? mockSwaps : JSON.parse(params.swaps as string);
  const imageUri = params.imageUri as string;

  const isOnboarding = params.onboarding === 'true';

  // Helper to determine status based on score
  const getStatusInfo = (score: number) => {
    if (score >= 80) return { text: 'Safe to Eat', color: Colors.success, title: 'Why is this meal safe?' };
    if (score >= 50) return { text: 'Proceed with Caution', color: Colors.warning, title: 'Meal Analysis' };
    return { text: 'Limit or Avoid', color: Colors.error, title: 'Why limit this?' };
  };

  const statusInfo = getStatusInfo(score);

  const { fodmap: fodmapRisk, fermentation, fiber_diversity: fiberDiversity, probiotic: probioticBoost } = gutScores;

  const getScoreColor = (value: number, max: number) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return Colors.success;
    if (percentage >= 50) return Colors.warning;
    return Colors.error;
  };

  const handleAddToLog = async () => {
    try {
      // Create new meal object
      const newMeal: Meal = {
        id: Date.now().toString(), // temporary ID
        foods,
        timestamp: new Date(),
        score,
        imageUri,
        gutScores,
        notes: '',
      };

      await addMeal(newMeal);

      if (isOnboarding) {
        router.replace('/onboarding/checklist');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error adding meal:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.mealImage} />
        )}

        <View style={styles.detectedCard}>
          <Text style={styles.sectionTitle}>Detected Foods</Text>
          <View style={styles.foodList}>
            {foods.map((food: any, index: number) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.foodEmoji}>{food.emoji}</Text>
                <Text style={styles.foodName}>{food.name}</Text>
                <Text style={styles.foodConfidence}>{food.confidence}%</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Edit2 size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Your Gut Score</Text>
          <Text style={styles.scoreValue}>{score}/100</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            {score >= 80 ? (
              <Check size={14} color={statusInfo.color} />
            ) : (
              <AlertTriangle size={14} color={statusInfo.color} />
            )}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>FODMAP Risk</Text>
              <Text style={[styles.scoreGridValue, { color: getScoreColor(100 - fodmapRisk, 100) }]}>
                {fodmapRisk}/100
              </Text>
              <Text style={styles.scoreGridStatus}>{fodmapRisk < 30 ? 'Low' : fodmapRisk < 70 ? 'Med' : 'High'}</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${fodmapRisk}%`, backgroundColor: getScoreColor(100 - fodmapRisk, 100) }]} />
              </View>
            </View>

            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>Fermentation</Text>
              <Text style={[styles.scoreGridValue, { color: getScoreColor(100 - fermentation, 100) }]}>
                {fermentation}/100
              </Text>
              <Text style={styles.scoreGridStatus}>{fermentation < 30 ? 'Low' : 'High'}</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${fermentation}%`, backgroundColor: getScoreColor(100 - fermentation, 100) }]} />
              </View>
            </View>

            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>Fiber Diversity</Text>
              <Text style={[styles.scoreGridValue, { color: Colors.warning }]}>
                {fiberDiversity}/10
              </Text>
              <Text style={styles.scoreGridStatus}>Moderate</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${fiberDiversity * 10}%`, backgroundColor: Colors.warning }]} />
              </View>
            </View>

            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>Probiotic Boost</Text>
              <Text style={[styles.scoreGridValue, { color: Colors.textTertiary }]}>
                {probioticBoost}/5
              </Text>
              <Text style={styles.scoreGridStatus}>None</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${probioticBoost * 20}%`, backgroundColor: Colors.textTertiary }]} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.analysisSection}>
          <Text style={[styles.analysisTitleGreen, { color: statusInfo.color }]}>{statusInfo.title}</Text>
          <View style={styles.analysisList}>
            {analysis.map((item: string, index: number) => (
              <View key={index} style={styles.analysisItem}>
                {score >= 80 ? (
                  <Check size={16} color={Colors.success} />
                ) : (
                  <Zap size={16} color={Colors.textSecondary} />
                )}
                <Text style={styles.analysisText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.analysisSection, styles.triggerSection]}>
          <Text style={styles.analysisTitleOrange}>Potential Triggers</Text>
          {triggers.length > 0 ? triggers.map((trigger: string, index: number) => (
            <View key={index} style={styles.triggerCard}>
              <AlertTriangle size={16} color={Colors.warning} />
              <Text style={styles.triggerText}>{trigger}</Text>
            </View>
          )) : (
            <Text style={styles.triggerText}>No triggers detected.</Text>
          )}
        </View>

        <View style={[styles.analysisSection, styles.swapsSection]}>
          <Text style={styles.analysisTitleGreen}>Better Swaps</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.swapsList}>
              {swaps.map((swap: any, index: number) => (
                <TouchableOpacity key={swap.id || index} style={styles.swapCard}>
                  <Text style={styles.swapEmoji}>{swap.emoji}</Text>
                  <Text style={styles.swapName}>{swap.name}</Text>
                  <Text style={styles.swapScore}>+{swap.scoreIncrease} pts</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleAddToLog}>
          <Text style={styles.primaryButtonText}>Add to Daily Log</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <RefreshCw size={20} color={Colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Retake Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundWhite,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    paddingBottom: 40,
  },
  mealImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  detectedCard: {
    margin: 20,
    marginTop: -40,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  foodList: {
    gap: 12,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
  },
  foodEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  foodName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  foodConfidence: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginRight: 12,
  },
  editButton: {
    padding: 4,
  },
  scoreCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginBottom: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
  },
  scoreGridItem: {
    width: '48%',
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
  },
  scoreGridLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  scoreGridValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 2,
  },
  scoreGridStatus: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  scoreBar: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  analysisSection: {
    margin: 20,
    marginTop: 0,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 20,
    padding: 20,
  },
  analysisTitleGreen: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.success,
    marginBottom: 12,
  },
  analysisTitleOrange: {
    fontSize: 15,
    fontWeight: '600',
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
    fontSize: 14,
    color: Colors.text,
  },
  triggerSection: {
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: -4,
    paddingHorizontal: 20,
  },
  triggerCard: {
    flexDirection: 'row',
    gap: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
  },
  swapsSection: {
    backgroundColor: Colors.successLight,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: -4,
    paddingHorizontal: 20,
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
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  swapScore: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
