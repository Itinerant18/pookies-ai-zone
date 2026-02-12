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
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool, CategoryData } from '../types';
import { liquidGlassTheme, glassUtils, spacing } from '../theme/liquidGlass';
import { Shimmer } from '../components/ui/shimmer';

const CATEGORY_ICONS: Record<string, string> = {
  'Editors & IDEs': 'code-slash-outline',
  'Web & App Builders': 'globe-outline',
  'Assistants & Agents': 'sparkles-outline',
  'Design & UI': 'color-palette-outline',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Editors & IDEs': '#6366F1',
  'Web & App Builders': '#8B5CF6',
  'Assistants & Agents': '#10B981',
  'Design & UI': '#F59E0B',
};

export default function CategoriesScreen() {
  const router = useRouter();

  const categories = useQuery(api.tools.getCategories);
  const tools = useQuery(api.tools.get, {});

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
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

  const getToolsByCategory = (category: string) =>
    (tools || []).filter((t: Tool) => t.category === category);

  if (categories === undefined || tools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Shimmer width={150} height={32} style={{ borderRadius: 8, marginBottom: 8 }} />
          <Shimmer width={200} height={14} style={{ borderRadius: 4 }} />
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          {[1, 2, 3].map(i => (
            <Shimmer key={i} width="100%" height={80} style={{ marginBottom: 16, borderRadius: 24 }} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <FlatList
        testID="categories-list"
        data={categories}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={liquidGlassTheme.accent.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Categories</Text>
            <Text style={styles.headerSubtitle}>Browse tools by type</Text>
          </View>
        }
        renderItem={({ item: cat }) => {
          const isExpanded = expandedCategory === cat.name;
          const catTools = getToolsByCategory(cat.name);
          const iconName = CATEGORY_ICONS[cat.name] || 'apps-outline';
          const accentColor = CATEGORY_COLORS[cat.name] || liquidGlassTheme.accent.primary;

          return (
            <View style={styles.categorySection}>
              <TouchableOpacity
                testID={`category-section-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                style={styles.categoryHeader}
                onPress={() => setExpandedCategory(isExpanded ? null : cat.name)}
                activeOpacity={0.7}
                accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.name}`}
                accessibilityRole="button"
              >
                <View style={styles.categoryHeaderLeft}>
                  <View style={[styles.categoryIconBox, { backgroundColor: accentColor + '20' }]}>
                    <Ionicons name={iconName as any} size={20} color={accentColor} />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryCount}>{cat.count} tools</Text>
                  </View>
                </View>
                <View style={[styles.chevronBox, isExpanded && styles.chevronBoxActive]}>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={liquidGlassTheme.text.tertiary}
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.toolsList}>
                  {catTools.map((tool: Tool) => (
                    <TouchableOpacity
                      key={tool._id}
                      testID={`category-tool-${tool._id}`}
                      style={styles.toolRow}
                      onPress={() => router.push(`/tool/${tool._id}`)}
                      activeOpacity={0.7}
                      accessibilityLabel={`Open ${tool.name}`}
                      accessibilityRole="button"
                    >
                      <View style={styles.toolRowLeft}>
                        <View style={[styles.toolDot, { backgroundColor: tool.icon_url ? 'transparent' : tool.color }]}>
                          {tool.icon_url ? (
                            <Image
                              source={{ uri: tool.icon_url }}
                              style={styles.toolRowIcon}
                              contentFit="contain"
                            />
                          ) : (
                            <Text style={styles.toolDotLetter}>{tool.icon_letter}</Text>
                          )}
                        </View>
                        <View style={styles.toolRowInfo}>
                          <Text style={styles.toolRowName}>{tool.name}</Text>
                          <Text style={styles.toolRowDesc} numberOfLines={1}>{tool.description}</Text>
                        </View>
                      </View>
                      <View style={styles.toolRowRight}>
                        <TouchableOpacity
                          testID={`cat-fav-btn-${tool._id}`}
                          onPress={() => toggleFavorite(tool._id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          accessibilityLabel={favorites.includes(tool._id) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name={favorites.includes(tool._id) ? 'heart' : 'heart-outline'}
                            size={18}
                            color={favorites.includes(tool._id) ? liquidGlassTheme.accent.error : liquidGlassTheme.text.tertiary}
                          />
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward" size={16} color={liquidGlassTheme.text.tertiary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }}
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
  listContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: liquidGlassTheme.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: liquidGlassTheme.text.secondary,
    marginTop: 4,
  },
  categorySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...glassUtils.card,
    overflow: 'hidden',
  } as ViewStyle,
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: liquidGlassTheme.text.primary,
  },
  categoryCount: {
    fontSize: 12,
    color: liquidGlassTheme.text.tertiary,
    marginTop: 2,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chevronBoxActive: {
    backgroundColor: liquidGlassTheme.glass.backgroundLight,
  },
  toolsList: {
    borderTopWidth: 0.5,
    borderTopColor: liquidGlassTheme.glass.border,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: liquidGlassTheme.glass.border,
  },
  toolRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  toolDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolRowIcon: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  toolDotLetter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toolRowInfo: {
    flex: 1,
  },
  toolRowName: {
    fontSize: 14,
    fontWeight: '500',
    color: liquidGlassTheme.text.primary,
  },
  toolRowDesc: {
    fontSize: 12,
    color: liquidGlassTheme.text.tertiary,
    marginTop: 2,
  },
  toolRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
