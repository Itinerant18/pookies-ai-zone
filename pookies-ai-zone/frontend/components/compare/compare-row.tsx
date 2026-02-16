import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Tool } from '../../types';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';

interface CompareRowProps {
    label: string;
    dataKey: keyof Tool | string;
    tools: Tool[];
    scrollRef?: React.RefObject<ScrollView | null>;
    onScroll?: (event: any) => void;
    onScrollBeginDrag?: () => void;
    onScrollEndDrag?: () => void;
    onMomentumScrollEnd?: () => void;
    columnWidth: number;
    isAlternate?: boolean;
}

export function CompareRow({
    label,
    dataKey,
    tools,
    scrollRef,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    columnWidth,
    isAlternate
}: CompareRowProps) {
    const renderValue = (tool: Tool | undefined, key: string) => {
        if (!tool) return <Text style={styles.loadingText}>...</Text>;

        switch (key) {
            case 'pricing':
                if (!tool.pricing) return <Text style={styles.naText}>N/A</Text>;
                const isFree = tool.pricing.model.toLowerCase().includes('free');
                const isPaid = tool.pricing.model.toLowerCase().includes('paid');
                const badgeColor = isFree ? clayTheme.accent.success : (isPaid ? clayTheme.accent.primary : clayTheme.accent.warning);

                return (
                    <View style={styles.pricingContainer}>
                        <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
                            <Text style={[styles.badgeText, { color: badgeColor }]}>{tool.pricing.model}</Text>
                        </View>
                        {(tool.pricing.starting_price !== undefined) && (
                            <Text style={styles.priceValue}>
                                {tool.pricing.currency || '$'}{tool.pricing.starting_price}/mo
                            </Text>
                        )}
                    </View>
                );
            case 'platforms':
                return (
                    <View style={styles.tagsContainer}>
                        {tool.platforms?.map(p => (
                            <View key={p} style={styles.tag}>
                                <Text style={styles.tagText}>{p}</Text>
                            </View>
                        )) || <Text style={styles.naText}>N/A</Text>}
                    </View>
                );
            case 'features':
                return (
                    <View style={styles.tagsContainer}>
                        {tool.features?.map(f => (
                            <View key={f} style={[styles.tag, styles.featureTag]}>
                                <Text style={styles.tagText}>{f}</Text>
                            </View>
                        )) || <Text style={styles.naText}>N/A</Text>}
                    </View>
                );
            case 'pros':
            case 'cons':
                const items = key === 'pros' ? tool.pros : tool.cons;
                const icon = key === 'pros' ? 'check-circle' : 'times-circle';
                const color = key === 'pros' ? clayTheme.accent.success : clayTheme.accent.error;

                return (
                    <View style={styles.listContainer}>
                        {items?.map((item, i) => (
                            <View key={i} style={styles.listItem}>
                                <FontAwesome name={icon} size={14} color={color} style={{ marginTop: 2 }} />
                                <Text style={styles.listText}>{item}</Text>
                            </View>
                        )) || <Text style={styles.naText}>N/A</Text>}
                    </View>
                );
            default: // Category or others
                const val = (tool as any)[key];
                return <Text style={styles.textValue}>{val || 'N/A'}</Text>;
        }
    };

    return (
        <View style={[styles.container, isAlternate && styles.alternateContainer]}>
            <View style={styles.labelCell}>
                <Text style={styles.labelText}>{label}</Text>
            </View>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                contentContainerStyle={styles.scrollContent}
            >
                {tools.map((tool, index) => (
                    <View key={tool?._id || index} style={[styles.dataCell, { width: columnWidth }]}>
                        {renderValue(tool, dataKey as string)}
                    </View>
                ))}
                {/* Spacer */}
                <View style={{ width: spacing.lg }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: clayTheme.clay.shadowLight,
        minHeight: 60,
    },
    alternateContainer: {
        backgroundColor: clayTheme.surface,
    },
    labelCell: {
        width: 100,
        justifyContent: 'center',
        paddingLeft: spacing.lg,
        paddingRight: spacing.xs,
        backgroundColor: 'transparent', // Let row bg show through
    },
    labelText: {
        fontSize: 13,
        fontWeight: '600',
        color: clayTheme.text.secondary,
    },
    scrollContent: {
        paddingRight: spacing.lg,
    },
    dataCell: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xs,
        marginHorizontal: spacing.xs,
    },
    loadingText: {
        color: clayTheme.text.tertiary,
    },
    naText: {
        color: clayTheme.text.tertiary,
        fontStyle: 'italic',
        fontSize: 12,
    },
    textValue: {
        color: clayTheme.text.primary,
        fontSize: 14,
        textAlign: 'center',
    },
    pricingContainer: {
        alignItems: 'center',
        gap: 4,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: 13,
        color: clayTheme.text.primary,
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
    },
    tag: {
        backgroundColor: clayTheme.background,
        borderWidth: 1,
        borderColor: clayTheme.clay.shadowLight,
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    featureTag: {
        backgroundColor: clayTheme.accent.primary + '10',
        borderColor: clayTheme.accent.primary + '30',
    },
    tagText: {
        fontSize: 11,
        color: clayTheme.text.secondary,
    },
    listContainer: {
        gap: 4,
        width: '100%',
    },
    listItem: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'flex-start',
    },
    listText: {
        fontSize: 12,
        color: clayTheme.text.primary,
        flex: 1,
    },
});
