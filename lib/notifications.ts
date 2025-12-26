import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'gutscore_notifications';

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

interface NotificationPrefs {
    enabled: boolean;
    pushToken?: string;
    dailyReminderScheduled: boolean;
}

/**
 * Request notification permissions and get push token.
 */
export const requestNotificationPermissions = async (): Promise<string | null> => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Notification permissions not granted');
            return null;
        }

        // Get push token (for standalone builds)
        // Note: This requires EAS Build, won't work in Expo Go
        try {
            const token = await Notifications.getExpoPushTokenAsync();
            return token.data;
        } catch (e) {
            // Fallback for development
            console.log('Push token not available (dev mode)');
            return 'dev-token';
        }
    } catch (error) {
        console.error('Error requesting notification permissions:', error);
        return null;
    }
};

/**
 * Schedule a daily scan reminder notification.
 */
export const scheduleDailyScanReminder = async () => {
    // Cancel existing reminders first
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule for 8 PM daily
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "🍽️ Don't forget to scan!",
            body: "Log your dinner to keep your gut health streak going.",
            data: { type: 'scan_reminder' },
        },
        trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
        },
    });

    // Save preference
    await saveNotificationPrefs({
        enabled: true,
        dailyReminderScheduled: true
    });
};

/**
 * Cancel all scheduled notifications.
 */
export const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await saveNotificationPrefs({
        enabled: false,
        dailyReminderScheduled: false
    });
};

/**
 * Send a local notification for streak milestones.
 */
export const sendStreakNotification = async (days: number) => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: `🔥 ${days}-Day Streak!`,
            body: `Amazing! You've logged meals for ${days} days in a row. Keep it up!`,
            data: { type: 'streak_milestone', days },
        },
        trigger: null, // Immediate
    });
};

/**
 * Send weekly report notification.
 */
export const sendWeeklyReportNotification = async () => {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "📊 Your Weekly Gut Report is Ready",
            body: "See your top triggers and gut health trends from this week.",
            data: { type: 'weekly_report' },
        },
        trigger: null,
    });
};

// Helper to save/load preferences
const saveNotificationPrefs = async (prefs: Partial<NotificationPrefs>) => {
    const existing = await getNotificationPrefs();
    const updated = { ...existing, ...prefs };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getNotificationPrefs = async (): Promise<NotificationPrefs> => {
    try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { enabled: false, dailyReminderScheduled: false };
    } catch {
        return { enabled: false, dailyReminderScheduled: false };
    }
};
