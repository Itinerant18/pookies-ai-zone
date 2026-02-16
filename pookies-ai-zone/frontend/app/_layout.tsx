import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { clayTheme } from '../theme/clay';
import { ClayTabBar } from '@/components/navigation/clay-tab-bar';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || "https://placeholder-url.convex.cloud", {
  unsavedChangesWarning: false,
});

export default function TabLayout() {
  return (
    <ConvexProvider client={convex}>
      <Tabs
        tabBar={props => <ClayTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="th-large" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="list-ul" size={20} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="heart-o" size={20} color={color} />
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
    backgroundColor: clayTheme.background,
    borderTopColor: 'transparent',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: clayTheme.clay.shadowDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: clayTheme.text.secondary,
  },
});
