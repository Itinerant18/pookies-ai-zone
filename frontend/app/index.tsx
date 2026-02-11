import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool } from '../types';

const ToolCard = React.memo(({ tool, isFavorite, onToggleFavorite, onPress }: {
  tool: Tool;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPress: (id: string) => void;
}) => (
  <TouchableOpacity
    testID={`tool-card-${tool._id}`}
    style={styles.toolCard}
    onPress={() => onPress(tool._id)}
    activeOpacity={0.7}
    accessibilityLabel={`Open ${tool.name}`}
    accessibilityRole="button"
  >
    <View style={styles.cardHeader}>
      <View style={[styles.iconBox, { backgroundColor: tool.icon_url ? 'transparent' : tool.color }]}>
        {tool.icon_url ? (
          <Image
            source={{ uri: tool.icon_url }}
            style={styles.toolIconImage}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <Text style={styles.iconLetter}>{tool.icon_letter}</Text>
        )}
      </View>
      <TouchableOpacity
        testID={`favorite-btn-${tool._id}`}
        onPress={() => onToggleFavorite(tool._id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityLabel={isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
        accessibilityRole="button"
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? '#EF4444' : '#71717A'}
        />
      </TouchableOpacity>
    </View>
    <Text style={styles.toolName} numberOfLines={1}>{tool.name}</Text>
    <Text style={styles.toolDesc} numberOfLines={2}>{tool.description}</Text>
    <View style={styles.categoryPill}>
      <Text style={styles.categoryPillText}>{tool.category}</Text>
    </View>
  </TouchableOpacity>
));

const CATEGORIES = ['All', 'Editors & IDEs', 'Web & App Builders', 'Assistants & Agents', 'Design & UI'];

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Use Convex Query
  const tools = useQuery(api.tools.get, { 
    search: search.trim() || undefined,
    category: activeCategory === 'All' ? undefined : activeCategory
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
    // Convex automatically updates, but we can re-fetch favorites
    loadFavorites();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFavorites]);

  const featuredTools = tools ? tools.filter((t: Tool) => t.featured) : [];

  const renderToolCard = useCallback(({ item }: { item: Tool }) => (
    <ToolCard
      tool={item}
      isFavorite={favorites.includes(item._id)}
      onToggleFavorite={toggleFavorite}
      onPress={(id) => router.push(`/tool/${id}`)}
    />
  ), [favorites, toggleFavorite, router]);

  if (tools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>AI Tools</Text>
              <Text style={styles.headerSubtitle}>{tools.length} tools curated for developers</Text>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={18} color="#71717A" style={styles.searchIcon} />
              <TextInput
                testID="search-input"
                style={styles.searchInput}
                placeholder="Search tools..."
                placeholderTextColor="#71717A"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
              {search.length > 0 && (
                <TouchableOpacity
                  testID="search-clear-btn"
                  onPress={() => setSearch('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                >
                  <Ionicons name="close-circle" size={18} color="#71717A" />
                </TouchableOpacity>
              )}
            </View>

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
            {activeCategory === 'All' && !search && (
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Featured</Text>
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
                            style={styles.toolIconImage}
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
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#71717A" />
            <Text style={styles.emptyText}>No tools found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FAFAFA',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#A1A1AA',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FAFAFA',
    fontSize: 16,
    height: 44,
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#FAFAFA',
    borderColor: '#FAFAFA',
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  categoryTabTextActive: {
    color: '#09090B',
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  toolCount: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  featuredList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  featuredCard: {
    width: 180,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  featuredIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredIconLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  featuredName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 16,
  },
  row: {
    paddingHorizontal: 16,
    gap: 12,
  },
  toolCard: {
    flex: 1,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  iconLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FAFAFA',
    marginBottom: 4,
  },
  toolDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 16,
    marginBottom: 10,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#27272A',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryPillText: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FAFAFA',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 4,
  },
});
