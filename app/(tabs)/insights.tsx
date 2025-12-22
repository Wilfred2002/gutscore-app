import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, Lightbulb } from 'lucide-react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import Colors from '@/constants/colors';
import { mockTriggers, mockWeeklyScores } from '@/mocks/data';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();

  const avgScore = Math.round(mockWeeklyScores.reduce((sum, d) => sum + d.score, 0) / mockWeeklyScores.length);

  const getTriggerColor = (status: string) => {
    if (status === 'avoid') return Colors.danger;
    if (status === 'limit') return Colors.warning;
    return Colors.warning;
  };

  const chartWidth = 300;
  const chartHeight = 120;
  const padding = 30;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - 40;

  const getPathData = () => {
    const points = mockWeeklyScores.map((d, i) => {
      const x = padding + (i / (mockWeeklyScores.length - 1)) * graphWidth;
      const y = chartHeight - 20 - ((d.score - 60) / 40) * graphHeight;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  };

  const getAreaPath = () => {
    const linePath = getPathData();
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
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={styles.periodText}>This Week</Text>
            <ChevronDown size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.triggersCard}>
          <Text style={styles.triggersTitle}>Your Top Triggers</Text>
          <View style={styles.triggersList}>
            {mockTriggers.map((trigger) => (
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
          <Text style={styles.triggersNote}>Based on 47 logs & symptom correlations</Text>
        </View>

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
              {mockWeeklyScores.map((d, i) => {
                const x = padding + (i / (mockWeeklyScores.length - 1)) * graphWidth;
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
              {mockWeeklyScores.map((d, i) => (
                <SvgText
                  key={i}
                  x={padding + (i / (mockWeeklyScores.length - 1)) * graphWidth}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fiber Diversity</Text>
          <View style={styles.fiberContainer}>
            <View style={styles.fiberRing}>
              <Svg width={120} height={120}>
                <Circle
                  cx={60}
                  cy={60}
                  r={50}
                  stroke={Colors.border}
                  strokeWidth={10}
                  fill="none"
                />
                <Circle
                  cx={60}
                  cy={60}
                  r={50}
                  stroke={Colors.primary}
                  strokeWidth={10}
                  fill="none"
                  strokeDasharray={`${(18/28) * 314} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </Svg>
              <View style={styles.fiberCenter}>
                <Text style={styles.fiberNumber}>18/28</Text>
                <Text style={styles.fiberLabel}>plant families</Text>
              </View>
            </View>
            <Text style={styles.fiberTip}>Aim for 30+ different plant foods weekly</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Symptom Heatmap</Text>
          <View style={styles.heatmapContainer}>
            <View style={styles.heatmapHeader}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <Text key={day} style={styles.heatmapDay}>{day}</Text>
              ))}
            </View>
            {['Bloating', 'Cramping', 'Gas', 'Energy'].map((symptom, rowIdx) => (
              <View key={symptom} style={styles.heatmapRow}>
                <Text style={styles.heatmapLabel}>{symptom}</Text>
                <View style={styles.heatmapCells}>
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => {
                    const intensity = Math.random();
                    const bgColor = intensity < 0.3 ? Colors.background :
                                   intensity < 0.6 ? Colors.warningLight :
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
        </View>

        <View style={styles.card}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Personalized Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>🥦 Add more soluble fiber (oats, carrots) - supports good bacteria</Text>
            <Text style={styles.tipItem}>💧 Increase water to 8+ glasses - aids digestion</Text>
            <Text style={styles.tipItem}>🔔 Log symptoms consistently - helps refine your profile</Text>
          </View>
          <TouchableOpacity style={styles.coachLink}>
            <Text style={styles.coachLinkText}>Get AI Coach Recommendations</Text>
          </TouchableOpacity>
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
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  periodText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
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
  coachLink: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  coachLinkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
