import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Tool } from '../../types';
import { clayTheme, spacing } from '../../theme/clay';
import { ToolGridCard } from '../ui/tool-grid-card';
import { useRouter } from 'expo-router';

interface RelatedToolsProps {
    category: string;
    currentToolId: string;
    onToolPress?: (tool: Tool) => void;
}

export function RelatedTools({ category, currentToolId, onToolPress }: RelatedToolsProps) {
    const tools = useQuery(api.tools.get, {});
    const router = useRouter();

    if (!tools) return null;

    // Filter by category and exclude current tool, limit to 5
    const related = tools
        .filter(t => t.category === category && t._id !== currentToolId)
        .slice(0, 5);

    if (related.length === 0) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>You might also like</Text>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={related}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={{ width: 280, marginRight: spacing.lg }}>
                        <ToolGridCard
                            {...item}
                            iconUrl={item.icon_url}
                            iconLetter={item.icon_letter}
                            onPress={() => {
                                if (onToolPress) {
                                    onToolPress(item);
                                } else {
                                    router.push(`/tool/${item._id}`);
                                }
                            }}
                            onToggleFavorite={() => { }} // TODO: Connect favorite logic if needed
                            onToggleCompare={() => { }}  // TODO: Connect compare logic if needed
                            isFavorite={false} // Placeholder
                            isComparing={false} // Placeholder
                        />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: clayTheme.text.primary,
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg, // Shadow space
    },
});
