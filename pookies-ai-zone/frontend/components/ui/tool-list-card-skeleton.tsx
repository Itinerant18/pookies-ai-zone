import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Shimmer } from './shimmer';
import { clayUtils, spacing } from '../../theme/clay';

export function ToolListCardSkeleton() {
    return (
        <View style={styles.card}>
            <View style={styles.left}>
                <Shimmer width={44} height={44} style={{ borderRadius: 12 }} />
                <View style={{ gap: 6 }}>
                    <Shimmer width={120} height={15} style={{ borderRadius: 4 }} />
                    <Shimmer width={80} height={12} style={{ borderRadius: 4 }} />
                </View>
            </View>
            <Shimmer width={20} height={20} style={{ borderRadius: 10 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        ...clayUtils.card,
        padding: 14,
        marginHorizontal: spacing.lg,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    }
});
