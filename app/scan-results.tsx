import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Edit2, RefreshCw, Check, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { mockFoods, mockSwaps } from '@/mocks/data';
import { Meal } from '@/types';

export default function ScanResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addMeal } = useApp();

  const score = 92;
  const fodmapRisk = 18;
  const fermentation = 25;
  const fiberDiversity = 8;
  const probioticBoost = 2;

  const handleAddToMeal = async () => {
    const newMeal: Meal = {
      id: Date.now().toString(),
      timestamp: new Date(),
      imageUri: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
      foods: mockFoods,
      score,
      fodmapRisk,
      fermentation,
      fiberDiversity,
      probioticBoost,
      status: 'safe',
      analysis: [
        'Low-FODMAP vegetables',
        'Easily digestible protein',
      ],
      triggers: [
        'You may have mild sensitivity to butter (lactose). Consider lactose-free alternative.',
      ],
      swaps: mockSwaps,
    };

    await addMeal(newMeal);
    router.back();
    router.push('/(tabs)');
  };

  const getScoreColor = (value: number, max: number) => {
    const percent = (value / max) * 100;
    if (percent <= 30) return Colors.success;
    if (percent <= 60) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.dragHandle} />
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Meal Analysis</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Foods Detected</Text>
          <View style={styles.foodsList}>
            {mockFoods.map((food) => (
              <View key={food.id} style={styles.foodItem}>
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
          <View style={styles.statusBadge}>
            <Check size={14} color={Colors.white} />
            <Text style={styles.statusText}>Safe to Eat</Text>
          </View>

          <View style={styles.scoreGrid}>
            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>FODMAP Risk</Text>
              <Text style={[styles.scoreGridValue, { color: getScoreColor(fodmapRisk, 100) }]}>
                {fodmapRisk}/100
              </Text>
              <Text style={styles.scoreGridStatus}>Low</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${fodmapRisk}%`, backgroundColor: getScoreColor(fodmapRisk, 100) }]} />
              </View>
            </View>

            <View style={styles.scoreGridItem}>
              <Text style={styles.scoreGridLabel}>Fermentation</Text>
              <Text style={[styles.scoreGridValue, { color: getScoreColor(fermentation, 100) }]}>
                {fermentation}/100
              </Text>
              <Text style={styles.scoreGridStatus}>Low</Text>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { width: `${fermentation}%`, backgroundColor: getScoreColor(fermentation, 100) }]} />
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
          <Text style={styles.analysisTitleGreen}>Why is this meal safe?</Text>
          <View style={styles.analysisList}>
            <View style={styles.analysisItem}>
              <Check size={16} color={Colors.success} />
              <Text style={styles.analysisText}>Low-FODMAP vegetables</Text>
            </View>
            <View style={styles.analysisItem}>
              <Check size={16} color={Colors.success} />
              <Text style={styles.analysisText}>Easily digestible protein</Text>
            </View>
          </View>
        </View>

        <View style={[styles.analysisSection, styles.triggerSection]}>
          <Text style={styles.analysisTitleOrange}>Potential Triggers</Text>
          <View style={styles.triggerCard}>
            <AlertTriangle size={16} color={Colors.warning} />
            <Text style={styles.triggerText}>
              You may have mild sensitivity to butter (lactose). Consider lactose-free alternative.
            </Text>
          </View>
        </View>

        <View style={[styles.analysisSection, styles.swapsSection]}>
          <Text style={styles.analysisTitleGreen}>Better Swaps</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.swapsList}>
              {mockSwaps.map((swap) => (
                <TouchableOpacity key={swap.id} style={styles.swapCard}>
                  <Text style={styles.swapEmoji}>{swap.emoji}</Text>
                  <Text style={styles.swapName}>{swap.name}</Text>
                  <Text style={styles.swapScore}>+{swap.scoreIncrease} pts</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleAddToMeal}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Add to Meal Log</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <RefreshCw size={18} color={Colors.textSecondary} />
          <Text style={styles.secondaryButtonText}>Rescan</Text>
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
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
    marginRight: 12,
  },
  editButton: {
    padding: 4,
  },
  scoreCard: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.white,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  scoreGrid: {
    width: '100%',
    gap: 12,
  },
  scoreGridItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 10,
  },
  scoreGridLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  scoreGridValue: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  scoreGridStatus: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisTitleGreen: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.success,
    marginBottom: 12,
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
    fontWeight: '500' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  swapScore: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600' as const,
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
    fontWeight: '600' as const,
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
    fontWeight: '500' as const,
  },
});
