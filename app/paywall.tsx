import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Check, Crown, Sparkles, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useState } from 'react';

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'premium'>('pro');
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = {
    free: {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      features: ['3 scans/day', '7-day history', 'Basic trends', 'Ads'],
    },
    pro: {
      name: 'Pro',
      monthlyPrice: 4.99,
      annualPrice: 49.99,
      features: ['Unlimited scans', '6-month history', 'Trigger detection', 'No ads'],
    },
    premium: {
      name: 'Premium',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: ['Everything in Pro', 'AI Gut Coach', 'Wearable sync', 'Family sharing'],
    },
  };

  const handleSubscribe = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
      >
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <X size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Crown size={40} color={Colors.white} />
          <Text style={styles.headerTitle}>Unlock Pro Features</Text>
          <Text style={styles.headerSubtitle}>Take control of your gut health</Text>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.plansContainer}>
          <TouchableOpacity 
            style={[styles.planCard, styles.freePlanCard]}
            activeOpacity={0.7}
          >
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>Current Plan</Text>
            </View>
            <Text style={styles.planName}>{plans.free.name}</Text>
            <Text style={styles.planPrice}>$0</Text>
            <Text style={styles.planPeriod}>/month</Text>
            <View style={styles.planFeatures}>
              {plans.free.features.map((feature, idx) => (
                <Text key={idx} style={styles.featureText}>• {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.planCard, 
              styles.proPlanCard,
              selectedPlan === 'pro' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('pro')}
            activeOpacity={0.8}
          >
            <View style={[styles.planBadge, styles.popularBadge]}>
              <Sparkles size={12} color={Colors.white} />
              <Text style={styles.popularBadgeText}>Most Popular</Text>
            </View>
            <Text style={styles.proPlanName}>{plans.pro.name}</Text>
            <Text style={styles.proPlanPrice}>
              ${isAnnual ? (plans.pro.annualPrice / 12).toFixed(2) : plans.pro.monthlyPrice}
            </Text>
            <Text style={styles.proPlanPeriod}>/month</Text>
            {isAnnual && (
              <Text style={styles.annualNote}>Billed annually (${plans.pro.annualPrice})</Text>
            )}
            <View style={styles.planFeatures}>
              {plans.pro.features.map((feature, idx) => (
                <View key={idx} style={styles.proFeatureRow}>
                  <Check size={14} color={Colors.white} />
                  <Text style={styles.proFeatureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.planCard,
              selectedPlan === 'premium' && styles.selectedPlan
            ]}
            onPress={() => setSelectedPlan('premium')}
            activeOpacity={0.8}
          >
            <View style={styles.premiumHeader}>
              <Zap size={16} color={Colors.primary} />
              <Text style={styles.premiumLabel}>Advanced</Text>
            </View>
            <Text style={styles.planName}>{plans.premium.name}</Text>
            <Text style={styles.planPrice}>
              ${isAnnual ? (plans.premium.annualPrice / 12).toFixed(2) : plans.premium.monthlyPrice}
            </Text>
            <Text style={styles.planPeriod}>/month</Text>
            {isAnnual && (
              <Text style={styles.annualNoteGray}>Billed annually (${plans.premium.annualPrice})</Text>
            )}
            <View style={styles.planFeatures}>
              {plans.premium.features.map((feature, idx) => (
                <Text key={idx} style={styles.featureText}>• {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.annualToggle}
          onPress={() => setIsAnnual(!isAnnual)}
          activeOpacity={0.7}
        >
          <View style={[styles.toggleSwitch, isAnnual && styles.toggleSwitchActive]}>
            <View style={[styles.toggleKnob, isAnnual && styles.toggleKnobActive]} />
          </View>
          <Text style={styles.annualToggleText}>
            Save 17% with annual billing
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <Text style={styles.subscribeButtonText}>
            Continue with {selectedPlan === 'pro' ? 'Pro' : 'Premium'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.notInterestedButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.notInterestedText}>Not interested</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          7-day free trial included. Cancel anytime.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerGradient: {
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  freePlanCard: {
    opacity: 0.7,
  },
  proPlanCard: {
    backgroundColor: Colors.primary,
  },
  selectedPlan: {
    borderColor: Colors.primary,
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  popularBadge: {
    backgroundColor: Colors.warning,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  proPlanName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 8,
  },
  proPlanPrice: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.white,
    marginTop: 8,
  },
  planPeriod: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: -4,
  },
  proPlanPeriod: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: -4,
  },
  annualNote: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  annualNoteGray: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  planFeatures: {
    marginTop: 16,
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  proFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proFeatureText: {
    fontSize: 13,
    color: Colors.white,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  premiumLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  annualToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    padding: 16,
    backgroundColor: 'rgba(32, 141, 141, 0.1)',
    borderRadius: 12,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  toggleKnobActive: {
    marginLeft: 20,
  },
  annualToggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: Colors.backgroundWhite,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  notInterestedButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notInterestedText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
