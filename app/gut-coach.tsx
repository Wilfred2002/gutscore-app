import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Sparkles, Lock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { analyzeTriggers } from '@/lib/trigger-engine';
import { useState, useRef, useMemo } from 'react';
import { chatWithGutCoach } from '@/lib/openai';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function GutCoachScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, meals, symptoms } = useApp();
    const flatListRef = useRef<FlatList>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your AI Gut Coach. Ask me anything about your gut health, triggers, or how to feel better. For example:\n\n• \"Why does dairy make me bloated?\"\n• \"What foods should I avoid?\"\n• \"How can I improve my fiber intake?\""
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const triggers = useMemo(() => analyzeTriggers(meals, symptoms), [meals, symptoms]);
    const isPro = user?.isPro || false;

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputText.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Build user context for personalized responses
            const userContext = {
                triggers: triggers.map(t => t.name),
                recentMeals: meals.slice(0, 5).map(m => m.foods.map(f => f.name).join(', ')),
                symptomTypes: [...new Set(symptoms.flatMap(s => s.types))],
            };

            const response = await chatWithGutCoach(userMessage.content, userContext);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response,
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I couldn't process that request. Please try again.",
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageBubble,
            item.role === 'user' ? styles.userBubble : styles.assistantBubble
        ]}>
            {item.role === 'assistant' && (
                <View style={styles.coachIcon}>
                    <Sparkles size={16} color={Colors.primary} />
                </View>
            )}
            <Text style={[
                styles.messageText,
                item.role === 'user' ? styles.userText : styles.assistantText
            ]}>
                {item.content}
            </Text>
        </View>
    );

    // Show paywall prompt for free users after 2 messages
    const showPaywall = !isPro && messages.filter(m => m.role === 'user').length >= 2;

    return (
        <KeyboardAvoidingView
            style={[styles.container, { paddingTop: insets.top }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitle}>
                    <Sparkles size={20} color={Colors.primary} />
                    <Text style={styles.title}>AI Gut Coach</Text>
                    {isPro && <Text style={styles.proBadge}>PRO</Text>}
                </View>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            />

            {showPaywall ? (
                <View style={styles.paywallBanner}>
                    <Lock size={20} color={Colors.white} />
                    <Text style={styles.paywallText}>Upgrade to Pro for unlimited AI coaching</Text>
                    <TouchableOpacity
                        style={styles.upgradeButton}
                        onPress={() => router.push('/paywall')}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 8 }]}>
                    <TextInput
                        style={styles.input}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about your gut health..."
                        placeholderTextColor={Colors.textTertiary}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!inputText.trim() || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color={Colors.white} />
                        ) : (
                            <Send size={20} color={Colors.white} />
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
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
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.text,
    },
    proBadge: {
        fontSize: 10,
        fontWeight: '700' as const,
        color: Colors.white,
        backgroundColor: Colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    messagesList: {
        padding: 16,
        gap: 12,
    },
    messageBubble: {
        maxWidth: '85%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        alignSelf: 'flex-start',
        backgroundColor: Colors.backgroundWhite,
        borderBottomLeftRadius: 4,
    },
    coachIcon: {
        marginBottom: 8,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: Colors.white,
    },
    assistantText: {
        color: Colors.text,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingTop: 12,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        backgroundColor: Colors.backgroundWhite,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        color: Colors.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: Colors.textTertiary,
    },
    paywallBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: Colors.primary,
    },
    paywallText: {
        flex: 1,
        fontSize: 14,
        color: Colors.white,
    },
    upgradeButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    upgradeButtonText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.primary,
    },
});
