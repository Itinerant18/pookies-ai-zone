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
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool, CategoryData } from '../types';
import { ToolIcon } from '../components/ui/tool-icon';
import { clayTheme, clayUtils, spacing } from '../theme/clay';
import { Shimmer } from '../components/ui/shimmer';
import { ComparisonBar } from '../components/ui/comparison-bar';

const CATEGORY_ICONS: Record<string, string> = {
  '3D & Creative': 'cube',
  'API & Testing': 'code',
  'Analytics': 'line-chart',
  'Assistants & Agents': 'magic',
  'Automation & Prod.': 'bolt',
  'Browsers': 'globe',
  'CRM & Support': 'users',
  'Chatbots': 'comments',
  'Creative & Design': 'paint-brush',
  'Data & Analytics': 'bar-chart',
  'Database & Backend': 'server',
  'Deployment & Host.': 'rocket',
  'Design & UI': 'object-group',
  'Dev & Engineering': 'terminal',
  'Document Analysis': 'file-text',
  'E-commerce': 'shopping-cart',
  'Editors & IDEs': 'file-code-o',
  'Finance': 'money',
  'Form Builders': 'list-alt',
  'HR & Recruitment': 'user-plus',
  'Health & Wellness': 'heart-o',
  'Image Generation': 'image',
  'Industry-Specific': 'building',
  'LLMs & Chatbots': 'microchip',
  'Learning & Edu.': 'graduation-cap',
  'Legal': 'briefcase',
  'Marketing & Sales': 'bullhorn',
  'Monitoring & Obs.': 'heartbeat',
  'Music & Audio': 'music',
  'Note-taking': 'pencil',
  'Productivity': 'tasks',
  'Research & Edu.': 'search',
  'Security & Privacy': 'shield',
  'Social Media': 'share-alt',
  'Spreadsheets': 'table',
  'Task Management': 'check-square-o',
  'Translation': 'language',
  'Video Generation': 'video-camera',
  'Web & App Builders': 'laptop',
  'Writing & Content': 'pencil-square-o',
};

export default function CategoriesScreen() {
  const router = useRouter();

  const categories = useQuery(api.tools.getCategories);
  const tools = useQuery(api.tools.get, {});

  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparing, setComparing] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStorage = useCallback(async () => {
    try {
      const storedFavs = await AsyncStorage.getItem('favorites');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));

      const storedComp = await AsyncStorage.getItem('comparing');
      if (storedComp) setComparing(JSON.parse(storedComp));
    } catch (err) {
      console.error('Failed to load storage:', err);
    }
  }, []);

  useEffect(() => {
    loadStorage();
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
        if (prev.length >= 4) return prev;
        const next = [...prev, toolId];
        AsyncStorage.setItem('comparing', JSON.stringify(next));
        return next;
      }
    });
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStorage();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadStorage]);

  const getToolsByCategory = (category: string) =>
    (tools || []).filter((t: Tool) => t.category === category);

  if (categories === undefined || tools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
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
      <StatusBar barStyle="dark-content" />
      <FlatList
        testID="categories-list"
        data={categories}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={clayTheme.accent.primary} />
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
          const iconName = CATEGORY_ICONS[cat.name] || 'list-ul';
          const accentColor = (clayTheme.categories as any)[cat.name] || clayTheme.accent.primary;

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
                    <FontAwesome name={iconName as any} size={20} color={accentColor} />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryCount}>{cat.count} tools</Text>
                  </View>
                </View>
                <View style={[styles.chevronBox, isExpanded && styles.chevronBoxActive]}>
                  <FontAwesome
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={clayTheme.text.tertiary}
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
                        <ToolIcon
                          url={tool.icon_url}
                          letter={tool.icon_letter}
                          color={tool.color}
                          size={32}
                          borderRadius={10}
                          fontSize={14}
                        />
                        <View style={styles.toolRowInfo}>
                          <Text style={styles.toolRowName}>{tool.name}</Text>
                          <Text style={styles.toolRowDesc} numberOfLines={1}>{tool.description}</Text>
                        </View>
                      </View>
                      <View style={styles.toolRowRight}>
                        <TouchableOpacity
                          onPress={() => toggleCompare(tool._id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <FontAwesome
                            name={comparing.includes(tool._id) ? 'bar-chart' : 'bar-chart-o'}
                            size={16}
                            color={comparing.includes(tool._id) ? clayTheme.accent.primary : clayTheme.text.tertiary}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          testID={`cat-fav-btn-${tool._id}`}
                          onPress={() => toggleFavorite(tool._id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          accessibilityLabel={favorites.includes(tool._id) ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
                          accessibilityRole="button"
                        >
                          <FontAwesome
                            name={favorites.includes(tool._id) ? 'heart' : 'heart-o'}
                            size={16}
                            color={favorites.includes(tool._id) ? clayTheme.accent.error : clayTheme.text.tertiary}
                          />
                        </TouchableOpacity>
                        <FontAwesome name="chevron-right" size={14} color={clayTheme.text.tertiary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          );
        }}
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
    color: clayTheme.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: clayTheme.text.secondary,
    marginTop: 4,
  },
  categorySection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...clayUtils.card,
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
    color: clayTheme.text.primary,
  },
  categoryCount: {
    fontSize: 12,
    color: clayTheme.text.tertiary,
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
    backgroundColor: clayTheme.surface,
  },
  toolsList: {
    borderTopWidth: 0.5,
    borderTopColor: clayTheme.clay.shadowDark,
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: clayTheme.clay.shadowDark,
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
    color: clayTheme.text.primary,
  },
  toolRowDesc: {
    fontSize: 12,
    color: clayTheme.text.tertiary,
    marginTop: 2,
  },
  toolRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
