import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Download, FileText, HelpCircle, Mail, Star, Flame } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useState } from 'react';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, resetApp } = useApp();
  
  const [mealReminders, setMealReminders] = useState(true);
  const [symptomCheckins, setSymptomCheckins] = useState(true);
  const [tipsInsights, setTipsInsights] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/onboarding');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await resetApp();
            router.replace('/onboarding');
          }
        },
      ]
    );
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'GS';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
          {user?.streak && user.streak > 0 && (
            <View style={styles.streakBadge}>
              <Flame size={14} color={Colors.warning} />
              <Text style={styles.streakText}>{user.streak}-day streak</Text>
            </View>
          )}
        </View>

        <View style={styles.subscriptionCard}>
          <Text style={styles.subscriptionTitle}>GutScore Pro</Text>
          <Text style={styles.subscriptionStatus}>Free plan · 3 scans/day remaining</Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
          </TouchableOpacity>
          <Text style={styles.subscriptionFeatures}>✓ Unlimited scans  ✓ AI coach  ✓ No ads</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <View>
                <Text style={styles.settingLabel}>Dietary Restrictions</Text>
                <View style={styles.tagContainer}>
                  {(user?.dietaryRestrictions || ['Vegetarian', 'Gluten-Free']).map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <ChevronRight size={20} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Text style={styles.settingLabel}>IBS Type</Text>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>IBS-D</Text>
                <ChevronRight size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
              <Text style={styles.settingLabel}>Allergies</Text>
              <View style={styles.settingValue}>
                <Text style={styles.settingValueText}>None</Text>
                <ChevronRight size={20} color={Colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.settingLabel}>Meal Reminders</Text>
                <Text style={styles.settingSubtext}>3x daily at 8am, 1pm, 7pm</Text>
              </View>
              <Switch
                value={mealReminders}
                onValueChange={setMealReminders}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={mealReminders ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.settingLabel}>Symptom Check-Ins</Text>
                <Text style={styles.settingSubtext}>Daily at 8pm</Text>
              </View>
              <Switch
                value={symptomCheckins}
                onValueChange={setSymptomCheckins}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={symptomCheckins ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.settingLabel}>Tips & Insights</Text>
              </View>
              <Switch
                value={tipsInsights}
                onValueChange={setTipsInsights}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={tipsInsights ? Colors.primary : Colors.textLight}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
              </View>
              <Switch
                value={marketingEmails}
                onValueChange={setMarketingEmails}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={marketingEmails ? Colors.primary : Colors.textLight}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <Download size={20} color={Colors.primary} />
              <Text style={styles.linkText}>Download My Data</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.linkText}>Privacy Policy</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <FileText size={20} color={Colors.primary} />
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <HelpCircle size={20} color={Colors.primary} />
              <Text style={styles.linkText}>FAQ</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <Mail size={20} color={Colors.primary} />
              <Text style={styles.linkText}>Contact Support</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.linkRow} activeOpacity={0.7}>
              <Star size={20} color={Colors.primary} />
              <Text style={styles.linkText}>Leave a Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dangerButton, styles.deleteButton]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>Delete Account</Text>
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
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: Colors.primary,
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  streakText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: '500' as const,
  },
  subscriptionCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subscriptionStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  subscriptionFeatures: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  settingValueText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  settingSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  linkText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  dangerSection: {
    gap: 12,
    marginBottom: 40,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'transparent',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.danger,
  },
});
