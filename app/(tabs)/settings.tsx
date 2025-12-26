import { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Bell, Crown, FileText, Trash2, Mail, ChevronRight, LogOut, Download, HelpCircle, Star, Flame } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type TabType = 'profile' | 'settings';

export default function ProfileSettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut, resetApp } = useApp();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [mealReminders, setMealReminders] = useState(true);

    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                        router.replace('/onboarding');
                    }
                }
            ]
        );
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "This will permanently delete your account and all data. This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await resetApp();
                        router.replace('/onboarding');
                    }
                }
            ]
        );
    };

    const handleExportData = () => {
        Alert.alert(
            "Export Data",
            "Your gut health report will be generated and ready to share.",
            [{ text: "OK" }]
        );
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'GS';

    const renderProfileTab = () => (
        <>
            {/* Profile Header */}
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

            {/* Subscription Card */}
            <View style={styles.subscriptionCard}>
                <View style={styles.subscriptionRow}>
                    <Crown size={20} color={user?.isPro ? Colors.warning : Colors.textSecondary} />
                    <View style={styles.subscriptionInfo}>
                        <Text style={styles.subscriptionTitle}>
                            {user?.isPro ? 'Pro Member' : 'Free Plan'}
                        </Text>
                        <Text style={styles.subscriptionStatus}>
                            {user?.isPro ? 'Unlimited scans, full history' : '3 scans/day remaining'}
                        </Text>
                    </View>
                </View>
                {!user?.isPro && (
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={() => router.push('/paywall')}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Preferences */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.card}>
                    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                        <Text style={styles.settingLabel}>Dietary Restrictions</Text>
                        <View style={styles.settingValue}>
                            <Text style={styles.settingValueText}>
                                {(user?.dietaryRestrictions || []).length > 0
                                    ? user?.dietaryRestrictions?.join(', ')
                                    : 'None set'}
                            </Text>
                            <ChevronRight size={20} color={Colors.textTertiary} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                        <Text style={styles.settingLabel}>IBS Type</Text>
                        <View style={styles.settingValue}>
                            <Text style={styles.settingValueText}>
                                {user?.hasIBS ? 'IBS-D' : 'Not specified'}
                            </Text>
                            <ChevronRight size={20} color={Colors.textTertiary} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Support */}
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
        </>
    );

    const renderSettingsTab = () => (
        <>
            {/* Notifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.card}>
                    <View style={styles.toggleRow}>
                        <View style={styles.settingLeft}>
                            <Bell size={20} color={Colors.textSecondary} />
                            <Text style={styles.settingLabel}>Push Notifications</Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={setNotificationsEnabled}
                            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                            thumbColor={notificationsEnabled ? Colors.primary : Colors.textTertiary}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.toggleRow}>
                        <View style={styles.settingLeft}>
                            <Text style={styles.settingLabel}>Meal Reminders</Text>
                        </View>
                        <Switch
                            value={mealReminders}
                            onValueChange={setMealReminders}
                            trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                            thumbColor={mealReminders ? Colors.primary : Colors.textTertiary}
                        />
                    </View>
                </View>
            </View>

            {/* Data */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Data</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleExportData}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingLeft}>
                            <Download size={20} color={Colors.textSecondary} />
                            <Text style={styles.settingLabel}>Export Health Report</Text>
                        </View>
                        <ChevronRight size={20} color={Colors.textTertiary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Privacy */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                <View style={styles.card}>
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

            {/* Danger Zone */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleSignOut}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingLeft}>
                            <LogOut size={20} color={Colors.danger} />
                            <Text style={[styles.settingLabel, { color: Colors.danger }]}>Sign Out</Text>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.divider} />

                    <TouchableOpacity
                        style={styles.settingRow}
                        onPress={handleDeleteAccount}
                        activeOpacity={0.7}
                    >
                        <View style={styles.settingLeft}>
                            <Trash2 size={20} color={Colors.danger} />
                            <Text style={[styles.settingLabel, { color: Colors.danger }]}>Delete Account</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.version}>GutScore v1.0.0</Text>
        </>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header with Segment Control */}
            <View style={styles.header}>
                <View style={styles.segmentControl}>
                    <TouchableOpacity
                        style={[styles.segmentButton, activeTab === 'profile' && styles.segmentButtonActive]}
                        onPress={() => setActiveTab('profile')}
                        activeOpacity={0.7}
                    >
                        <User size={18} color={activeTab === 'profile' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.segmentText, activeTab === 'profile' && styles.segmentTextActive]}>
                            Profile
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.segmentButton, activeTab === 'settings' && styles.segmentButtonActive]}
                        onPress={() => setActiveTab('settings')}
                        activeOpacity={0.7}
                    >
                        <Bell size={18} color={activeTab === 'settings' ? Colors.white : Colors.textSecondary} />
                        <Text style={[styles.segmentText, activeTab === 'settings' && styles.segmentTextActive]}>
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: Colors.backgroundWhite,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    segmentControl: {
        flexDirection: 'row',
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 4,
    },
    segmentButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
    },
    segmentButtonActive: {
        backgroundColor: Colors.primary,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.textSecondary,
    },
    segmentTextActive: {
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        backgroundColor: Colors.primary,
        marginHorizontal: -20,
        paddingHorizontal: 20,
        borderRadius: 16,
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
        padding: 16,
        marginBottom: 24,
    },
    subscriptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    subscriptionInfo: {
        flex: 1,
    },
    subscriptionTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    subscriptionStatus: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    upgradeButton: {
        backgroundColor: Colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16,
        alignItems: 'center',
    },
    upgradeButtonText: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.white,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
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
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.borderLight,
        marginHorizontal: 16,
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
    version: {
        textAlign: 'center',
        color: Colors.textTertiary,
        fontSize: 12,
        marginTop: 8,
    },
});
