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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool, CategoryData } from '../types';

const CATEGORY_ICONS: Record<string, string> = {
  'Editors & IDEs': 'code-slash-outline',
  'Web & App Builders': 'globe-outline',
  'Assistants & Agents': 'sparkles-outline',
  'Design & UI': 'color-palette-outline',
};

export default function CategoriesScreen() {
  const router = useRouter();
  
  // Use Convex Queries
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
        testID="categories-list"
        data={categories}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
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
                  <View style={styles.categoryIconBox}>
                    <Ionicons name={iconName as any} size={20} color="#FAFAFA" />
                  </View>
                  <View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryCount}>{cat.count} tools</Text>
                  </View>
                </View>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#71717A"
                />
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
                            color={favorites.includes(tool._id) ? '#EF4444' : '#71717A'}
                          />
                        </TouchableOpacity>
                        <Ionicons name="chevron-forward" size={16} color="#71717A" />
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
    paddingBottom: 24,
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
  categorySection: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  categoryCount: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  toolsList: {
    borderTopWidth: 0.5,
    borderTopColor: '#27272A',
  },
  toolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#27272A',
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
    color: '#FAFAFA',
  },
  toolRowDesc: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  toolRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
