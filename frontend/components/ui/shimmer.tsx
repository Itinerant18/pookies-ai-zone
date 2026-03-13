import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { clayTheme } from '../../theme/clay';

interface ShimmerProps {
    width: DimensionValue;
    height: DimensionValue;
    style?: any;
}

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

export function Shimmer({ width, height, style }: ShimmerProps) {
    const translateX = useSharedValue(-100);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(100, { duration: 1500, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: `${translateX.value}%` }],
    }));

    return (
        <View style={[
            {
                width,
                height,
                overflow: 'hidden',
                backgroundColor: clayTheme.surface,
                borderRadius: 12
            },
            style
        ]}>
            <AnimatedGradient
                colors={[
                    'transparent',
                    'rgba(0,0,0,0.05)',
                    'transparent'
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[StyleSheet.absoluteFill, animatedStyle, { width: '100%' }]}
            />
        </View>
    );
}
