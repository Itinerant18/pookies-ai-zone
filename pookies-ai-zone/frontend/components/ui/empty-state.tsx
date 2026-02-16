import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { clayTheme, spacing } from '../../theme/clay';

interface EmptyStateProps {
    icon: keyof typeof FontAwesome.glyphMap;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
    testID?: string;
}

export function EmptyState({
    icon,
    title,
    subtitle,
    actionLabel,
    onAction,
    testID,
}: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconBox}>
                <FontAwesome name={icon} size={48} color={clayTheme.text.tertiary} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    testID={testID}
                    style={styles.button}
                    onPress={onAction}
                    activeOpacity={0.8}
                    accessibilityLabel={actionLabel}
                    accessibilityRole="button"
                >
                    <Text style={styles.buttonText}>{actionLabel}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 64,
        paddingHorizontal: 32,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        backgroundColor: clayTheme.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: clayTheme.text.primary,
    },
    subtitle: {
        fontSize: 14,
        color: clayTheme.text.tertiary,
        marginTop: spacing.sm,
        textAlign: 'center',
        lineHeight: 20,
    },
    button: {
        marginTop: spacing.xl,
        backgroundColor: clayTheme.accent.primary,
        borderRadius: 14,
        paddingHorizontal: 28,
        paddingVertical: 14,
    },
    buttonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
