import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { FontAwesome } from '@expo/vector-icons';
import { clayTheme, spacing, layout } from '../theme/clay';
import { ClayButton } from '../components/ui/clay-button';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tool, UserPreferences, ToolScore } from '../types';
import {
    calculateToolScore,
    getSimilarTools,
    getBetterAlternatives,
    getBudgetAlternatives,
    sortTools,
    getAllCategories,
    getFeaturesList,
    getPlatformsList
} from '../utils/comparison';
import { RecommendationCard } from '../components/recommendations/recommendation-card';
import { ComparisonMatrix } from '../components/compare/comparison-matrix';
import { CompareFilter } from '../components/compare/compare-filter';
import { loadPreferences, DEFAULT_PREFERENCES } from '../utils/preferences';


const COLUMN_WIDTH = 160;

export default function CompareScreen() {
    const { ids } = useLocalSearchParams<{ ids: string }>();
    const router = useRouter();
    const idList = ids?.split(',') || [];

    // View mode: 'selected' | 'matrix' | 'recommendations'
    const [viewMode, setViewMode] = useState<'selected' | 'matrix' | 'recommendations'>('selected');

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'price' | 'features' | 'score'>('score');

    // Selected tool for detailed comparison
    const [selectedToolId, setSelectedToolId] = useState<string | null>(null);

    const allTools = useQuery(api.tools.get, {});
    const tools = useQuery(api.tools.getByIds, { ids: idList });

    // User preferences (loaded from AsyncStorage)
    const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        loadPreferences().then(setPreferences);
    }, []);

    // Get unique categories
    const categories = useMemo(() => {
        if (!allTools) return [];
        return getAllCategories(allTools);
    }, [allTools]);

    // Price ranges for filter
    const priceRanges = [
        { label: 'Free', min: 0, max: 0 },
        { label: '$1-20', min: 1, max: 20 },
        { label: '$21-50', min: 21, max: 50 },
        { label: '$51-100', min: 51, max: 100 },
        { label: '$100+', min: 101, max: Infinity },
    ];

    // Filter and sort tools
    const filteredTools = useMemo(() => {
        if (!allTools) return [];

        let filtered = [...allTools];

        // Category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(t => t.category === selectedCategory);
        }

        // Price range filter
        if (selectedPriceRange !== null) {
            const range = priceRanges[selectedPriceRange];
            filtered = filtered.filter(t => {
                const price = t.comparison_data?.pricing?.starting_price || 0;
                return price >= range.min && price <= range.max;
            });
        }

        // Sort
        return sortTools(filtered, sortBy, sortBy === 'name', preferences);
    }, [allTools, selectedCategory, selectedPriceRange, sortBy]);

    // Get recommendations for selected tool
    const recommendations = useMemo(() => {
        if (!selectedToolId || !allTools) return null;

        const selectedTool = allTools.find(t => t._id === selectedToolId);
        if (!selectedTool) return null;

        const better = getBetterAlternatives(selectedTool, allTools, preferences, 2);
        const budget = getBudgetAlternatives(selectedTool, allTools, 2);
        const similar = getSimilarTools(selectedTool, allTools, 3);

        return { better, budget, similar };
    }, [selectedToolId, allTools, preferences]);

    const removeTool = async (idToRemove: string) => {
        const newIds = idList.filter(id => id !== idToRemove);
        if (newIds.length === 0) {
            router.back();
            await AsyncStorage.setItem('comparing', JSON.stringify([]));
        } else {
            router.setParams({ ids: newIds.join(',') });
            await AsyncStorage.setItem('comparing', JSON.stringify(newIds));
        }
    };

    const addToCompare = async (tool: Tool) => {
        if (idList.includes(tool._id)) return;
        if (idList.length >= 4) return;

        const newIds = [...idList, tool._id];
        router.setParams({ ids: newIds.join(',') });
        await AsyncStorage.setItem('comparing', JSON.stringify(newIds));
    };

    if (allTools === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loading}>
                    <Text style={styles.text}>Loading tools...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <ClayButton
                    onPress={() => router.back()}
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    style={styles.backBtn}
                />
                <Text style={styles.title}>Compare Tools</Text>
                <View style={styles.viewToggle}>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'selected' && styles.viewBtnActive]}
                        onPress={() => setViewMode('selected')}
                    >
                        <FontAwesome
                            name="balance-scale"
                            size={16}
                            color={viewMode === 'selected' ? '#FFF' : clayTheme.text.secondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'matrix' && styles.viewBtnActive]}
                        onPress={() => setViewMode('matrix')}
                    >
                        <FontAwesome
                            name="th"
                            size={16}
                            color={viewMode === 'matrix' ? '#FFF' : clayTheme.text.secondary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.viewBtn, viewMode === 'recommendations' && styles.viewBtnActive]}
                        onPress={() => setViewMode('recommendations')}
                    >
                        <FontAwesome
                            name="lightbulb-o"
                            size={16}
                            color={viewMode === 'recommendations' ? '#FFF' : clayTheme.text.secondary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.mainScroll} showsVerticalScrollIndicator={false}>
                {/* View Mode: Selected Tools (Original) */}
                {viewMode === 'selected' && (
                    <>
                        {tools && tools.length > 0 ? (
                            <>
                                <Text style={styles.sectionTitle}>
                                    Selected Tools ({tools.length})
                                </Text>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.selectedToolsContainer}
                                >
                                    {tools.map((tool: any) => (
                                        <View key={tool._id} style={styles.selectedToolCard}>
                                            <TouchableOpacity
                                                style={styles.removeBtn}
                                                onPress={() => removeTool(tool._id)}
                                            >
                                                <FontAwesome name="times" size={12} color="#FFF" />
                                            </TouchableOpacity>
                                            <Text style={styles.selectedToolName} numberOfLines={1}>
                                                {tool.name}
                                            </Text>
                                            <Text style={styles.selectedToolCategory}>
                                                {tool.category}
                                            </Text>
                                        </View>
                                    ))}
                                </ScrollView>
                            </>
                        ) : (
                            <View style={styles.emptyState}>
                                <FontAwesome name="balance-scale" size={48} color={clayTheme.text.tertiary} />
                                <Text style={styles.emptyTitle}>No tools selected</Text>
                                <Text style={styles.emptySubtitle}>
                                    Add tools from the home screen or browse the matrix view
                                </Text>
                            </View>
                        )}

                        {/* Comparison Table */}
                        {tools && tools.length > 1 && (
                            <View style={styles.tableContainer}>
                                {['Category', 'Pricing', 'Platforms', 'Features'].map((rowLabel) => (
                                    <View key={rowLabel} style={styles.tableRow}>
                                        <Text style={styles.tableLabel}>{rowLabel}</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.tableCells}>
                                                {tools.map((tool: any) => (
                                                    <View key={tool._id} style={styles.tableCell}>
                                                        <Text style={styles.tableCellText} numberOfLines={2}>
                                                            {rowLabel === 'Category' && tool.category}
                                                            {rowLabel === 'Pricing' && (tool.comparison_data?.pricing?.model || 'N/A')}
                                                            {rowLabel === 'Platforms' && (getPlatformsList(tool.comparison_data?.platforms).join(', ') || 'N/A')}
                                                            {rowLabel === 'Features' && (getFeaturesList(tool.comparison_data?.features).slice(0, 3).join(', ') || 'N/A')}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}

                {/* View Mode: Matrix */}
                {viewMode === 'matrix' && (
                    <>
                        <CompareFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            priceRanges={priceRanges}
                            selectedPriceRange={selectedPriceRange}
                            onPriceRangeChange={setSelectedPriceRange}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />

                        <Text style={styles.sectionTitle}>
                            {filteredTools.length} Tools in {selectedCategory}
                        </Text>

                        <ComparisonMatrix
                            tools={filteredTools}
                            selectedToolId={selectedToolId || undefined}
                            onToolSelect={(tool) => setSelectedToolId(tool._id)}
                            onAddToCompare={addToCompare}
                            preferences={preferences}
                            maxVisible={5}
                        />
                    </>
                )}

                {/* View Mode: Recommendations */}
                {viewMode === 'recommendations' && (
                    <>
                        <Text style={styles.sectionTitle}>Smart Recommendations</Text>
                        <Text style={styles.sectionSubtitle}>
                            Find the best tool for your needs
                        </Text>

                        {/* Select a tool to get recommendations */}
                        {idList.length > 0 && (
                            <View style={styles.recommendationSection}>
                                <Text style={styles.recommendationTitle}>
                                    Based on your selection
                                </Text>
                                {recommendations?.better && recommendations.better.length > 0 && (
                                    <View>
                                        <Text style={styles.recommendationLabel}>Better Alternatives</Text>
                                        {recommendations.better.map((tool: Tool) => (
                                            <RecommendationCard
                                                key={tool._id}
                                                tool={tool}
                                                score={calculateToolScore(tool, preferences)}
                                                reason="Higher score with more features"
                                                onPress={() => setSelectedToolId(tool._id)}
                                                onCompare={() => addToCompare(tool)}
                                                variant="best"
                                            />
                                        ))}
                                    </View>
                                )}

                                {recommendations?.budget && recommendations.budget.length > 0 && (
                                    <View>
                                        <Text style={styles.recommendationLabel}>Budget Options</Text>
                                        {recommendations.budget.map((tool: Tool) => (
                                            <RecommendationCard
                                                key={tool._id}
                                                tool={tool}
                                                score={calculateToolScore(tool, preferences)}
                                                reason="Cheaper with similar core features"
                                                onPress={() => setSelectedToolId(tool._id)}
                                                onCompare={() => addToCompare(tool)}
                                                variant="budget"
                                            />
                                        ))}
                                    </View>
                                )}

                                {recommendations?.similar && recommendations.similar.length > 0 && (
                                    <View>
                                        <Text style={styles.recommendationLabel}>Similar Tools</Text>
                                        {recommendations.similar.map((tool: Tool) => (
                                            <RecommendationCard
                                                key={tool._id}
                                                tool={tool}
                                                score={calculateToolScore(tool, preferences)}
                                                reason="Similar category and features"
                                                onPress={() => setSelectedToolId(tool._id)}
                                                onCompare={() => addToCompare(tool)}
                                                variant="alternative"
                                            />
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {idList.length === 0 && (
                            <View style={styles.emptyState}>
                                <FontAwesome name="lightbulb-o" size={48} color={clayTheme.text.tertiary} />
                                <Text style={styles.emptyTitle}>Select a tool first</Text>
                                <Text style={styles.emptySubtitle}>
                                    Add tools to compare and get personalized recommendations
                                </Text>
                                <ClayButton
                                    title="Browse Tools"
                                    onPress={() => router.push('/')}
                                    variant="primary"
                                    style={{ marginTop: spacing.lg }}
                                />
                            </View>
                        )}
                    </>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.sm,
        backgroundColor: clayTheme.background,
        zIndex: 20,
    },
    backBtn: {
        width: 40,
        height: 40,
        paddingHorizontal: 0,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: clayTheme.text.primary,
    },
    viewToggle: {
        flexDirection: 'row',
        backgroundColor: clayTheme.surface,
        borderRadius: 12,
        padding: 4,
    },
    viewBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    viewBtnActive: {
        backgroundColor: clayTheme.accent.primary,
    },
    mainScroll: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: clayTheme.text.primary,
        paddingHorizontal: layout.screenPadding,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    sectionSubtitle: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        paddingHorizontal: layout.screenPadding,
        marginBottom: spacing.md,
    },
    selectedToolsContainer: {
        paddingHorizontal: layout.screenPadding,
        gap: spacing.sm,
    },
    selectedToolCard: {
        width: 120,
        backgroundColor: clayTheme.surface,
        borderRadius: 16,
        padding: spacing.md,
        position: 'relative',
    },
    removeBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: clayTheme.accent.error,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedToolName: {
        fontSize: 14,
        fontWeight: '700',
        color: clayTheme.text.primary,
        marginBottom: 4,
    },
    selectedToolCategory: {
        fontSize: 11,
        color: clayTheme.text.tertiary,
    },
    tableContainer: {
        marginTop: spacing.md,
        paddingHorizontal: layout.screenPadding,
    },
    tableRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    tableLabel: {
        width: 70,
        fontSize: 11,
        fontWeight: '600',
        color: clayTheme.text.secondary,
        paddingTop: spacing.sm,
    },
    tableCells: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    tableCell: {
        width: COLUMN_WIDTH - spacing.md,
        backgroundColor: clayTheme.surface,
        borderRadius: 12,
        padding: spacing.sm,
    },
    tableCellText: {
        fontSize: 12,
        color: clayTheme.text.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing['2xl'],
        paddingHorizontal: layout.screenPadding,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: clayTheme.text.primary,
        marginTop: spacing.lg,
    },
    emptySubtitle: {
        fontSize: 14,
        color: clayTheme.text.secondary,
        textAlign: 'center',
        marginTop: spacing.sm,
    },
    recommendationSection: {
        paddingHorizontal: layout.screenPadding,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: clayTheme.text.secondary,
        marginBottom: spacing.md,
    },
    recommendationLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: clayTheme.text.primary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    text: {
        color: clayTheme.text.secondary,
        fontSize: 16,
    },
});
