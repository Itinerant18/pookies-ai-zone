import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { AnimatedPress } from './animated-press';
import { FontAwesome } from '@expo/vector-icons';

interface ClayButtonProps {
    title?: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: keyof typeof FontAwesome.glyphMap;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

export function ClayButton({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    style,
    textStyle,
    disabled = false,
}: ClayButtonProps) {
    const getBackgroundColor = () => {
        if (disabled) return clayTheme.text.tertiary;
        switch (variant) {
            case 'primary': return clayTheme.accent.primary;
            case 'secondary': return clayTheme.surface;
            case 'danger': return clayTheme.accent.error;
            case 'ghost': return 'transparent';
            default: return clayTheme.accent.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return clayTheme.surface;
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'secondary': return clayTheme.text.primary;
            case 'danger': return '#FFFFFF';
            case 'ghost': return clayTheme.text.primary;
            default: return '#FFFFFF';
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 };
            case 'lg': return { paddingVertical: 16, paddingHorizontal: 24, borderRadius: 20 };
            default: return { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 16 };
        }
    };

    const isGhost = variant === 'ghost';
    const baseStyle = isGhost ? {} : clayUtils.button;

    return (
        <AnimatedPress
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.container,
                baseStyle as ViewStyle,
                { backgroundColor: getBackgroundColor() },
                getSizeStyles(),
                isGhost ? { shadowOpacity: 0, elevation: 0 } : {},
                style || {},
            ]}
        >
            <View style={styles.content}>
                {icon && (
                    <FontAwesome
                        name={icon}
                        size={size === 'sm' ? 16 : 20}
                        color={getTextColor()}
                        style={title ? { marginRight: 8 } : {}}
                    />
                )}
                {title && (
                    <Text style={[
                        styles.text,
                        { color: getTextColor(), fontSize: size === 'sm' ? 12 : 14 },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                )}
            </View>
        </AnimatedPress>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
