import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ViewStyle,
    TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { ToolIcon } from './tool-icon';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { AnimatedPress } from './animated-press';

interface ToolGridCardProps {
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    iconLetter: string;
    color: string;
    isFavorite: boolean;
    isComparing: boolean;
    onPress: () => void;
    onToggleFavorite: () => void;
    onToggleCompare: () => void;
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
    isComparing,
    onPress,
    onToggleFavorite,
    onToggleCompare,
    testID,
}: ToolGridCardProps) {
    return (
        <AnimatedPress
            testID={testID}
            style={[styles.card, isComparing ? styles.cardComparing : {}]}
            onPress={onPress}
            accessibilityLabel={`Open ${name} `}
            accessibilityRole="button"
        >
            <View style={styles.cardHeader}>
                <ToolIcon
                    url={iconUrl}
                    letter={iconLetter}
                    color={color}
                    size={36}
                    borderRadius={10}
                    fontSize={16}
                />
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={onToggleCompare}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={isComparing ? `Remove ${name} from comparison` : `Add ${name} to comparison`}
                    >
                        <FontAwesome
                            name={isComparing ? 'bar-chart' : 'bar-chart-o'}
                            size={16}
                            color={isComparing ? clayTheme.accent.primary : clayTheme.text.tertiary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onToggleFavorite}
                        style={styles.actionBtn}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                    >
                        <FontAwesome
                            name={isFavorite ? 'heart' : 'heart-o'}
                            size={18}
                            color={isFavorite ? clayTheme.accent.error : clayTheme.text.tertiary}
                        />
                    </TouchableOpacity>
                </View>
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
        ...clayUtils.card,
        padding: 14,
        overflow: 'hidden',
    } as ViewStyle,
    cardComparing: {
        borderColor: clayTheme.accent.primary,
        borderWidth: 1.5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        padding: 2,
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
        color: clayTheme.text.primary,
    },
    name: {
        fontSize: 14,
        fontWeight: '600',
        color: clayTheme.text.primary,
        marginBottom: 2,
    },
    desc: {
        fontSize: 11,
        color: clayTheme.text.secondary,
        lineHeight: 15,
    },
    pill: {
        alignSelf: 'flex-start',
        backgroundColor: '#F4F6F8',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    } as ViewStyle,
    pillText: {
        fontSize: 10,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
});
