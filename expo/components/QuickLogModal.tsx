import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { X, Search, Plus, Check } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { analyzeFoodList } from '@/lib/openai';

// Common gut-health foods with emojis
const COMMON_FOODS = [
    { name: 'Chicken Breast', emoji: '🍗' },
    { name: 'Salmon', emoji: '🐟' },
    { name: 'Rice', emoji: '🍚' },
    { name: 'Quinoa', emoji: '🌾' },
    { name: 'Oatmeal', emoji: '🥣' },
    { name: 'Eggs', emoji: '🥚' },
    { name: 'Avocado', emoji: '🥑' },
    { name: 'Banana', emoji: '🍌' },
    { name: 'Blueberries', emoji: '🫐' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Broccoli', emoji: '🥦' },
    { name: 'Carrots', emoji: '🥕' },
    { name: 'Sweet Potato', emoji: '🍠' },
    { name: 'Greek Yogurt', emoji: '🥛' },
    { name: 'Almonds', emoji: '🥜' },
    { name: 'Olive Oil', emoji: '🫒' },
    { name: 'Lemon', emoji: '🍋' },
    { name: 'Ginger', emoji: '🫚' },
    { name: 'Tofu', emoji: '🧈' },
    { name: 'Pasta', emoji: '🍝' },
    { name: 'Bread', emoji: '🍞' },
    { name: 'Cheese', emoji: '🧀' },
    { name: 'Milk', emoji: '🥛' },
    { name: 'Apple', emoji: '🍎' },
    { name: 'Orange', emoji: '🍊' },
];

interface QuickLogModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function QuickLogModal({ visible, onClose }: QuickLogModalProps) {
    const router = useRouter();
    const [searchText, setSearchText] = useState('');
    const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const filteredFoods = useMemo(() => {
        if (!searchText.trim()) return COMMON_FOODS;
        return COMMON_FOODS.filter(f =>
            f.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText]);

    const toggleFood = (name: string) => {
        setSelectedFoods(prev =>
            prev.includes(name)
                ? prev.filter(f => f !== name)
                : [...prev, name]
        );
    };

    const handleSubmit = async () => {
        if (selectedFoods.length === 0) return;
        setIsLoading(true);

        try {
            // Use text-based analysis instead of image
            const result = await analyzeFoodList(selectedFoods);

            onClose();
            router.push({
                pathname: '/scan-results',
                params: {
                    foods: JSON.stringify(result.foods),
                    gutScores: JSON.stringify(result.gutScores),
                    overallScore: result.overallScore.toString(),
                    analysis: JSON.stringify(result.analysis),
                    triggers: JSON.stringify(result.triggers),
                    swaps: JSON.stringify(result.swaps),
                }
            });
        } catch (error) {
            console.error('Quick log error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFoodItem = ({ item }: { item: { name: string; emoji: string } }) => {
        const isSelected = selectedFoods.includes(item.name);
        return (
            <TouchableOpacity
                style={[styles.foodItem, isSelected && styles.foodItemSelected]}
                onPress={() => toggleFood(item.name)}
                activeOpacity={0.7}
            >
                <Text style={styles.foodEmoji}>{item.emoji}</Text>
                <Text style={[styles.foodName, isSelected && styles.foodNameSelected]}>
                    {item.name}
                </Text>
                {isSelected && (
                    <View style={styles.checkIcon}>
                        <Check size={16} color={Colors.white} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <X size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Quick Log</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.searchContainer}>
                    <Search size={20} color={Colors.textTertiary} />
                    <TextInput
                        style={styles.searchInput}
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholder="Search foods..."
                        placeholderTextColor={Colors.textTertiary}
                    />
                </View>

                {selectedFoods.length > 0 && (
                    <View style={styles.selectedContainer}>
                        <Text style={styles.selectedLabel}>
                            Selected ({selectedFoods.length}): {selectedFoods.join(', ')}
                        </Text>
                    </View>
                )}

                <FlatList
                    data={filteredFoods}
                    renderItem={renderFoodItem}
                    keyExtractor={item => item.name}
                    numColumns={2}
                    contentContainerStyle={styles.foodList}
                    columnWrapperStyle={styles.foodRow}
                />

                <TouchableOpacity
                    style={[styles.submitButton, selectedFoods.length === 0 && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={selectedFoods.length === 0 || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={Colors.white} />
                    ) : (
                        <>
                            <Plus size={20} color={Colors.white} />
                            <Text style={styles.submitButtonText}>
                                Log {selectedFoods.length > 0 ? `${selectedFoods.length} Foods` : 'Meal'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </Modal>
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
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        margin: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
    },
    selectedContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    selectedLabel: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '500' as const,
    },
    foodList: {
        paddingHorizontal: 12,
        paddingBottom: 100,
    },
    foodRow: {
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    foodItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.backgroundWhite,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    foodItemSelected: {
        backgroundColor: Colors.primaryLight,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    foodEmoji: {
        fontSize: 24,
    },
    foodName: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
    },
    foodNameSelected: {
        color: Colors.primary,
        fontWeight: '500' as const,
    },
    checkIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: Colors.primary,
        marginHorizontal: 16,
        marginBottom: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    submitButtonDisabled: {
        backgroundColor: Colors.textTertiary,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: Colors.white,
    },
});
