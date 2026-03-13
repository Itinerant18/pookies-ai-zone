import React from 'react';
import { View, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';

interface ClaySearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: () => void;
    testID?: string;
    style?: ViewStyle;
}

export function ClaySearchBar({ value, onChangeText, onSubmit, testID, style }: ClaySearchBarProps) {
    return (
        <View style={[styles.container, style]}>
            <FontAwesome name="search" size={20} color={clayTheme.text.tertiary} style={styles.icon} />
            <TextInput
                testID={testID}
                style={styles.input}
                placeholder="Search tools..."
                placeholderTextColor={clayTheme.text.tertiary}
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                selectionColor={clayTheme.accent.primary}
            />
            {value.length > 0 && (
                <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <FontAwesome name="times-circle" size={18} color={clayTheme.text.tertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...clayUtils.searchBar, // Uses the new token
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        backgroundColor: '#FFFFFF', // Explicit override if needed, but token has it
        marginBottom: spacing.lg,
        marginHorizontal: spacing.xl,
    } as ViewStyle,
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        color: clayTheme.text.primary,
        fontSize: 16,
        fontWeight: '500',
    },
});
