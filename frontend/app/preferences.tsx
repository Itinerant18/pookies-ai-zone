import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    ViewStyle,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import { clayTheme, clayUtils, spacing, layout } from '../theme/clay';
import { ClayButton } from '../components/ui/clay-button';
import { UserPreferences } from '../types';
import {
    loadPreferences,
    savePreferences,
    resetPreferences,
    DEFAULT_PREFERENCES,
    AVAILABLE_USE_CASES,
    USE_CASE_LABELS,
    USE_CASE_ICONS,
} from '../utils/preferences';

// Simple custom slider component
function ClaySlider({
    value,
    onValueChange,
    label,
    leftLabel,
    rightLabel,
}: {
    value: number;
    onValueChange: (v: number) => void;
    label: string;
    leftLabel: string;
    rightLabel: string;
}) {
    const steps = [0, 25, 50, 75, 100];

    return (
        <View style={sliderStyles.container}>
            <View style={sliderStyles.labelRow}>
                <Text style={sliderStyles.label}>{label}</Text>
                <Text style={sliderStyles.valueText}>{value}%</Text>
            </View>
            <View style={sliderStyles.track}>
                <View style={[sliderStyles.fill, { width: `${value}%` }]} />
            </View>
            <View style={sliderStyles.stepsRow}>
                {steps.map(step => (
                    <TouchableOpacity
                        key={step}
                        style={[
                            sliderStyles.stepDot,
                            value >= step && sliderStyles.stepDotActive,
                        ]}
                        onPress={() => onValueChange(step)}
                        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                    />
                ))}
            </View>
            <View style={sliderStyles.axisLabels}>
                <Text style={sliderStyles.axisLabel}>{leftLabel}</Text>
                <Text style={sliderStyles.axisLabel}>{rightLabel}</Text>
            </View>
        </View>
    );
}

export default function PreferencesScreen() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
    const [loaded, setLoaded] = useState(false);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        loadPreferences().then(p => {
            setPrefs(p);
            setLoaded(true);
        });
    }, []);

    const updatePref = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
        setPrefs(prev => ({ ...prev, [key]: value }));
        setDirty(true);
    }, []);

    const toggleUseCase = useCallback((uc: string) => {
        setPrefs(prev => {
            const current = prev.primary_use_cases;
            const updated = current.includes(uc)
                ? current.filter(c => c !== uc)
                : [...current, uc];
            return { ...prev, primary_use_cases: updated };
        });
        setDirty(true);
    }, []);

    const handleSave = useCallback(async () => {
        await savePreferences(prefs);
        setDirty(false);
        router.back();
    }, [prefs, router]);

    const handleReset = useCallback(async () => {
        await resetPreferences();
        setPrefs(DEFAULT_PREFERENCES);
        setDirty(true);
    }, []);

    if (!loaded) return null;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <ClayButton
                    onPress={() => router.back()}
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                    <Text style={styles.headerTitle}>Preferences</Text>
                    <Text style={styles.headerSubtitle}>Customize your tool recommendations</Text>
                </View>
                <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
                    <FontAwesome name="undo" size={14} color={clayTheme.text.tertiary} />
                    <Text style={styles.resetText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Priorities Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="sliders" size={16} color={clayTheme.accent.primary} />
                        <Text style={styles.sectionTitle}>Priorities</Text>
                    </View>
                    <Text style={styles.sectionDesc}>
                        How important are these factors when evaluating tools?
                    </Text>

                    <View style={styles.card}>
                        <ClaySlider
                            label="💰 Price Sensitivity"
                            value={prefs.price_sensitivity}
                            onValueChange={v => updatePref('price_sensitivity', v)}
                            leftLabel="Don't care"
                            rightLabel="Very important"
                        />
                        <View style={styles.divider} />
                        <ClaySlider
                            label="🎯 Ease of Use"
                            value={prefs.ease_of_use_importance}
                            onValueChange={v => updatePref('ease_of_use_importance', v)}
                            leftLabel="Power user"
                            rightLabel="Beginner-friendly"
                        />
                        <View style={styles.divider} />
                        <ClaySlider
                            label="🧩 Feature Richness"
                            value={prefs.feature_richness}
                            onValueChange={v => updatePref('feature_richness', v)}
                            leftLabel="Simple"
                            rightLabel="All-in-one"
                        />
                    </View>
                </View>

                {/* Requirements Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="check-circle" size={16} color={clayTheme.accent.secondary} />
                        <Text style={styles.sectionTitle}>Requirements</Text>
                    </View>
                    <Text style={styles.sectionDesc}>
                        Must-have features for your ideal tool
                    </Text>

                    <View style={styles.card}>
                        {([
                            { key: 'need_mobile_app' as const, label: 'Mobile App', icon: 'mobile', desc: 'Must have iOS/Android app' },
                            { key: 'need_api' as const, label: 'API Access', icon: 'plug', desc: 'Developer API required' },
                            { key: 'need_free_tier' as const, label: 'Free Tier', icon: 'gift', desc: 'Must offer free plan' },
                            { key: 'need_open_source' as const, label: 'Open Source', icon: 'code-fork', desc: 'Open source or self-hosted' },
                        ]).map((item, idx) => (
                            <View key={item.key}>
                                {idx > 0 && <View style={styles.divider} />}
                                <View style={styles.toggleRow}>
                                    <View style={styles.toggleInfo}>
                                        <View style={styles.toggleIconBox}>
                                            <FontAwesome name={item.icon as any} size={16} color={clayTheme.accent.primary} />
                                        </View>
                                        <View>
                                            <Text style={styles.toggleLabel}>{item.label}</Text>
                                            <Text style={styles.toggleDesc}>{item.desc}</Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={prefs[item.key]}
                                        onValueChange={v => updatePref(item.key, v)}
                                        trackColor={{ false: '#E0E0E0', true: clayTheme.accent.primary + '60' }}
                                        thumbColor={prefs[item.key] ? clayTheme.accent.primary : '#F5F5F5'}
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Use Cases Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FontAwesome name="tags" size={16} color={clayTheme.accent.tertiary} />
                        <Text style={styles.sectionTitle}>Use Cases</Text>
                    </View>
                    <Text style={styles.sectionDesc}>
                        What will you primarily use AI tools for?
                    </Text>

                    <View style={styles.chipGrid}>
                        {AVAILABLE_USE_CASES.map(uc => {
                            const isActive = prefs.primary_use_cases.includes(uc);
                            return (
                                <TouchableOpacity
                                    key={uc}
                                    style={[styles.chip, isActive && styles.chipActive]}
                                    onPress={() => toggleUseCase(uc)}
                                    activeOpacity={0.7}
                                >
                                    <FontAwesome
                                        name={(USE_CASE_ICONS[uc] || 'tag') as any}
                                        size={13}
                                        color={isActive ? '#FFFFFF' : clayTheme.text.secondary}
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                        {USE_CASE_LABELS[uc] || uc}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Save Button */}
            {dirty && (
                <View style={styles.saveBar}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
                        <FontAwesome name="check" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Save Preferences</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const sliderStyles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: clayTheme.text.primary,
    },
    valueText: {
        fontSize: 13,
        fontWeight: '700',
        color: clayTheme.accent.primary,
        minWidth: 38,
        textAlign: 'right',
    },
    track: {
        height: 6,
        backgroundColor: '#E8ECF0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: clayTheme.accent.primary,
        borderRadius: 3,
    },
    stepsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        paddingHorizontal: 2,
    },
    stepDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: '#E8ECF0',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    stepDotActive: {
        backgroundColor: clayTheme.accent.primary,
    },
    axisLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    axisLabel: {
        fontSize: 10,
        color: clayTheme.text.tertiary,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: clayTheme.text.primary,
        letterSpacing: -0.3,
    },
    headerSubtitle: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
        marginTop: 2,
    },
    resetBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        backgroundColor: clayTheme.surface,
    },
    resetText: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
        fontWeight: '500',
    },
    scrollContent: {
        paddingHorizontal: layout.screenPadding,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: clayTheme.text.primary,
    },
    sectionDesc: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        marginBottom: spacing.md,
    },
    card: {
        ...clayUtils.card,
        padding: spacing.md,
    } as ViewStyle,
    divider: {
        height: 1,
        backgroundColor: '#F0F2F5',
        marginVertical: 12,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 12,
    },
    toggleIconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: clayTheme.accent.primary + '12',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    toggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: clayTheme.text.primary,
    },
    toggleDesc: {
        fontSize: 11,
        color: clayTheme.text.tertiary,
        marginTop: 1,
    },
    chipGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E8ECF0',
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
    },
    chipActive: {
        backgroundColor: clayTheme.accent.primary,
        borderColor: clayTheme.accent.primary,
        shadowColor: clayTheme.accent.primary,
        shadowOpacity: 0.2,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '600',
        color: clayTheme.text.secondary,
    },
    chipTextActive: {
        color: '#FFFFFF',
    },
    saveBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        paddingBottom: spacing.xl,
        backgroundColor: clayTheme.background,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: clayTheme.accent.primary,
        paddingVertical: 14,
        borderRadius: 16,
        shadowColor: clayTheme.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
