import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Tool, ToolScore } from '../../types';
import { clayTheme, spacing } from '../../theme/clay';
import { ToolIcon } from '../ui/tool-icon';

interface RecommendationCardProps {
    tool: Tool;
    score: ToolScore;
    reason: string;
    onPress: () => void;
    onCompare?: () => void;
    variant?: 'best' | 'alternative' | 'budget';
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
    tool,
    score,
    reason,
    onPress,
    onCompare,
    variant = 'best',
}) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'best':
                return {
                    borderColor: clayTheme.accent.success,
                    badgeColor: clayTheme.accent.success,
                    badgeText: 'Best Match',
                    icon: 'trophy',
                };
            case 'alternative':
                return {
                    borderColor: clayTheme.accent.primary,
                    badgeColor: clayTheme.accent.primary,
                    badgeText: 'Alternative',
                    icon: 'exchange',
                };
            case 'budget':
                return {
                    borderColor: clayTheme.accent.warning,
                    badgeColor: clayTheme.accent.warning,
                    badgeText: 'Budget Option',
                    icon: 'money',
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <TouchableOpacity
            style={[styles.container, { borderColor: variantStyles.borderColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            {/* Header with score */}
            <View style={styles.header}>
                <View style={[styles.badge, { backgroundColor: variantStyles.badgeColor }]}>
                    <FontAwesome name={variantStyles.icon as any} size={10} color="#FFF" />
                    <Text style={styles.badgeText}>{variantStyles.badgeText}</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>Match</Text>
                    <Text style={[styles.scoreValue, { color: variantStyles.badgeColor }]}>
                        {score.matchPercentage}%
                    </Text>
                </View>
            </View>

            {/* Tool info */}
            <View style={styles.toolInfo}>
                <ToolIcon
                    url={tool.icon_url}
                    letter={tool.icon_letter}
                    color={tool.color}
                    size={48}
                    borderRadius={12}
                    fontSize={20}
                />
                <View style={styles.toolDetails}>
                    <Text style={styles.toolName}>{tool.name}</Text>
                    <Text style={styles.toolCategory} numberOfLines={1}>{tool.category}</Text>
                </View>
            </View>

            {/* Reason */}
            <Text style={styles.reason}>{reason}</Text>

            {/* Score breakdown */}
            <View style={styles.scoreBreakdown}>
                <View style={styles.scoreItem}>
                    <FontAwesome name="tag" size={12} color={clayTheme.text.tertiary} />
                    <Text style={styles.scoreItemText}>Price: {score.priceScore}/100</Text>
                </View>
                <View style={styles.scoreItem}>
                    <FontAwesome name="star" size={12} color={clayTheme.text.tertiary} />
                    <Text style={styles.scoreItemText}>Features: {score.featureScore}/100</Text>
                </View>
                <View style={styles.scoreItem}>
                    <FontAwesome name="bolt" size={12} color={clayTheme.text.tertiary} />
                    <Text style={styles.scoreItemText}>Ease: {score.easeScore}/100</Text>
                </View>
            </View>

            {/* Actions */}
            {onCompare && (
                <TouchableOpacity style={styles.compareButton} onPress={onCompare}>
                    <FontAwesome name="balance-scale" size={14} color={clayTheme.accent.primary} />
                    <Text style={styles.compareButtonText}>Compare</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: clayTheme.surface,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    scoreLabel: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
    },
    scoreValue: {
        fontSize: 20,
        fontWeight: '800',
    },
    toolInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    toolDetails: {
        flex: 1,
    },
    toolName: {
        fontSize: 18,
        fontWeight: '700',
        color: clayTheme.text.primary,
    },
    toolCategory: {
        fontSize: 13,
        color: clayTheme.text.secondary,
    },
    reason: {
        fontSize: 14,
        color: clayTheme.text.secondary,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    scoreBreakdown: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    scoreItemText: {
        fontSize: 12,
        color: clayTheme.text.tertiary,
    },
    compareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: clayTheme.background,
    },
    compareButtonText: {
        color: clayTheme.accent.primary,
        fontWeight: '600',
        fontSize: 14,
    },
});
