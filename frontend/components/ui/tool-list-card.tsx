import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons';
import { ToolIcon } from './tool-icon';
import { clayTheme, clayUtils, spacing, layout } from '../../theme/clay';
import { AnimatedPress } from './animated-press';

interface ToolListCardProps {
    name: string;
    description: string;
    category: string;
    iconUrl?: string;
    iconLetter: string;
    color: string;
    isFavorite?: boolean;
    isComparing?: boolean;
    onPress: () => void;
    onToggleFavorite?: () => void;
    onToggleCompare?: () => void;
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
    isComparing,
    onPress,
    onToggleFavorite,
    onToggleCompare,
    testID,
}: ToolListCardProps) {
    return (
        <AnimatedPress
            testID={testID}
            style={[styles.card, isComparing ? styles.cardComparing : {}]}
            onPress={onPress}
            accessibilityLabel={`Open ${name}`}
            accessibilityRole="button"
        >
            <View style={styles.left}>
                <ToolIcon
                    url={iconUrl}
                    letter={iconLetter}
                    color={color}
                    size={44}
                    borderRadius={12}
                    fontSize={18}
                />
                <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{name}</Text>
                    <Text style={styles.desc} numberOfLines={1}>{description}</Text>
                    <View style={styles.pill}>
                        <Text style={styles.pillText}>{category}</Text>
                    </View>
                </View>
            </View>
            <View style={styles.right}>
                {onToggleCompare && (
                    <TouchableOpacity
                        onPress={onToggleCompare}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.actionBtn}
                    >
                        <FontAwesome
                            name={isComparing ? 'bar-chart' : 'bar-chart-o'}
                            size={16}
                            color={isComparing ? clayTheme.accent.primary : clayTheme.text.tertiary}
                        />
                    </TouchableOpacity>
                )}
                {onToggleFavorite && (
                    <TouchableOpacity
                        onPress={onToggleFavorite}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.actionBtn}
                        accessibilityLabel={isFavorite ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
                    >
                        <FontAwesome
                            name={isFavorite ? 'heart' : 'heart-o'}
                            size={18}
                            color={isFavorite ? clayTheme.accent.error : clayTheme.text.tertiary}
                        />
                    </TouchableOpacity>
                )}
                <FontAwesome name="chevron-right" size={14} color={clayTheme.text.tertiary} />
            </View>
        </AnimatedPress>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...clayUtils.card,
        padding: 14,
        marginHorizontal: layout.screenPadding,
        marginBottom: 10,
    } as ViewStyle,
    cardComparing: {
        borderColor: clayTheme.accent.primary,
        borderWidth: 1,
    },
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
        color: clayTheme.text.primary,
    },
    desc: {
        fontSize: 12,
        color: clayTheme.text.secondary,
        marginTop: 2,
    },
    pill: {
        alignSelf: 'flex-start',
        marginTop: 6,
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
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionBtn: {
        padding: 4,
    },
});
