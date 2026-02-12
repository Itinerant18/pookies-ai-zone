import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { liquidGlassTheme, glassUtils, spacing } from '../../theme/liquidGlass';
import { AnimatedPress } from './animated-press';

interface ToolListCardProps {
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    iconLetter: string;
    color: string;
    isFavorite?: boolean;
    onPress: () => void;
    onToggleFavorite?: () => void;
    testID?: string;
}

export function ToolListCard({
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
}: ToolListCardProps) {
    return (
        <AnimatedPress
            testID={testID}
            style={styles.card}
            onPress={onPress}
            accessibilityLabel={`Open ${name}`}
            accessibilityRole="button"
        >
            <View style={styles.left}>
                <View style={[styles.iconBox, { backgroundColor: iconUrl ? 'transparent' : color }]}>
                    {iconUrl ? (
                        <Image
                            source={{ uri: iconUrl }}
                            style={styles.iconImage}
                            contentFit="contain"
                        />
                    ) : (
                        <Text style={styles.iconLetter}>{iconLetter}</Text>
                    )}
                </View>
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.desc} numberOfLines={1}>{description}</Text>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{category}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.right}>
                {onToggleFavorite && (
                    <TouchableOpacity
                        onPress={onToggleFavorite}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.favBtn}
                        accessibilityLabel={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                    >
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={isFavorite ? liquidGlassTheme.accent.error : liquidGlassTheme.text.tertiary}
                        />
                    </TouchableOpacity>
                )}
                <Ionicons name="chevron-forward" size={16} color={liquidGlassTheme.text.tertiary} />
            </View>
        </AnimatedPress>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...glassUtils.card,
        padding: 14,
        marginHorizontal: spacing.lg,
        marginBottom: 10,
    } as ViewStyle,
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconImage: {
        width: '100%',
        height: '100%',
        borderRadius: 12,
    },
    iconLetter: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 15,
        fontWeight: '600',
        color: liquidGlassTheme.text.primary,
    },
    desc: {
        fontSize: 12,
        color: liquidGlassTheme.text.secondary,
        marginTop: 2,
    },
    pill: {
        ...glassUtils.pill,
        alignSelf: 'flex-start',
        marginTop: 6,
    } as ViewStyle,
    pillText: {
        fontSize: 10,
        color: liquidGlassTheme.text.secondary,
        fontWeight: '500',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    favBtn: {
        padding: 4,
    },
});
