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
import { liquidGlassTheme, spacing } from '../theme/liquidGlass';
import { ToolListCard } from '../components/ui/tool-list-card';
import { EmptyState } from '../components/ui/empty-state';
import { ToolListCardSkeleton } from '../components/ui/tool-list-card-skeleton';
import { Shimmer } from '../components/ui/shimmer';

export default function FavoritesScreen() {
  const router = useRouter();

  const allTools = useQuery(api.tools.get, {});

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      setFavoriteIds(ids);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = useCallback(async (toolId: string) => {
    const newIds = favoriteIds.filter(id => id !== toolId);
    setFavoriteIds(newIds);
    await AsyncStorage.setItem('favorites', JSON.stringify(newIds));
  }, [favoriteIds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadFavorites]);

  const favoriteTools = (allTools || []).filter((t: Tool) => favoriteIds.includes(t._id));

  if (allTools === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
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
      <StatusBar barStyle="light-content" />
      <FlatList
        testID="favorites-list"
        data={favoriteTools}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={liquidGlassTheme.accent.primary} />
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
            onPress={() => router.push(`/tool/${tool._id}`)}
            onToggleFavorite={() => removeFavorite(tool._id)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="No favorites yet"
            subtitle="Tap the heart icon on any tool to save it here"
            actionLabel="Browse Tools"
            onAction={() => router.push('/')}
            testID="go-home-btn"
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
});
