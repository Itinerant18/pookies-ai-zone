import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Tool } from '../../types';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
import { ToolIcon } from '../ui/tool-icon';
import { AnimatedPress } from '../ui/animated-press';
import { FontAwesome } from '@expo/vector-icons';

interface CompareHeaderProps {
    tools: Tool[];
    onRemove: (id: string) => void;
    scrollRef?: React.RefObject<ScrollView | null>;
    onScroll?: (event: any) => void;
    onScrollBeginDrag?: () => void;
    onScrollEndDrag?: () => void;
    onMomentumScrollEnd?: () => void;
    columnWidth: number;
}

export function CompareHeader({
    tools,
    onRemove,
    scrollRef,
    onScroll,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    columnWidth
}: CompareHeaderProps) {
    return (
        <View style={styles.container}>
            <View style={styles.cornerCell}>
                <Text style={styles.cornerText}>FEATURES</Text>
            </View>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={onScroll}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                contentContainerStyle={styles.scrollContent}
            >
                {tools.map((tool) => (
                    <View key={tool?._id || 'loading'} style={[styles.headerCell, { width: columnWidth }]}>
                        <View style={styles.iconWrapper}>
                            <ToolIcon
                                url={tool?.icon_url}
                                letter={tool?.icon_letter || '?'}
                                color={tool?.color || clayTheme.text.tertiary}
                                size={48}
                                borderRadius={14}
                                fontSize={20}
                            />
                            {tool && (
                                <AnimatedPress
                                    style={styles.removeBtn}
                                    onPress={() => onRemove(tool._id)}
                                // hitSlop handled by parent view or ensure adequate size
                                >
                                    <FontAwesome name="times-circle" size={20} color={clayTheme.accent.error} />
                                </AnimatedPress>
                            )}
                        </View>
                        <Text style={styles.toolName} numberOfLines={2}>
                            {tool?.name || 'Loading...'}
                        </Text>
                    </View>
                ))}
                {/* Spacer for padding at the end */}
                <View style={{ width: spacing.lg }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: clayTheme.background,
        borderBottomWidth: 1,
        borderBottomColor: clayTheme.clay.shadowDark,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
        zIndex: 10,
    },
    cornerCell: {
        width: 100,
        justifyContent: 'center',
        paddingLeft: spacing.lg,
        backgroundColor: clayTheme.background,
        zIndex: 20, // Keep corner above scrolling content if overlap occurs
    },
    cornerText: {
        fontSize: 12,
        fontWeight: '700',
        color: clayTheme.text.tertiary,
        letterSpacing: 1,
    },
    scrollContent: {
        paddingRight: spacing.lg,
    },
    headerCell: {
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
        marginHorizontal: spacing.xs,
    },
    iconWrapper: {
        marginBottom: spacing.xs,
        position: 'relative',
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: clayTheme.background,
        borderRadius: 10,
    },
    toolName: {
        fontSize: 13,
        fontWeight: '600',
        color: clayTheme.text.primary,
        textAlign: 'center',
        height: 36, // Fixed height for 2 lines
    },
});
