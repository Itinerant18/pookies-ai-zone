import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';

interface ClayInputProps extends TextInputProps {
    icon?: keyof typeof FontAwesome.glyphMap;
    containerStyle?: ViewStyle;
}

export function ClayInput({ icon, containerStyle, style, ...props }: ClayInputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {icon && (
                <FontAwesome
                    name={icon}
                    size={20}
                    color={clayTheme.text.tertiary}
                    style={styles.icon}
                />
            )}
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={clayTheme.text.tertiary}
                selectionColor={clayTheme.accent.primary}
                {...props}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F4F8', // Inset background
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
        // Internal shadow simulation (optional hack)
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        color: clayTheme.text.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});
