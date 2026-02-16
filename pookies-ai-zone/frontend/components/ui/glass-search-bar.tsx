import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    ViewStyle,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { liquidGlassTheme, glassUtils, spacing } from '../../theme/liquidGlass';

interface GlassSearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onSubmit?: () => void;
    testID?: string;
}

export function GlassSearchBar({
    value,
    onChangeText,
    placeholder = 'Search tools...',
    onSubmit,
    testID,
}: GlassSearchBarProps) {
    return (
        <View style={styles.container}>
            <FontAwesome name="search" size={18} color={liquidGlassTheme.text.tertiary} />
            <TextInput
                testID={testID}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={liquidGlassTheme.text.tertiary}
                value={value}
                onChangeText={onChangeText}
                returnKeyType="search"
                onSubmitEditing={onSubmit}
                autoCorrect={false}
            />
            {value.length > 0 && (
                <TouchableOpacity
                    onPress={() => onChangeText('')}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Clear search"
                >
                    <FontAwesome name="times-circle" size={18} color={liquidGlassTheme.text.tertiary} />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...glassUtils.searchBar,
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
        gap: spacing.sm,
    } as ViewStyle,
    input: {
        flex: 1,
        color: liquidGlassTheme.text.primary,
        fontSize: 16,
        height: 48,
    },
});
