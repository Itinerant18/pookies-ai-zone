import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { liquidGlassTheme, glassUtils, spacing } from '../../theme/liquidGlass';
import { AnimatedPress } from './animated-press';

interface ToolGridCardProps {
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    iconLetter: string;
    color: string;
    isFavorite: boolean;
    onPress: () => void;
    onToggleFavorite: () => void;
    testID?: string;
}

export function ToolGridCard({
    name,
    description,
    category,
    iconUrl,
    iconLetter,
    color,
    isFavorite,
    onPress,
    onToggleFavorite,
    testID,
}: ToolGridCardProps) {
    return (
        <AnimatedPress
            testID={testID}
            style={styles.card}
            onPress={onPress}
            accessibilityLabel={`Open ${name} `}
            accessibilityRole="button"
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: iconUrl ? 'transparent' : color }]}>
                    {iconUrl ? (
                        <Image
                            source={{ uri: iconUrl }}
                            style={styles.iconImage}
                            contentFit="contain"
                            transition={200}
                        />
                    ) : (
                        <Text style={styles.iconLetter}>{iconLetter}</Text>
                    )}
                </View>
                <TouchableOpacity
                    onPress={onToggleFavorite}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFavorite ? liquidGlassTheme.accent.error : liquidGlassTheme.text.tertiary}
                    />
                </TouchableOpacity>
            </View>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            <Text style={styles.desc} numberOfLines={2}>{description}</Text>
            <View style={styles.pill}>
                <Text style={styles.pillText}>{category}</Text>
            </View>
        </AnimatedPress>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        ...glassUtils.card,
        padding: 14,
        marginBottom: spacing.md,
    } as ViewStyle,
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    iconLetter: {
        fontSize: 16,
        fontWeight: '700',
        color: liquidGlassTheme.text.primary,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: liquidGlassTheme.text.primary,
        marginBottom: 4,
    },
    desc: {
        fontSize: 12,
        color: liquidGlassTheme.text.secondary,
        lineHeight: 16,
        marginBottom: 10,
    },
    pill: {
        ...glassUtils.pill,
        alignSelf: 'flex-start',
    } as ViewStyle,
    pillText: {
        fontSize: 10,
        color: liquidGlassTheme.text.secondary,
        fontWeight: '500',
    },
});
