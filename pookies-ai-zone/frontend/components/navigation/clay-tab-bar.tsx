import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

const TAB_CONFIG: Record<string, { icon: string; iconFocused?: string; label: string }> = {
    index: { icon: 'th-large', label: 'Home' },
    categories: { icon: 'list-ul', label: 'Categories' },
    favorites: { icon: 'heart-o', iconFocused: 'heart', label: 'Favorites' },
    compare: { icon: 'exchange', label: 'Compare' },
};

const ALLOWED_ROUTES = ['index', 'categories', 'favorites', 'compare'];

function TabItem({
    route,
    isFocused,
    onPress,
    badge,
}: {
    route: string;
    isFocused: boolean;
    onPress: () => void;
    badge: number;
}) {
    const config = TAB_CONFIG[route];
    if (!config) return null;

    const focusAnim = useSharedValue(isFocused ? 1 : 0);

    useEffect(() => {
        focusAnim.value = withSpring(isFocused ? 1 : 0, {
            damping: 15,
            stiffness: 150,
        });
    }, [isFocused]);

    const containerStyle = useAnimatedStyle(() => ({
        backgroundColor: `rgba(99, 102, 241, ${interpolate(focusAnim.value, [0, 1], [0, 1])})`,
        paddingHorizontal: interpolate(focusAnim.value, [0, 1], [16, 20]),
        shadowOpacity: interpolate(focusAnim.value, [0, 1], [0, 0.3]),
    }));

    const labelStyle = useAnimatedStyle(() => ({
        width: interpolate(focusAnim.value, [0, 1], [0, 70]),
        opacity: focusAnim.value,
        marginLeft: interpolate(focusAnim.value, [0, 1], [0, 6]),
    }));

    const iconName = isFocused && config.iconFocused ? config.iconFocused : config.icon;

    return (
        <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={config.label}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Animated.View style={[styles.tab, containerStyle]}>
                <View style={styles.iconWrapper}>
                    <FontAwesome
                        name={iconName as any}
                        size={22}
                        color={isFocused ? '#FFFFFF' : clayTheme.text.tertiary}
                    />
                    {badge > 0 && !isFocused && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
                        </View>
                    )}
                </View>
                <Animated.View style={[styles.labelContainer, labelStyle]}>
                    <Text style={styles.label} numberOfLines={1}>{config.label}</Text>
                    {badge > 0 && isFocused && (
                        <View style={styles.badgeInline}>
                            <Text style={styles.badgeInlineText}>{badge}</Text>
                        </View>
                    )}
                </Animated.View>
            </Animated.View>
        </TouchableOpacity>
    );
}

export function ClayTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();
    const [favCount, setFavCount] = useState(0);
    const [compareCount, setCompareCount] = useState(0);

    const loadCounts = useCallback(async () => {
        try {
            const [favs, comps] = await Promise.all([
                AsyncStorage.getItem('favorites'),
                AsyncStorage.getItem('comparing'),
            ]);
            setFavCount(favs ? JSON.parse(favs).length : 0);
            setCompareCount(comps ? JSON.parse(comps).length : 0);
        } catch {
            // silently fail
        }
    }, []);

    // Poll counts when tab bar renders (on focus changes etc.)
    useEffect(() => {
        loadCounts();
        const interval = setInterval(loadCounts, 2000);
        return () => clearInterval(interval);
    }, [loadCounts]);

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.clayBar}>
                {state.routes.map((route, index) => {
                    if (!ALLOWED_ROUTES.includes(route.name)) return null;

                    const options = descriptors[route.key].options as any;
                    if (options.href === null) return null;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name, route.params);
                        }
                    };

                    let badge = 0;
                    if (route.name === 'favorites') badge = favCount;
                    if (route.name === 'compare') badge = compareCount;

                    return (
                        <TabItem
                            key={route.key}
                            route={route.name}
                            isFocused={isFocused}
                            onPress={onPress}
                            badge={badge}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    },
    clayBar: {
        flexDirection: 'row',
        backgroundColor: clayTheme.surface,
        borderRadius: 32,
        padding: 6,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: clayTheme.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
        elevation: 4,
    },
    iconWrapper: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
    },
    label: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        flexShrink: 1,
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: clayTheme.accent.error,
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
        borderWidth: 1.5,
        borderColor: clayTheme.surface,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
    },
    badgeInline: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginLeft: 4,
    },
    badgeInlineText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
