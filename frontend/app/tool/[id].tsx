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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  featured: boolean;
}

export default function ToolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tool, setTool] = useState<Tool | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tools/${id}`);
        const data = await res.json();
        setTool(data);

        const stored = await AsyncStorage.getItem('favorites');
        const favs: string[] = stored ? JSON.parse(stored) : [];
        setIsFavorite(favs.includes(id as string));
      } catch (err) {
        console.error('Failed to fetch tool:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTool();
  }, [id]);

  const toggleFavorite = useCallback(async () => {
    const stored = await AsyncStorage.getItem('favorites');
    const favs: string[] = stored ? JSON.parse(stored) : [];
    let newFavs: string[];
    if (favs.includes(id as string)) {
      newFavs = favs.filter(fid => fid !== id);
      setIsFavorite(false);
    } else {
      newFavs = [...favs, id as string];
      setIsFavorite(true);
    }
    await AsyncStorage.setItem('favorites', JSON.stringify(newFavs));
  }, [id]);

  const openLink = useCallback(() => {
    if (tool?.url) {
      Linking.openURL(tool.url);
    }
  }, [tool]);

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

  if (!tool) {
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
          <Ionicons name="arrow-back" size={22} color="#FAFAFA" />
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
            color={isFavorite ? '#EF4444' : '#FAFAFA'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: tool.color }]}>
            <Text style={styles.heroIconLetter}>{tool.icon_letter}</Text>
          </View>
          <Text style={styles.heroName}>{tool.name}</Text>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>{tool.category}</Text>
          </View>
          {tool.featured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={styles.featuredBadgeText}>Featured</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About</Text>
          <Text style={styles.descriptionText}>{tool.description}</Text>
        </View>

        {/* URL */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Website</Text>
          <TouchableOpacity
            testID="tool-url-link"
            onPress={openLink}
            style={styles.urlRow}
            activeOpacity={0.7}
            accessibilityLabel={`Open ${tool.url}`}
            accessibilityRole="link"
          >
            <Ionicons name="globe-outline" size={16} color="#3B82F6" />
            <Text style={styles.urlText} numberOfLines={1}>{tool.url}</Text>
            <Ionicons name="open-outline" size={14} color="#71717A" />
          </TouchableOpacity>
        </View>

        {/* Open Button */}
        <TouchableOpacity
          testID="open-tool-btn"
          style={styles.openButton}
          onPress={openLink}
          activeOpacity={0.8}
          accessibilityLabel={`Visit ${tool.name}`}
          accessibilityRole="button"
        >
          <Text style={styles.openButtonText}>Visit {tool.name}</Text>
          <Ionicons name="arrow-forward" size={18} color="#09090B" />
        </TouchableOpacity>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: '#A1A1AA',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FAFAFA',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FAFAFA',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroPill: {
    backgroundColor: '#27272A',
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroPillText: {
    fontSize: 13,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  featuredBadgeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#FAFAFA',
    lineHeight: 24,
  },
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#18181B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#3B82F6',
  },
  openButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    marginHorizontal: 16,
    height: 52,
    marginTop: 8,
  },
  openButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#09090B',
  },
});
