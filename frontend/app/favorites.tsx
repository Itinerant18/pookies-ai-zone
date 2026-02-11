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
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  icon_letter: string;
  color: string;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoriteTools, setFavoriteTools] = useState<Tool[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('favorites');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      setFavoriteIds(ids);

      if (ids.length === 0) {
        setFavoriteTools([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/tools`);
      const allTools: Tool[] = await res.json();
      const favTools = allTools.filter(t => ids.includes(t.id));
      setFavoriteTools(favTools);
    } catch (err) {
      console.error('Failed to load favorites:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    setFavoriteTools(prev => prev.filter(t => t.id !== toolId));
    await AsyncStorage.setItem('favorites', JSON.stringify(newIds));
  }, [favoriteIds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFavorites();
  }, [loadFavorites]);

  if (loading) {
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
        testID="favorites-list"
        data={favoriteTools}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
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
          <TouchableOpacity
            testID={`fav-tool-${tool.id}`}
            style={styles.toolCard}
            onPress={() => router.push(`/tool/${tool.id}`)}
            activeOpacity={0.7}
            accessibilityLabel={`Open ${tool.name}`}
            accessibilityRole="button"
          >
            <View style={styles.cardLeft}>
              <View style={[styles.iconBox, { backgroundColor: tool.color }]}>
                <Text style={styles.iconLetter}>{tool.icon_letter}</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.toolName}>{tool.name}</Text>
                <Text style={styles.toolDesc} numberOfLines={1}>{tool.description}</Text>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{tool.category}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              testID={`remove-fav-btn-${tool.id}`}
              onPress={() => removeFavorite(tool.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.removeBtn}
              accessibilityLabel={`Remove ${tool.name} from favorites`}
              accessibilityRole="button"
            >
              <Ionicons name="heart" size={22} color="#EF4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="heart-outline" size={48} color="#71717A" />
            </View>
            <Text style={styles.emptyTitle}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the heart icon on any tool to save it here
            </Text>
            <TouchableOpacity
              testID="go-home-btn"
              style={styles.goHomeBtn}
              onPress={() => router.push('/')}
              accessibilityLabel="Browse tools"
              accessibilityRole="button"
            >
              <Text style={styles.goHomeBtnText}>Browse Tools</Text>
            </TouchableOpacity>
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
  toolCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLetter: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  toolDesc: {
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#27272A',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  categoryPillText: {
    fontSize: 10,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  removeBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FAFAFA',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  goHomeBtn: {
    marginTop: 24,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  goHomeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#09090B',
  },
});
