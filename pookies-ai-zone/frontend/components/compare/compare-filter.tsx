import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { clayTheme, spacing } from '../../theme/clay';

interface CompareFilterProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    priceRanges: { label: string; min: number; max: number }[];
    selectedPriceRange: number | null;
    onPriceRangeChange: (index: number | null) => void;
    sortBy: 'name' | 'price' | 'features' | 'score';
    onSortChange: (sort: 'name' | 'price' | 'features' | 'score') => void;
}

export const CompareFilter: React.FC<CompareFilterProps> = ({
    categories,
    selectedCategory,
    onCategoryChange,
    priceRanges,
    selectedPriceRange,
    onPriceRangeChange,
    sortBy,
    onSortChange,
}) => {
    const [showFilters, setShowFilters] = useState(true);

    const sortOptions = [
        { key: 'name', label: 'Name', icon: 'sort-alpha-asc' },
        { key: 'price', label: 'Price', icon: 'tag' },
        { key: 'features', label: 'Features', icon: 'list' },
        { key: 'score', label: 'Score', icon: 'star' },
    ] as const;

    const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + (selectedPriceRange !== null ? 1 : 0);

    return (
        <View style={styles.container}>
            {/* Filter Toggle - Clay Button Style */}
            <TouchableOpacity
                style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
                onPress={() => setShowFilters(!showFilters)}
                activeOpacity={0.7}
            >
                <View style={styles.filterToggleContent}>
                    <View style={[styles.filterIconContainer, showFilters && styles.filterIconContainerActive]}>
                        <FontAwesome
                            name="sliders"
                            size={14}
                            color={showFilters ? '#FFF' : clayTheme.accent.primary}
                        />
                    </View>
                    <Text style={[styles.filterToggleText, showFilters && styles.filterToggleTextActive]}>
                        Filters
                    </Text>
                    {activeFilterCount > 0 && (
                        <View style={styles.filterBadge}>
                            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                        </View>
                    )}
                </View>
                <FontAwesome
                    name={showFilters ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={showFilters ? '#FFF' : clayTheme.accent.primary}
                />
            </TouchableOpacity>

            {/* Filter Content */}
            {showFilters && (
                <View style={styles.filtersContent}>
                    {/* Category Filter */}
                    <View style={styles.filterSection}>
                        <View style={styles.filterSectionHeader}>
                            <FontAwesome name="folder-o" size={12} color={clayTheme.text.tertiary} />
                            <Text style={styles.filterLabel}>Category</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoryList}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.categoryChip,
                                    selectedCategory === 'All' && styles.categoryChipActive,
                                ]}
                                onPress={() => onCategoryChange('All')}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        selectedCategory === 'All' && styles.categoryChipTextActive,
                                    ]}
                                >
                                    All
                                </Text>
                            </TouchableOpacity>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && styles.categoryChipActive,
                                    ]}
                                    onPress={() => onCategoryChange(cat)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.categoryChipText,
                                            selectedCategory === cat && styles.categoryChipTextActive,
                                        ]}
                                    >
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Price Range Filter */}
                    <View style={styles.filterSection}>
                        <View style={styles.filterSectionHeader}>
                            <FontAwesome name="money" size={12} color={clayTheme.text.tertiary} />
                            <Text style={styles.filterLabel}>Price Range</Text>
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.priceList}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.priceChip,
                                    selectedPriceRange === null && styles.priceChipActive,
                                ]}
                                onPress={() => onPriceRangeChange(null)}
                                activeOpacity={0.7}
                            >
                                <Text
                                    style={[
                                        styles.priceChipText,
                                        selectedPriceRange === null && styles.priceChipTextActive,
                                    ]}
                                >
                                    Any
                                </Text>
                            </TouchableOpacity>
                            {priceRanges.map((range, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.priceChip,
                                        selectedPriceRange === index && styles.priceChipActive,
                                    ]}
                                    onPress={() => onPriceRangeChange(index)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.priceChipText,
                                            selectedPriceRange === index && styles.priceChipTextActive,
                                        ]}
                                    >
                                        {range.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}

            {/* Sort Options - Always Visible */}
            <View style={styles.sortSection}>
                <View style={styles.sortSectionHeader}>
                    <FontAwesome name="sort-amount-asc" size={12} color={clayTheme.text.tertiary} />
                    <Text style={styles.filterLabel}>Sort By</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.sortOptions}
                >
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.sortOption,
                                sortBy === option.key && styles.sortOptionActive,
                            ]}
                            onPress={() => onSortChange(option.key)}
                            activeOpacity={0.7}
                        >
                            <FontAwesome
                                name={option.icon as any}
                                size={12}
                                color={
                                    sortBy === option.key
                                        ? '#FFF'
                                        : clayTheme.text.secondary
                                }
                            />
                            <Text
                                style={[
                                    styles.sortOptionText,
                                    sortBy === option.key && styles.sortOptionTextActive,
                                ]}
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: clayTheme.surface,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 16,
        backgroundColor: clayTheme.background,
        shadowColor: clayTheme.clay.shadowLight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    filterToggleActive: {
        backgroundColor: clayTheme.accent.primary,
    },
    filterToggleContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    filterIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 8,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterIconContainerActive: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    filterToggleText: {
        color: clayTheme.text.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    filterToggleTextActive: {
        color: '#FFF',
    },
    filterBadge: {
        backgroundColor: clayTheme.accent.secondary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    filterBadgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '700',
    },
    filtersContent: {
        paddingTop: spacing.md,
    },
    filterSection: {
        marginBottom: spacing.md,
    },
    filterSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    filterLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: clayTheme.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    categoryList: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xs,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: clayTheme.background,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    categoryChipActive: {
        backgroundColor: clayTheme.accent.primary,
        borderColor: clayTheme.accent.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    priceList: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xs,
    },
    priceChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: clayTheme.background,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    priceChipActive: {
        backgroundColor: clayTheme.accent.secondary,
        borderColor: clayTheme.accent.secondary,
    },
    priceChipText: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    priceChipTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
    sortSection: {
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
    },
    sortSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    sortOptions: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.md,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: clayTheme.background,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    sortOptionActive: {
        backgroundColor: clayTheme.accent.primary,
        borderColor: clayTheme.accent.primary,
    },
    sortOptionText: {
        fontSize: 12,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    sortOptionTextActive: {
        color: '#FFF',
        fontWeight: '600',
    },
});
