import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Tool, CategoryData } from '../../types';
import { ToolListCard } from '../../components/ui/tool-list-card';
import { ToolListCardSkeleton } from '../../components/ui/tool-list-card-skeleton';
import { clayTheme, clayUtils, spacing, layout } from '../../theme/clay';
import { FontAwesome } from '@expo/vector-icons';
import { Shimmer } from '../../components/ui/shimmer';

export default function CategoryDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const category = decodeURIComponent(id || '');

    const tools = useQuery(api.tools.get, {});

    const categoryTools = (tools || []).filter((t: Tool) => t.category === category);

    if (tools === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <FontAwesome name="arrow-left" size={20} color={clayTheme.text.primary} />
                    </TouchableOpacity>
                    <Shimmer width={150} height={24} style={{ borderRadius: 8 }} />
                </View>
                <View style={{ padding: 16 }}>
                    {[1, 2, 3, 4].map(i => <ToolListCardSkeleton key={i} />)}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={20} color={clayTheme.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{category}</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={categoryTools}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <ToolListCard
                        name={item.name}
                        description={item.description}
                        iconUrl={item.icon_url}
                        iconLetter={item.icon_letter}
                        color={item.color}
                        category={item.category}
                        onPress={() => router.push(`/tool/${item._id}`)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No tools found in this category.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.screenPadding,
        paddingVertical: spacing.md,
        backgroundColor: clayTheme.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: clayTheme.surface,
        // ...clayUtils.shadow.sm, // Removed as it doesn't exist
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: clayTheme.text.primary,
    },
    listContent: {
        padding: layout.screenPadding,
        gap: spacing.sm,
    },
    emptyState: {
        padding: spacing.xl, // Changed from xxl to xl
        alignItems: 'center',
    },
    emptyText: {
        color: clayTheme.text.tertiary,
        fontSize: 16,
    }
});
