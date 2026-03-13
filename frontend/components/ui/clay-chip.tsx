import React from 'react';
import { Text, StyleSheet, ViewStyle, View } from 'react-native';
import { clayTheme, clayUtils } from '../../theme/clay';

interface ClayChipProps {
    label: string;
    color?: string; // Hex color for the accent
    selected?: boolean;
    style?: ViewStyle;
}

export function ClayChip({ label, color = clayTheme.accent.primary, selected = false, style }: ClayChipProps) {
    return (
        <View style={[
            styles.container,
            selected && { backgroundColor: color, shadowColor: color },
            style
        ]}>
            <Text style={[
                styles.text,
                selected && { color: '#FFFFFF' }
            ]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...clayUtils.pill,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: clayTheme.surface,
        marginRight: 8,
        marginBottom: 8,
    } as ViewStyle,
    text: {
        fontSize: 12,
        fontWeight: '600',
        color: clayTheme.text.secondary,
    },
});
