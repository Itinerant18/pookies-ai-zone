import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Shimmer } from './shimmer';
import { glassUtils, spacing } from '../../theme/liquidGlass';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - (spacing.xl * 2) - spacing.md) / 2;

export function ToolGridCardSkeleton() {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Shimmer width={36} height={36} style={{ borderRadius: 10 }} />
                <Shimmer width={24} height={24} style={{ borderRadius: 12 }} />
            </View>
            <Shimmer width="70%" height={14} style={{ marginBottom: 6, borderRadius: 4 }} />
            <Shimmer width="90%" height={12} style={{ marginBottom: 10, borderRadius: 4 }} />
            <Shimmer width={60} height={20} style={{ borderRadius: 100 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        ...glassUtils.card,
        padding: 14,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
});
