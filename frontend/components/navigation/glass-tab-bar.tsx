import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { liquidGlassTheme, glassUtils, spacing } from '../../theme/liquidGlass';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    // Hide tab bar on specific routes if needed, though usually handled by options
    // const focusedOptions = descriptors[state.routes[state.index].key].options;
    // if (focusedOptions.tabBarVisible === false) return null;

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.glass}>
                {state.routes.map((route, index) => {
                    const options = descriptors[route.key].options as any;

                    // Skip hidden routes (like tool/[id] which has href: null)
                    // Expo router often handles this by not including them in state.routes for tabs if properly configured with href: null
                    // But here we might see them.
                    if (options.href === null) return null;

                    const isFocused = state.index === index;
                    const label = options.title !== undefined ? options.title : route.name;

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

                    const iconName = route.name === 'index' ? 'grid'
                        : route.name === 'categories' ? 'layers'
                            : route.name === 'favorites' ? 'heart'
                                : 'ellipse'; // Fallback

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tab}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.focusedIcon]}>
                                <Ionicons
                                    name={isFocused ? iconName as any : `${iconName}-outline` as any}
                                    size={20} // Slightly smaller for refinement
                                    color={isFocused ? '#FFFFFF' : liquidGlassTheme.text.tertiary}
                                />
                            </View>
                            {isFocused && (
                                <Text style={styles.label}>{label as string}</Text>
                            )}
                        </TouchableOpacity>
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
    },
    glass: {
        flexDirection: 'row',
        backgroundColor: liquidGlassTheme.glass.background,
        borderColor: liquidGlassTheme.glass.border,
        borderWidth: 1,
        borderRadius: 32,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        gap: 4,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconContainer: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    focusedIcon: {
        backgroundColor: liquidGlassTheme.accent.primary,
    },
    label: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 2,
    }
});
