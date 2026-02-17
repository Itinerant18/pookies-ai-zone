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
    const [showFilters, setShowFilters] = useState(false);

    const sortOptions = [
        { key: 'name', label: 'Name', icon: 'sort-alpha-asc' },
        { key: 'price', label: 'Price', icon: 'tag' },
        { key: 'features', label: 'Features', icon: 'list' },
        { key: 'score', label: 'Score', icon: 'star' },
    ] as const;

    return (
        <View style={styles.container}>
            {/* Filter Toggle */}
            <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters(!showFilters)}
            >
                <FontAwesome
                    name={showFilters ? 'filter' : 'filter'}
                    size={16}
                    color={clayTheme.accent.primary}
                />
                <Text style={styles.filterToggleText}>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Text>
                <FontAwesome
                    name={showFilters ? 'chevron-up' : 'chevron-down'}
                    size={12}
                    color={clayTheme.accent.primary}
                />
            </TouchableOpacity>

            {/* Filter Content */}
            {showFilters && (
                <View style={styles.filtersContent}>
                    {/* Category Filter */}
                    <View style={styles.filterSection}>
                        <Text style={styles.filterLabel}>Category</Text>
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
                        <Text style={styles.filterLabel}>Price Range</Text>
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

            {/* Sort Options */}
            <View style={styles.sortSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <View style={styles.sortOptions}>
                    {sortOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={[
                                styles.sortOption,
                                sortBy === option.key && styles.sortOptionActive,
                            ]}
                            onPress={() => onSortChange(option.key)}
                        >
                            <FontAwesome
                                name={option.icon as any}
                                size={14}
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
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: clayTheme.surface,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: clayTheme.background,
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: spacing.sm,
    },
    filterToggleText: {
        color: clayTheme.accent.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    filtersContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
    },
    filterSection: {
        marginBottom: spacing.md,
    },
    filterLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: clayTheme.text.tertiary,
        textTransform: 'uppercase',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    categoryList: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.xs,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: clayTheme.background,
    },
    categoryChipActive: {
        backgroundColor: clayTheme.accent.primary,
    },
    categoryChipText: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    categoryChipTextActive: {
        color: '#FFF',
    },
    priceList: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: spacing.xs,
    },
    priceChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: clayTheme.background,
    },
    priceChipActive: {
        backgroundColor: clayTheme.accent.secondary,
    },
    priceChipText: {
        fontSize: 13,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    priceChipTextActive: {
        color: '#FFF',
    },
    sortSection: {
        paddingHorizontal: spacing.md,
    },
    sortOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: clayTheme.background,
    },
    sortOptionActive: {
        backgroundColor: clayTheme.accent.primary,
    },
    sortOptionText: {
        fontSize: 12,
        color: clayTheme.text.secondary,
        fontWeight: '500',
    },
    sortOptionTextActive: {
        color: '#FFF',
    },
});
