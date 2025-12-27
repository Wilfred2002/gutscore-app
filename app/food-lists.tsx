import { useState, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, X, Shield, AlertTriangle, Ban } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { Trigger } from '@/types';
import { analyzeTriggers } from '@/lib/trigger-engine';

type Category = 'safe' | 'limit' | 'avoid';

interface FoodItem {
    name: string;
    source: 'ai' | 'manual' | 'trigger_engine';
    confidence: number;
}

export default function FoodListsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { meals, symptoms } = useApp();

    const [activeTab, setActiveTab] = useState<Category>('safe');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newFoodName, setNewFoodName] = useState('');
    const [manualFoods, setManualFoods] = useState<Record<Category, string[]>>({
        safe: [],
        limit: [],
        avoid: [],
    });

    // Analyze triggers from data
    const triggers = useMemo(() => analyzeTriggers(meals, symptoms), [meals, symptoms]);

    // Get safe foods (foods eaten without symptoms)
    const safeFoods = useMemo((): FoodItem[] => {
        const foodsWithSymptoms = new Set<string>();

        symptoms.forEach(symptom => {
            const symptomTime = new Date(symptom.timestamp).getTime();
            const isSevere = symptom.bloat >= 3 || symptom.pain >= 3 || symptom.energy <= 2;

            if (isSevere) {
                meals.forEach(meal => {
                    const mealTime = new Date(meal.timestamp).getTime();
                    const diffHours = (symptomTime - mealTime) / (1000 * 60 * 60);
                    if (diffHours >= 0.5 && diffHours <= 6) {
                        meal.foods.forEach(f => foodsWithSymptoms.add(f.name.toLowerCase()));
                    }
                });
            }
        });

        const foodCounts: Record<string, { name: string; count: number }> = {};
        meals.forEach(meal => {
            meal.foods.forEach(f => {
                const key = f.name.toLowerCase();
                if (!foodsWithSymptoms.has(key)) {
                    if (!foodCounts[key]) {
                        foodCounts[key] = { name: f.name, count: 0 };
                    }
                    foodCounts[key].count++;
                }
            });
        });

        const aiSafe = Object.values(foodCounts)
            .filter(f => f.count >= 2)
            .map(f => ({ name: f.name, source: 'trigger_engine' as const, confidence: Math.min(95, 50 + f.count * 10) }));

        const manualSafe = manualFoods.safe.map(name => ({
            name,
            source: 'manual' as const,
            confidence: 100
        }));

        return [...manualSafe, ...aiSafe];
    }, [meals, symptoms, manualFoods.safe]);

    // Get limit/avoid foods from triggers
    const limitFoods = useMemo((): FoodItem[] => {
        const fromTriggers = triggers
            .filter(t => t.status === 'limit' || t.status === 'monitor')
            .map(t => ({ name: t.name, source: 'trigger_engine' as const, confidence: t.confidence }));

        const manual = manualFoods.limit.map(name => ({
            name,
            source: 'manual' as const,
            confidence: 100
        }));

        return [...manual, ...fromTriggers];
    }, [triggers, manualFoods.limit]);

    const avoidFoods = useMemo((): FoodItem[] => {
        const fromTriggers = triggers
            .filter(t => t.status === 'avoid')
            .map(t => ({ name: t.name, source: 'trigger_engine' as const, confidence: t.confidence }));

        const manual = manualFoods.avoid.map(name => ({
            name,
            source: 'manual' as const,
            confidence: 100
        }));

        return [...manual, ...fromTriggers];
    }, [triggers, manualFoods.avoid]);

    const getCurrentFoods = (): FoodItem[] => {
        switch (activeTab) {
            case 'safe': return safeFoods;
            case 'limit': return limitFoods;
            case 'avoid': return avoidFoods;
        }
    };

    const handleAddFood = () => {
        if (!newFoodName.trim()) return;

        setManualFoods(prev => ({
            ...prev,
            [activeTab]: [...prev[activeTab], newFoodName.trim()],
        }));

        setNewFoodName('');
        setShowAddModal(false);

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleRemoveFood = (foodName: string) => {
        Alert.alert(
            'Remove Food',
            `Remove "${foodName}" from your ${activeTab} list?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setManualFoods(prev => ({
                            ...prev,
                            [activeTab]: prev[activeTab].filter(f => f !== foodName),
                        }));
                    }
                },
            ]
        );
    };

    const getTabConfig = (tab: Category) => {
        switch (tab) {
            case 'safe':
                return { label: 'Safe', icon: Shield, color: Colors.success, bgColor: 'rgba(76, 175, 80, 0.1)' };
            case 'limit':
                return { label: 'Limit', icon: AlertTriangle, color: Colors.warning, bgColor: 'rgba(255, 152, 0, 0.1)' };
            case 'avoid':
                return { label: 'Avoid', icon: Ban, color: Colors.danger, bgColor: 'rgba(244, 67, 54, 0.1)' };
        }
    };

    const currentFoods = getCurrentFoods();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Food Lists</Text>
                <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
                    <Plus size={24} color={Colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                {(['safe', 'limit', 'avoid'] as Category[]).map(tab => {
                    const config = getTabConfig(tab);
                    const isActive = activeTab === tab;
                    const Icon = config.icon;

                    return (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                isActive && { backgroundColor: config.bgColor, borderColor: config.color },
                            ]}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.7}
                        >
                            <Icon size={18} color={isActive ? config.color : Colors.textSecondary} />
                            <Text style={[styles.tabText, isActive && { color: config.color }]}>
                                {config.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* List */}
            <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
                {currentFoods.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>
                            {activeTab === 'safe' ? '🥗' : activeTab === 'limit' ? '⚠️' : '🚫'}
                        </Text>
                        <Text style={styles.emptyTitle}>No {activeTab} foods yet</Text>
                        <Text style={styles.emptyText}>
                            {activeTab === 'safe'
                                ? 'Foods you eat without symptoms will appear here, or add your own.'
                                : activeTab === 'limit'
                                    ? 'Foods that sometimes cause issues will appear here.'
                                    : 'Foods that consistently trigger symptoms will appear here.'}
                        </Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => setShowAddModal(true)}
                        >
                            <Plus size={18} color={Colors.primary} />
                            <Text style={styles.emptyButtonText}>Add Food</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.foodList}>
                        {currentFoods.map((food, index) => {
                            const config = getTabConfig(activeTab);
                            return (
                                <View key={`${food.name}-${index}`} style={styles.foodCard}>
                                    <View style={[styles.foodIcon, { backgroundColor: config.bgColor }]}>
                                        <config.icon size={16} color={config.color} />
                                    </View>
                                    <View style={styles.foodInfo}>
                                        <Text style={styles.foodName}>{food.name}</Text>
                                        <Text style={styles.foodSource}>
                                            {food.source === 'manual' ? 'Added by you' : `${food.confidence}% confidence`}
                                        </Text>
                                    </View>
                                    {food.source === 'manual' && (
                                        <TouchableOpacity
                                            onPress={() => handleRemoveFood(food.name)}
                                            style={styles.removeButton}
                                        >
                                            <X size={18} color={Colors.textTertiary} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            {/* Add Modal */}
            {showAddModal && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { paddingBottom: insets.bottom + 20 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add to {activeTab} list</Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <X size={24} color={Colors.text} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter food name..."
                            placeholderTextColor={Colors.textTertiary}
                            value={newFoodName}
                            onChangeText={setNewFoodName}
                            autoFocus
                            onSubmitEditing={handleAddFood}
                        />
                        <TouchableOpacity
                            style={[styles.addFoodButton, !newFoodName.trim() && styles.addFoodButtonDisabled]}
                            onPress={handleAddFood}
                            disabled={!newFoodName.trim()}
                        >
                            <Text style={styles.addFoodButtonText}>Add Food</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
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
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: Colors.backgroundWhite,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        textAlign: 'center',
    },
    addButton: {
        padding: 4,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
        backgroundColor: Colors.backgroundWhite,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 40,
        marginBottom: 20,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary,
    },
    emptyButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.primary,
    },
    foodList: {
        gap: 10,
    },
    foodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        padding: 14,
        borderRadius: 12,
        gap: 12,
    },
    foodIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {
        fontSize: 15,
        fontWeight: '600',
        color: Colors.text,
    },
    foodSource: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    removeButton: {
        padding: 6,
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: Colors.backgroundWhite,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        textTransform: 'capitalize',
    },
    input: {
        backgroundColor: Colors.background,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: Colors.text,
        marginBottom: 16,
    },
    addFoodButton: {
        backgroundColor: Colors.primary,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    addFoodButtonDisabled: {
        opacity: 0.5,
    },
    addFoodButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
    },
});
