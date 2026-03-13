import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    FlatList,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { clayTheme, spacing } from '../../theme/clay';

const { width, height } = Dimensions.get('window');

export const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

interface OnboardingScreenProps {
    onComplete: () => void;
}

const SLIDES = [
    {
        icon: 'rocket' as const,
        title: 'Discover 320+ AI Tools',
        subtitle: 'Browse, compare, and find the perfect AI tool for your workflow.',
        gradient: ['#6366F1', '#8B5CF6'] as const,
        color: '#6366F1',
    },
    {
        icon: 'search' as const,
        title: 'Smart Search & Compare',
        subtitle: 'Find tools instantly with fuzzy search. Compare side-by-side with real pricing and features.',
        gradient: ['#EC4899', '#F43F5E'] as const,
        color: '#EC4899',
    },
    {
        icon: 'star' as const,
        title: 'Save Your Favorites',
        subtitle: 'Build your personal collection and get notified when new tools match your interests.',
        gradient: ['#F59E0B', '#EF4444'] as const,
        color: '#F59E0B',
    },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
            setCurrentIndex(currentIndex + 1);
        } else {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            onComplete();
        }
    };

    const handleSkip = async () => {
        await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
        onComplete();
    };

    const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
        <View style={styles.slide}>
            <View style={styles.iconContainer}>
                <LinearGradient
                    colors={[item.gradient[0], item.gradient[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconCircle}
                >
                    <FontAwesome name={item.icon} size={56} color="#FFFFFF" />
                </LinearGradient>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
    );

    const isLast = currentIndex === SLIDES.length - 1;

    return (
        <View style={styles.container}>
            {/* Skip */}
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={SLIDES}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                keyExtractor={(_, i) => String(i)}
            />

            {/* Dots */}
            <View style={styles.dotsRow}>
                {SLIDES.map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i === currentIndex
                                ? { backgroundColor: SLIDES[currentIndex].color, width: 28 }
                                : { backgroundColor: '#CBD5E1' },
                        ]}
                    />
                ))}
            </View>

            {/* Next / Get Started */}
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
                <LinearGradient
                    colors={[SLIDES[currentIndex].gradient[0], SLIDES[currentIndex].gradient[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.nextGradient}
                >
                    <Text style={styles.nextText}>
                        {isLast ? 'Get Started' : 'Next'}
                    </Text>
                    {!isLast && <FontAwesome name="arrow-right" size={16} color="#FFF" style={{ marginLeft: 8 }} />}
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    skipBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 30,
        right: spacing.lg,
        zIndex: 10,
    },
    skipText: {
        fontSize: 16,
        color: clayTheme.text.tertiary,
        fontWeight: '600',
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.lg * 2,
    },
    iconContainer: {
        marginBottom: 40,
    },
    iconCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 24,
        elevation: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: clayTheme.text.primary,
        textAlign: 'center',
        marginBottom: 14,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: clayTheme.text.secondary,
        textAlign: 'center',
        lineHeight: 26,
    },
    dotsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 36,
    },
    dot: {
        height: 8,
        width: 8,
        borderRadius: 4,
    },
    nextBtn: {
        width: width - spacing.lg * 4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    nextGradient: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
    },
    nextText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
