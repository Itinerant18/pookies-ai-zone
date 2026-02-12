import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Tool } from '../../types';
import { liquidGlassTheme, glassUtils, spacing } from '../../theme/liquidGlass';

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const tool = useQuery(api.tools.getById, id ? { id } : "skip");

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const stored = await AsyncStorage.getItem('favorites');
        const favs: string[] = stored ? JSON.parse(stored) : [];
        if (id) setIsFavorite(favs.includes(id));
      } catch (err) {
        console.error('Failed to load favorites:', err);
      }
    };
    checkFavorite();
  }, [id]);

  const toggleFavorite = useCallback(async () => {
    if (!id) return;
    const stored = await AsyncStorage.getItem('favorites');
    const favs: string[] = stored ? JSON.parse(stored) : [];
    let newFavs: string[];
    if (favs.includes(id)) {
      newFavs = favs.filter(fid => fid !== id);
      setIsFavorite(false);
    } else {
      newFavs = [...favs, id];
      setIsFavorite(true);
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  }, [id]);

  const openLink = useCallback(() => {
    if (tool?.url) {
      Linking.openURL(tool.url);
    }
  }, [tool]);

  if (tool === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={liquidGlassTheme.accent.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (tool === null) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Tool not found</Text>
          <TouchableOpacity
            testID="go-back-btn"
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          testID="detail-back-btn"
          onPress={() => router.back()}
          style={styles.topBarBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color={liquidGlassTheme.text.primary} />
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            testID="detail-share-btn"
            onPress={() => { /* share */ }}
            style={styles.topBarBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Share tool"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={20} color={liquidGlassTheme.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="detail-fav-btn"
            onPress={toggleFavorite}
            style={styles.topBarBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityRole="button"
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? liquidGlassTheme.accent.error : liquidGlassTheme.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.heroBg, { backgroundColor: (tool.color || liquidGlassTheme.accent.primary) + '15' }]}>
            <View style={[styles.heroIcon, { backgroundColor: tool.icon_url ? 'transparent' : tool.color }]}>
              {tool.icon_url ? (
                <Image
                  source={{ uri: tool.icon_url }}
                  style={styles.heroIconImage}
                  contentFit="contain"
                />
              ) : (
                <Text style={styles.heroIconLetter}>{tool.icon_letter}</Text>
              )}
            </View>
          </View>
          <Text style={styles.heroName}>{tool.name}</Text>
          <View style={styles.chipRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>{tool.category}</Text>
            </View>
            {tool.featured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color={liquidGlassTheme.accent.warning} />
                <Text style={styles.featuredBadgeText}>Featured</Text>
              </View>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{tool.description}</Text>
          </View>
        </View>

        {/* Website Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Website</Text>
          <TouchableOpacity
            testID="tool-url-link"
            onPress={openLink}
            style={styles.urlCard}
            activeOpacity={0.7}
            accessibilityLabel={`Open ${tool.url}`}
            accessibilityRole="link"
          >
            <View style={styles.urlLeft}>
              <Ionicons name="globe-outline" size={18} color={liquidGlassTheme.accent.primary} />
              <Text style={styles.urlText} numberOfLines={1}>{tool.url}</Text>
            </View>
            <Ionicons name="open-outline" size={14} color={liquidGlassTheme.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          testID="open-tool-btn"
          style={styles.openButton}
          onPress={openLink}
          activeOpacity={0.8}
          accessibilityLabel={`Visit ${tool.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.openButtonText}>Visit {tool.name}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: liquidGlassTheme.text.secondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    ...glassUtils.card,
    paddingHorizontal: 24,
    paddingVertical: 12,
  } as ViewStyle,
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: liquidGlassTheme.text.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: liquidGlassTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: liquidGlassTheme.glass.border,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  heroBg: {
    width: 120,
    height: 120,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  heroIconLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: liquidGlassTheme.text.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroPill: {
    backgroundColor: liquidGlassTheme.elevated,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroPillText: {
    fontSize: 13,
    color: liquidGlassTheme.text.secondary,
    fontWeight: '500',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: liquidGlassTheme.accent.warning + '15',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontSize: 12,
    color: liquidGlassTheme.accent.warning,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: liquidGlassTheme.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    ...glassUtils.card,
    padding: spacing.lg,
  } as ViewStyle,
  descriptionText: {
    fontSize: 16,
    color: liquidGlassTheme.text.primary,
    lineHeight: 24,
  },
  urlCard: {
    ...glassUtils.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  } as ViewStyle,
  urlLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: liquidGlassTheme.accent.primary,
  },
  openButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: liquidGlassTheme.accent.primary,
    borderRadius: 14,
    marginHorizontal: spacing.lg,
    height: 52,
    marginTop: spacing.sm,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
