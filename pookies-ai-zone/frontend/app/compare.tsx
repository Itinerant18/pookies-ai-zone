import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { clayTheme, clayUtils, spacing } from '../theme/clay';
import { CompareHeader } from '../components/compare/compare-header';
import { CompareRow } from '../components/compare/compare-row';
import { ClayButton } from '../components/ui/clay-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLUMN_WIDTH = 160;

export default function CompareScreen() {
    const { ids } = useLocalSearchParams<{ ids: string }>();
    const router = useRouter();
    const idList = ids?.split(',') || [];

    const tools = useQuery(api.tools.getByIds, { ids: idList });

    // Refs for syncing horizontal scroll
    const headerScrollRef = useRef<ScrollView>(null);
    const rowScrollRefs = useRef<React.RefObject<ScrollView | null>[]>([]);

    // activeScrollIndex.current = -1 for header, 0...N for rows
    const activeScrollIndex = useRef<number | null>(null);

    const handleScrollBegin = (index: number) => {
        activeScrollIndex.current = index;
    };

    const handleScrollEnd = () => {
        activeScrollIndex.current = null;
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>, index: number) => {
        if (activeScrollIndex.current !== index) {
            return;
        }

        const x = event.nativeEvent.contentOffset.x;

        // Sync header if it's not the source
        if (index !== -1) {
            headerScrollRef.current?.scrollTo({ x, animated: false });
        }

        // Sync all rows if they are not the source
        rowScrollRefs.current.forEach((ref, i) => {
            if (i !== index && ref.current) {
                ref.current.scrollTo({ x, animated: false });
            }
        });
    };

    const removeTool = async (idToRemove: string) => {
        const newIds = idList.filter(id => id !== idToRemove);
        if (newIds.length === 0) {
            router.back();
            await AsyncStorage.setItem('comparing', JSON.stringify([]));
        } else {
            router.setParams({ ids: newIds.join(',') });
            await AsyncStorage.setItem('comparing', JSON.stringify(newIds));
        }
    };

    if (tools === undefined) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loading}>
                    <Text style={styles.text}>Loading comparison...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const rows = [
        { label: 'Category', key: 'category' },
        { label: 'Pricing', key: 'pricing' },
        { label: 'Platforms', key: 'platforms' },
        { label: 'Features', key: 'features' },
        { label: 'Pros', key: 'pros' },
        { label: 'Cons', key: 'cons' },
    ];

    // Initialize refs array
    if (rowScrollRefs.current.length !== rows.length) {
        rowScrollRefs.current = Array(rows.length).fill(0).map((_, i) => rowScrollRefs.current[i] || React.createRef<ScrollView | null>());
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <ClayButton
                    onPress={() => router.back()}
                    variant="secondary"
                    size="sm"
                    icon="arrow-left"
                    style={{ width: 40, height: 40, paddingHorizontal: 0 }}
                />
                <Text style={styles.title}>Compare Tools</Text>
                <ClayButton
                    onPress={() => router.push('/')}
                    variant="secondary"
                    size="sm"
                    icon="plus"
                    textStyle={{ color: clayTheme.accent.primary }}
                    style={{ width: 40, height: 40, paddingHorizontal: 0 }}
                />
            </View>

            <ScrollView
                style={styles.mainScroll}
                stickyHeaderIndices={[0]}
                showsVerticalScrollIndicator={false}
            >
                {/* Sticky Header Row */}
                <CompareHeader
                    tools={tools as any[]}
                    onRemove={removeTool}
                    scrollRef={headerScrollRef}
                    onScroll={(e) => handleScroll(e, -1)}
                    onScrollBeginDrag={() => handleScrollBegin(-1)}
                    onScrollEndDrag={handleScrollEnd}
                    onMomentumScrollEnd={handleScrollEnd}
                    columnWidth={COLUMN_WIDTH}
                />

                {/* Data Rows */}
                <View style={styles.tableBody}>
                    {rows.map((row, index) => (
                        <CompareRow
                            key={row.key}
                            label={row.label}
                            dataKey={row.key}
                            tools={tools as any[]}
                            scrollRef={rowScrollRefs.current[index]}
                            onScroll={(e) => handleScroll(e, index)}
                            onScrollBeginDrag={() => handleScrollBegin(index)}
                            onScrollEndDrag={handleScrollEnd}
                            onMomentumScrollEnd={handleScrollEnd}
                            columnWidth={COLUMN_WIDTH}
                            isAlternate={index % 2 !== 0}
                        />
                    ))}
                    {/* Spacer at bottom */}
                    <View style={{ height: 40 }} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: clayTheme.background,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: clayTheme.background,
        zIndex: 20,
    },
    backBtn: {
        ...clayUtils.card,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        borderRadius: 12,
    },
    addBtn: {
        ...clayUtils.card,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 0,
        borderRadius: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: clayTheme.text.primary,
    },
    text: {
        color: clayTheme.text.secondary,
        fontSize: 16,
    },
    mainScroll: {
        flex: 1,
    },
    tableBody: {
        paddingBottom: spacing.xl,
    }
});
