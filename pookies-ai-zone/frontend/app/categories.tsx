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
import { clayTheme, clayUtils, spacing, layout } from '../theme/clay';
import { Shimmer } from '../components/ui/shimmer';
import { ComparisonBar } from '../components/ui/comparison-bar';
import { AnimatedListItem } from '../components/ui/animated-list-item';

const CATEGORY_ICONS: Record<string, string> = {
  '3D & Creative': 'cube', // or 'cubes'
  'API & Testing': 'cogs', // was 'code'
  'Analytics': 'line-chart',
  'Assistants & Agents': 'magic',
  'Automation & Prod.': 'bolt',
  'Browsers': 'chrome', // or 'globe'
  'CRM & Support': 'users',
  'Chatbots': 'comments-o',
  'Creative & Design': 'paint-brush',
  'Data & Analytics': 'bar-chart',
  'Database & Backend': 'database', // was 'server'
  'Deployment & Host.': 'cloud-upload', // was 'rocket'
  'Design & UI': 'pencil-square-o', // was 'object-group'
  'Dev & Engineering': 'code', // was 'terminal'
  'Document Analysis': 'file-text-o',
  'E-commerce': 'shopping-cart',
  'Editors & IDEs': 'code', // or 'file-code-o'
  'Finance': 'money',
  'Form Builders': 'check-square-o', // was 'list-alt'
  'HR & Recruitment': 'id-card-o', // was 'user-plus'
  'Health & Wellness': 'medkit', // was 'heart-o'
  'Image Generation': 'picture-o', // was 'image'
  'Industry-Specific': 'industry', // was 'building'
  'LLMs & Chatbots': 'commenting-o', // or 'microchip'
  'Learning & Edu.': 'graduation-cap',
  'Legal': 'gavel', // was 'briefcase'
  'Marketing & Sales': 'bullhorn',
  'Monitoring & Obs.': 'eye', // was 'heartbeat'
  'Music & Audio': 'music',
  'Note-taking': 'sticky-note-o', // was 'pencil'
  'Productivity': 'rocket', // was 'tasks'
  'Research & Edu.': 'book', // was 'search'
  'Security & Privacy': 'shield',
  'Social Media': 'share-square-o', // was 'share-alt'
  'Spreadsheets': 'table',
  'Task Management': 'list-alt', // was 'check-square-o'
  'Translation': 'globe', // was 'language'
  'Video Generation': 'video-camera',
  'Web & App Builders': 'desktop', // was 'laptop'
  'Writing & Content': 'pencil', // was 'pencil-square-o'
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
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item: cat, index }) => {
          const iconName = CATEGORY_ICONS[cat.name] || 'tags';
          const accentColor = (clayTheme.categories as any)[cat.name] || clayTheme.accent.primary;

          return (
            <AnimatedListItem index={index}>
              <TouchableOpacity
                testID={`category-card-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                style={styles.categoryCard}
                onPress={() => router.push(`/category/${encodeURIComponent(cat.name)}`)}
                activeOpacity={0.8}
              >
                <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
                <View style={[styles.cardIconBox, { backgroundColor: accentColor + '15' }]}>
                  <FontAwesome name={iconName as any} size={20} color={accentColor} />
                </View>
                <View style={styles.cardTextArea}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{cat.name}</Text>
                  <Text style={styles.cardCount}>{cat.count} tools</Text>
                </View>
              </TouchableOpacity>
            </AnimatedListItem>
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
    paddingBottom: layout.listBottomPadding,
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
    marginTop: 4,
  },
  columnWrapper: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
    marginBottom: layout.cardGap,
  },
  categoryCard: {
    flex: 1,
    ...clayUtils.card,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  } as any,
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  } as any,
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  } as any,
  cardTextArea: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: clayTheme.text.primary,
    marginBottom: 2,
  },
  cardCount: {
    fontSize: 11,
    color: clayTheme.text.tertiary,
  },
});
