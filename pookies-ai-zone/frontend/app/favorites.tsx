import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Tool } from '../types';
import { clayTheme, spacing } from '../theme/clay';
import { ToolListCard } from '../components/ui/tool-list-card';
import { EmptyState } from '../components/ui/empty-state';
import { ToolListCardSkeleton } from '../components/ui/tool-list-card-skeleton';
import { Shimmer } from '../components/ui/shimmer';
import { ComparisonBar } from '../components/ui/comparison-bar';

export default function FavoritesScreen() {
  const router = useRouter();

  const allTools = useQuery(api.tools.get, {});

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [comparing, setComparing] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadStorage = useCallback(async () => {
    try {
      const storedFavs = await AsyncStorage.getItem('favorites');
      if (storedFavs) setFavoriteIds(JSON.parse(storedFavs));

      const storedComp = await AsyncStorage.getItem('comparing');
      if (storedComp) setComparing(JSON.parse(storedComp));
    } catch (err) {
      console.error('Failed to load storage:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStorage();
    }, [loadStorage])
  );

  const removeFavorite = useCallback(async (toolId: string) => {
    const newIds = favoriteIds.filter(id => id !== toolId);
    setFavoriteIds(newIds);
    await AsyncStorage.setItem('favorites', JSON.stringify(newIds));
  }, [favoriteIds]);

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

  const favoriteTools = (allTools || []).filter((t: Tool) => favoriteIds.includes(t._id));

  if (allTools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <Shimmer width={140} height={32} style={{ borderRadius: 8, marginBottom: 8 }} />
          <Shimmer width={100} height={14} style={{ borderRadius: 4 }} />
        </View>
        <View style={{}}>
          {[1, 2, 3, 4].map(i => (
            <ToolListCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        testID="favorites-list"
        data={favoriteTools}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={clayTheme.accent.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Favorites</Text>
            <Text style={styles.headerSubtitle}>
              {favoriteTools.length} saved tool{favoriteTools.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        renderItem={({ item: tool }) => (
          <ToolListCard
            testID={`fav-tool-${tool._id}`}
            name={tool.name}
            description={tool.description}
            category={tool.category}
            iconUrl={tool.icon_url}
            iconLetter={tool.icon_letter}
            color={tool.color}
            isFavorite={true}
            isComparing={comparing.includes(tool._id)}
            onPress={() => router.push(`/tool/${tool._id}`)}
            onToggleFavorite={() => removeFavorite(tool._id)}
            onToggleCompare={() => toggleCompare(tool._id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-o"
            title="No favorites yet"
            subtitle="Tap the heart icon on any tool to save it here"
            actionLabel="Browse Tools"
            onAction={() => router.push('/')}
            testID="go-home-btn"
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
});
