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
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool } from '../types';
import { ToolIcon } from '../components/ui/tool-icon';
import { clayTheme, spacing, layout } from '../theme/clay';
import { ToolGridCard } from '../components/ui/tool-grid-card';
import { GlobalSearch } from '../components/ui/global-search';
import { EmptyState } from '../components/ui/empty-state';
import { ToolGridCardSkeleton } from '../components/ui/tool-grid-card-skeleton';
import { ComparisonBar } from '../components/ui/comparison-bar';
import { AnimatedPress } from '../components/ui/animated-press';
import { AnimatedListItem } from '../components/ui/animated-list-item';
import { ToolDetailSheet } from '../components/tool/tool-detail-sheet';

const { width } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = Math.round(width * 0.52);

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparing, setComparing] = useState<string[]>([]);
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Deep linking support
  const isValidToolId = toolId && toolId !== 'undefined';
  const deepLinkedTool = useQuery(api.tools.getById, isValidToolId ? { id: toolId as any } : "skip");

  useEffect(() => {
    if (deepLinkedTool) {
      setSelectedTool(deepLinkedTool);
    }
  }, [deepLinkedTool]);

  const tools = useQuery(api.tools.get, {
    search: search.trim() || undefined,
    category: activeCategory === 'All' ? undefined : activeCategory,
  });

  const categoriesData = useQuery(api.tools.getCategories);
  const categories = ['All', ...(categoriesData?.map((c: any) => c.name) || [])];

  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) setFavorites(JSON.parse(stored));

      const storedComparing = await AsyncStorage.getItem('comparing');
      if (storedComparing) setComparing(JSON.parse(storedComparing));
    } catch (err) {
      console.error('Failed to load storage:', err);
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

  const toggleCompare = useCallback(async (toolId: string) => {
    setComparing(prev => {
      if (prev.includes(toolId)) {
        const next = prev.filter(id => id !== toolId);
        AsyncStorage.setItem('comparing', JSON.stringify(next));
        return next;
      } else {
        if (prev.length >= 4) {
          // You could add a toast here
          return prev;
        }
        const next = [...prev, toolId];
        AsyncStorage.setItem('comparing', JSON.stringify(next));
        return next;
      }
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFavorites]);

  const featuredTools = tools?.filter((t: any) => t.featured) || [];

  const renderToolCard = useCallback(({ item, index }: { item: Tool; index: number }) => (
    <AnimatedListItem index={index}>
      <ToolGridCard
        testID={`tool-card-${item._id}`}
        name={item.name}
        description={item.description}
        category={item.category}
        iconUrl={item.icon_url}
        iconLetter={item.icon_letter}
        color={item.color}
        isFavorite={favorites.includes(item._id)}
        isComparing={comparing.includes(item._id)}
        onPress={() => setSelectedTool(item)}
        onToggleFavorite={() => toggleFavorite(item._id)}
        onToggleCompare={() => toggleCompare(item._id)}
      />
    </AnimatedListItem>
  ), [favorites, comparing, toggleFavorite, toggleCompare, router]);

  if (tools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <View style={{ height: 32, width: 150, borderRadius: 8, backgroundColor: clayTheme.surface, marginBottom: 8 }} />
          <View style={{ height: 16, width: 220, borderRadius: 4, backgroundColor: clayTheme.surface }} />
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
      <StatusBar barStyle="dark-content" />
      <FlatList
        testID="tools-list"
        data={tools}
        renderItem={renderToolCard}
        keyExtractor={item => item._id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={clayTheme.accent.primary} />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>AI Tools</Text>
                <Text style={styles.headerSubtitle}>{tools.length} tools curated for developers</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('/preferences' as any)}
                style={{ padding: 8, borderRadius: 12, backgroundColor: clayTheme.surface }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Preferences"
              >
                <FontAwesome name="sliders" size={18} color={clayTheme.text.secondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <TouchableOpacity
              style={styles.searchTrigger}
              onPress={() => setSearchModalOpen(true)}
              activeOpacity={0.7}
            >
              <FontAwesome name="search" size={16} color={clayTheme.text.tertiary} />
              <Text style={styles.searchPlaceholder}>
                {search || 'Search 320+ AI tools...'}
              </Text>
            </TouchableOpacity>
            <GlobalSearch
              useModal
              visible={searchModalOpen}
              onClose={() => setSearchModalOpen(false)}
              onSelectTool={(tool) => {
                setSelectedTool(tool);
                setSearchModalOpen(false);
              }}
            />

            {/* Category Tabs */}
            <FlatList
              testID="category-tabs"
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
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
                    <AnimatedPress
                      testID={`featured-card-${item._id}`}
                      style={styles.featuredCard}
                      onPress={() => setSelectedTool(item)}
                      accessibilityLabel={`Open featured tool ${item.name}`}
                      accessibilityRole="button"
                    >
                      <ToolIcon
                        url={item.icon_url}
                        letter={item.icon_letter}
                        color={item.color}
                        size={56}
                        borderRadius={16}
                        fontSize={24}
                        style={{ marginBottom: 12 }}
                      />
                      <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>{item.description}</Text>
                    </AnimatedPress>
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
            icon="search"
            title="No tools found"
            subtitle="Try adjusting your search or filter"
          />
        }
      />
      <ComparisonBar
        count={comparing.length}
        onClear={() => {
          setComparing([]);
          AsyncStorage.setItem('comparing', JSON.stringify([]));
        }}
        onCompare={() => {
          if (comparing.length > 1) {
            router.push({ pathname: '/compare', params: { ids: comparing.join(',') } });
          }
        }}
      />
      <ToolDetailSheet
        tool={selectedTool}
        visible={!!selectedTool}
        onClose={() => setSelectedTool(null)}
        onRelatedToolClick={setSelectedTool}
        isComparing={selectedTool ? comparing.includes(selectedTool._id) : false}
        onToggleCompare={() => selectedTool && toggleCompare(selectedTool._id)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: clayTheme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: clayTheme.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: clayTheme.text.secondary,
    marginTop: 6,
    fontWeight: '500',
  },
  categoryList: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.md,
    gap: 10,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: clayTheme.surface,
    shadowColor: clayTheme.clay.shadowDark,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 3,
  },
  categoryTabActive: {
    backgroundColor: clayTheme.accent.primary,
    shadowColor: clayTheme.accent.primary,
    shadowOpacity: 0.3,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: clayTheme.text.secondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  sectionContainer: {
    marginBottom: spacing['2xl'],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: clayTheme.text.primary,
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  toolCount: {
    fontSize: 14,
    color: clayTheme.text.tertiary,
    fontWeight: '600',
    backgroundColor: clayTheme.clay.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  featuredList: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
    paddingBottom: spacing.sm,
  },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    height: 160,
    backgroundColor: clayTheme.surface,
    borderRadius: 22,
    padding: spacing.md,
    shadowColor: clayTheme.clay.shadowDark,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'space-between',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: clayTheme.text.primary,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 13,
    color: clayTheme.text.secondary,
    lineHeight: 18,
  },
  row: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
    marginBottom: layout.cardGap,
  },
  listContent: {
    paddingBottom: layout.listBottomPadding,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: clayTheme.surface,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
    shadowColor: clayTheme.clay.shadowDark,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: clayTheme.text.tertiary,
  },
});
