import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { liquidGlassTheme } from '../theme/liquidGlass';
import { GlassTabBar } from '../components/navigation/glass-tab-bar';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "https://placeholder-url.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function TabLayout() {
  return (
    <ConvexProvider client={convex}>
      <Tabs
        tabBar={props => <GlassTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <Ionicons name="grid-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            tabBarIcon: ({ color }) => (
              <Ionicons name="layers-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => (
              <Ionicons name="heart-outline" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tool/[id]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ConvexProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: liquidGlassTheme.surface,
    borderTopColor: liquidGlassTheme.glass.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: liquidGlassTheme.glass.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: liquidGlassTheme.text.secondary,
  },
});
