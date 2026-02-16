import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ClayTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.clayBar}>
                {state.routes.map((route, index) => {
                    const options = descriptors[route.key].options as any;
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

                    const getIconName = () => {
                        if (route.name === 'index') return 'th-large';
                        if (route.name === 'categories') return 'list-ul';
                        if (route.name === 'favorites') return isFocused ? 'heart' : 'heart-o';
                        return 'circle';
                    };

                    const iconName = getIconName();

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={[
                                styles.tab,
                                isFocused && styles.tabFocused
                            ]}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.iconContainer, isFocused && styles.focusedIcon]}>
                                <FontAwesome
                                    name={iconName as any}
                                    size={20}
                                    color={isFocused ? '#FFFFFF' : clayTheme.text.tertiary}
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
    clayBar: {
        flexDirection: 'row',
        backgroundColor: clayTheme.surface,
        borderRadius: 40,
        padding: 8,
        // Clay shadow effect
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
        gap: 8,
        borderWidth: 1,
        borderColor: '#FFFFFF', // Inner highlight
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    tabFocused: {
        backgroundColor: clayTheme.accent.primary,
        shadowColor: clayTheme.accent.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    iconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusedIcon: {
        // Icon container styles if needed
    },
    label: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
        marginLeft: 4,
    }
});
