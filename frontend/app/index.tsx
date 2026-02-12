import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool } from '../types';
import { liquidGlassTheme, glassUtils, spacing } from '../theme/liquidGlass';
import { ToolGridCard } from '../components/ui/tool-grid-card';
import { GlassSearchBar } from '../components/ui/glass-search-bar';
import { EmptyState } from '../components/ui/empty-state';
import { ToolGridCardSkeleton } from '../components/ui/tool-grid-card-skeleton';

const { width } = Dimensions.get('window');

const CATEGORIES = ['All', 'Editors & IDEs', 'Web & App Builders', 'Assistants & Agents', 'Design & UI'];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);

  const tools = useQuery(api.tools.get, {
    search: search.trim() || undefined,
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, []);

  const toggleFavorite = useCallback(async (toolId: string) => {
    setFavorites(prev => {
      const next = prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId];
      AsyncStorage.setItem('favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFavorites]);

  const featuredTools = tools ? tools.filter((t: Tool) => t.featured) : [];

  const renderToolCard = useCallback(({ item }: { item: Tool }) => (
    <ToolGridCard
      testID={`tool-card-${item._id}`}
      name={item.name}
      description={item.description}
      category={item.category}
      iconUrl={item.icon_url}
      iconLetter={item.icon_letter}
      color={item.color}
      isFavorite={favorites.includes(item._id)}
      onPress={() => router.push(`/tool/${item._id}`)}
      onToggleFavorite={() => toggleFavorite(item._id)}
    />
  ), [favorites, toggleFavorite, router]);

  if (tools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={{ height: 32, width: 150, borderRadius: 8, backgroundColor: liquidGlassTheme.surface, marginBottom: 8 }} />
          <View style={{ height: 16, width: 220, borderRadius: 4, backgroundColor: liquidGlassTheme.surface }} />
        </View>
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <ToolGridCardSkeleton />
            <ToolGridCardSkeleton />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <ToolGridCardSkeleton />
            <ToolGridCardSkeleton />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <FlatList
        testID="tools-list"
        data={tools}
        renderItem={renderToolCard}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={liquidGlassTheme.accent.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AI Tools</Text>
              <Text style={styles.headerSubtitle}>{tools.length} tools curated for developers</Text>
            </View>

            {/* Search */}
            <GlassSearchBar
              testID="search-input"
              value={search}
              onChangeText={setSearch}
              onSubmit={Keyboard.dismiss}
            />

            {/* Category Tabs */}
            <FlatList
              testID="category-tabs"
              horizontal
              showsHorizontalScrollIndicator={false}
              data={CATEGORIES}
              keyExtractor={item => item}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  testID={`category-tab-${item.replace(/\s+/g, '-').toLowerCase()}`}
                  style={[
                    styles.categoryTab,
                    activeCategory === item && styles.categoryTabActive,
                  ]}
                  onPress={() => setActiveCategory(item)}
                  accessibilityLabel={`Filter by ${item}`}
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.categoryTabText,
                    activeCategory === item && styles.categoryTabTextActive,
                  ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            {/* Featured Section */}
            {activeCategory === 'All' && !search && featuredTools.length > 0 && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>⭐ Featured</Text>
                <FlatList
                  testID="featured-tools"
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredTools}
                  keyExtractor={item => item._id}
                  contentContainerStyle={styles.featuredList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      testID={`featured-card-${item._id}`}
                      style={styles.featuredCard}
                      onPress={() => router.push(`/tool/${item._id}`)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Open featured tool ${item.name}`}
                      accessibilityRole="button"
                    >
                      <View style={[styles.featuredIcon, { backgroundColor: item.icon_url ? 'transparent' : item.color }]}>
                        {item.icon_url ? (
                          <Image
                            source={{ uri: item.icon_url }}
                            style={styles.featuredIconImage}
                            contentFit="contain"
                          />
                        ) : (
                          <Text style={styles.featuredIconLetter}>{item.icon_letter}</Text>
                        )}
                      </View>
                      <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>{item.description}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* All Tools Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                {activeCategory === 'All' ? 'All Tools' : activeCategory}
              </Text>
              <Text style={styles.toolCount}>{tools.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="No tools found"
            subtitle="Try adjusting your search or filter"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: liquidGlassTheme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: Math.min(32, width * 0.08),
    fontWeight: '700',
    color: liquidGlassTheme.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Math.min(14, width * 0.035),
    color: liquidGlassTheme.text.secondary,
    marginTop: 4,
  },
  categoryList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: liquidGlassTheme.glass.border,
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: liquidGlassTheme.accent.primary,
    borderColor: liquidGlassTheme.accent.primary,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: liquidGlassTheme.text.secondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: Math.min(18, width * 0.05),
    fontWeight: '600',
    color: liquidGlassTheme.text.primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  toolCount: {
    fontSize: Math.min(14, width * 0.035),
    color: liquidGlassTheme.text.tertiary,
    fontWeight: '500',
  },
  featuredList: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  featuredCard: {
    width: 180,
    backgroundColor: liquidGlassTheme.surface,
    borderRadius: liquidGlassTheme.glass.borderRadius,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: liquidGlassTheme.glass.border,
    shadowColor: liquidGlassTheme.glass.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  featuredIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featuredIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  featuredIconLetter: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    color: liquidGlassTheme.text.primary,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: liquidGlassTheme.text.secondary,
    lineHeight: 16,
  },
  row: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
});
