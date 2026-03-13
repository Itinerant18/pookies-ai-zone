import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { clayTheme, clayUtils, spacing } from '../../theme/clay';
// import { BlurView } from 'expo-blur'; // Removed for clay theme
import { AnimatedPress } from './animated-press';

const { width } = Dimensions.get('window');

interface ComparisonBarProps {
    count: number;
    onClear: () => void;
    onCompare: () => void;
}

export function ComparisonBar({ count, onClear, onCompare }: ComparisonBarProps) {
    if (count === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.blur}>
                <View style={styles.content}>
                    <View style={styles.left}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{count}</Text>
                        </View>
                        <Text style={styles.text}>Tools selected</Text>
                    </View>
                    <View style={styles.right}>
                        <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
                            <Text style={styles.clearText}>Clear</Text>
                        </TouchableOpacity>
                        <AnimatedPress style={styles.compareBtn} onPress={onCompare}>
                            <Text style={styles.compareText}>Compare</Text>
                            <FontAwesome name="arrow-right" size={16} color="#FFF" />
                        </AnimatedPress>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 80, // Above tab bar
        left: 16,
        right: 16,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: clayTheme.surface,
        borderWidth: 0,
        // Clay shadow for floating bar
        shadowColor: clayTheme.clay.shadowDark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    blur: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    badge: {
        backgroundColor: clayTheme.accent.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    text: {
        color: clayTheme.text.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    clearBtn: {
        paddingVertical: 4,
    },
    clearText: {
        color: clayTheme.text.secondary,
        fontSize: 13,
    },
    compareBtn: {
        backgroundColor: clayTheme.accent.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 6,
    },
    compareText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
});
