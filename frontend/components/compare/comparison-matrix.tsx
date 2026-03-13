import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Tool } from '../../types';
import { clayTheme, spacing } from '../../theme/clay';
import { ToolIcon } from '../ui/tool-icon';
import { getComparisonData, calculateToolScore, sortTools } from '../../utils/comparison';
import { UserPreferences, ToolScore } from '../../types';

interface ComparisonMatrixProps {
    tools: Tool[];
    selectedToolId?: string;
    onToolSelect: (tool: Tool) => void;
    onAddToCompare: (tool: Tool) => void;
    preferences?: UserPreferences;
    maxVisible?: number;
}

const ROW_HEIGHTS = {
    header: 100,
    score: 40,
    category: 40,
    pricing: 40,
    freeTier: 40,
    platforms: 60,
    features: 100,
    action: 60,
};

const LABEL_COLUMN_WIDTH = 100;
const DATA_COLUMN_WIDTH = 140;

export const ComparisonMatrix: React.FC<ComparisonMatrixProps> = ({
    tools,
    selectedToolId,
    onToolSelect,
    onAddToCompare,
    preferences,
    maxVisible = 5,
}) => {
    const getScore = (tool: Tool): ToolScore | null => {
        if (!preferences) return null;
        return calculateToolScore(tool, preferences);
    };

    const visibleTools = tools.slice(0, maxVisible);
    const hasMore = tools.length > maxVisible;

    // Render the fixed left column with labels
    const renderLeftColumn = () => (
        <View style={styles.leftColumn}>
            {/* Header spacer */}
            <View style={[styles.cell, styles.headerCell, { height: ROW_HEIGHTS.header, backgroundColor: 'transparent' }]} />

            <View style={[styles.cell, { height: ROW_HEIGHTS.score }]}><Text style={styles.label}>Match Score</Text></View>
            <View style={[styles.cell, { height: ROW_HEIGHTS.category }]}><Text style={styles.label}>Category</Text></View>

            <View style={[styles.sectionHeader]}><Text style={styles.sectionHeaderText}>Pricing</Text></View>
            <View style={[styles.cell, { height: ROW_HEIGHTS.pricing }]}><Text style={styles.label}>Model</Text></View>
            <View style={[styles.cell, { height: ROW_HEIGHTS.freeTier }]}><Text style={styles.label}>Free Tier</Text></View>

            <View style={[styles.sectionHeader]}><Text style={styles.sectionHeaderText}>Specs</Text></View>
            <View style={[styles.cell, { height: ROW_HEIGHTS.platforms }]}><Text style={styles.label}>Platforms</Text></View>
            <View style={[styles.cell, { height: ROW_HEIGHTS.features }]}><Text style={styles.label}>Top Features</Text></View>

            {/* Action spacer */}
            <View style={[styles.cell, { height: ROW_HEIGHTS.action, backgroundColor: 'transparent', borderBottomWidth: 0 }]} />
        </View>
    );

    const renderToolColumn = ({ item: tool }: { item: Tool }) => {
        const isSelected = tool._id === selectedToolId;
        const score = getScore(tool);
        const compData = getComparisonData(tool);

        return (
            <TouchableOpacity
                style={[styles.toolColumn, isSelected && styles.toolColumnSelected]}
                onPress={() => onToolSelect(tool)}
                activeOpacity={1}
            >
                {/* Tool Header */}
                <View style={[styles.cell, styles.headerCell, { height: ROW_HEIGHTS.header }]}>
                    <ToolIcon
                        url={tool.icon_url}
                        letter={tool.icon_letter}
                        color={tool.color}
                        size={48}
                        borderRadius={14}
                        fontSize={20}
                    />
                    <Text style={styles.toolName} numberOfLines={2}>
                        {tool.name}
                    </Text>
                </View>

                {/* Score */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.score }]}>
                    {score ? (
                        <View style={[styles.scoreBadge, { backgroundColor: tool.color || clayTheme.accent.primary }]}>
                            <Text style={styles.scoreText}>{score.totalScore}</Text>
                        </View>
                    ) : (
                        <Text style={styles.dataText}>-</Text>
                    )}
                </View>

                {/* Category */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.category }]}>
                    <Text style={styles.dataText} numberOfLines={1}>{tool.category}</Text>
                </View>

                {/* Pricing Section - Spacer matching label header */}
                <View style={styles.sectionHeaderSpacer} />

                {/* Pricing Model */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.pricing }]}>
                    <Text style={styles.dataText} numberOfLines={1}>
                        {compData.pricing?.model || 'N/A'}
                    </Text>
                </View>

                {/* Free Tier */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.freeTier }]}>
                    <FontAwesome
                        name={compData.pricing?.free_tier ? 'check-circle' : 'times-circle'}
                        size={16}
                        color={compData.pricing?.free_tier ? clayTheme.accent.success : clayTheme.text.tertiary}
                    />
                </View>

                {/* Specs Section - Spacer matching label header */}
                <View style={styles.sectionHeaderSpacer} />

                {/* Platforms */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.platforms, justifyContent: 'center' }]}>
                    <View style={styles.iconRow}>
                        {compData.platforms?.web && <FontAwesome name="globe" size={14} color={clayTheme.text.secondary} />}
                        {(compData.platforms?.ios || compData.platforms?.android) && <FontAwesome name="mobile" size={16} color={clayTheme.text.secondary} />}
                        {compData.platforms?.api && <FontAwesome name="code" size={14} color={clayTheme.text.secondary} />}
                    </View>
                </View>

                {/* Features */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.features, justifyContent: 'flex-start', paddingTop: 12 }]}>
                    <View style={styles.featureList}>
                        {compData.features ? (
                            Object.entries(compData.features)
                                .filter(([_, v]) => v)
                                .slice(0, 3)
                                .map(([k, _]) => (
                                    <Text key={k} style={styles.featureTag}>
                                        • {k.replace(/_/g, ' ')}
                                    </Text>
                                ))
                        ) : (
                            <Text style={styles.dataText}>-</Text>
                        )}
                    </View>
                </View>

                {/* Action */}
                <View style={[styles.cell, { height: ROW_HEIGHTS.action, borderBottomWidth: 0, justifyContent: 'center' }]}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => onAddToCompare(tool)}
                    >
                        <Text style={styles.addButtonText}>+ Compare</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    // Main Layout: Row [LeftColumn, ScrollView(Columns)]
    return (
        <View style={styles.container}>
            <View style={styles.matrixContainer}>
                {renderLeftColumn()}

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.columnsScroll}
                >
                    {visibleTools.map((tool) => (
                        <View key={tool._id} style={styles.columnWrapper}>
                            {renderToolColumn({ item: tool })}
                        </View>
                    ))}

                    {hasMore && (
                        <View style={[styles.columnWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={styles.moreText}>+{tools.length - maxVisible}</Text>
                            <Text style={styles.moreSubtext}>more</Text>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    matrixContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
    },
    leftColumn: {
        width: LABEL_COLUMN_WIDTH,
        backgroundColor: clayTheme.surface,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        zIndex: 10,
        // Clay Shadow for Left Column
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    columnsScroll: {
        paddingRight: spacing.lg,
    },
    columnWrapper: {
        width: DATA_COLUMN_WIDTH,
    },
    toolColumn: {
        width: DATA_COLUMN_WIDTH,
        backgroundColor: clayTheme.background, // Alternating bg illusion
        borderRightWidth: 1,
        borderRightColor: 'rgba(0,0,0,0.05)',
    },
    toolColumnSelected: {
        backgroundColor: clayTheme.accent.primary + '10', // Highlight selected
    },
    cell: {
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 8,
    },
    headerCell: {
        justifyContent: 'flex-start',
        paddingTop: 16,
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: clayTheme.text.secondary,
        textAlign: 'center',
    },
    sectionHeader: {
        height: 32,
        justifyContent: 'center',
        paddingLeft: 12,
        backgroundColor: clayTheme.background,
    },
    sectionHeaderSpacer: {
        height: 32,
        backgroundColor: clayTheme.background,
    },
    sectionHeaderText: {
        fontSize: 11,
        fontWeight: '700',
        color: clayTheme.text.tertiary,
        textTransform: 'uppercase',
    },
    toolName: {
        fontSize: 13,
        fontWeight: '700',
        color: clayTheme.text.primary,
        textAlign: 'center',
        marginTop: 8,
        height: 36, // limit height
    },
    scoreBadge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    scoreText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    dataText: {
        fontSize: 12,
        color: clayTheme.text.primary,
        textAlign: 'center',
    },
    iconRow: {
        flexDirection: 'row',
        gap: 6,
    },
    featureList: {
        alignItems: 'flex-start',
        width: '100%',
    },
    featureTag: {
        fontSize: 10,
        color: clayTheme.text.secondary,
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    addButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: clayTheme.accent.success + '15',
    },
    addButtonText: {
        fontSize: 11,
        color: clayTheme.accent.success,
        fontWeight: '600',
    },
    moreText: {
        fontSize: 16,
        fontWeight: '700',
        color: clayTheme.accent.primary,
    },
    moreSubtext: {
        fontSize: 11,
        color: clayTheme.text.tertiary,
    },
});
