import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

interface AnimatedListItemProps {
    children: React.ReactNode;
    index: number;
    style?: ViewStyle | ViewStyle[];
    /** Delay between each item in ms */
    staggerDelay?: number;
    /** Initial Y translation */
    translateY?: number;
}

/**
 * Wraps a list item to give it a staggered fade+slide-up entrance animation.
 * Use `index` from FlatList's renderItem to control stagger ordering.
 */
export function AnimatedListItem({
    children,
    index,
    style,
    staggerDelay = 60,
    translateY = 30,
}: AnimatedListItemProps) {
    const opacity = useSharedValue(0);
    const offsetY = useSharedValue(translateY);

    useEffect(() => {
        const delay = Math.min(index * staggerDelay, 600); // cap at 600ms
        opacity.value = withDelay(delay, withTiming(1, { duration: 350 }));
        offsetY.value = withDelay(
            delay,
            withSpring(0, { damping: 14, stiffness: 120 })
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: offsetY.value }],
    }));

    return (
        <Animated.View style={[{ flex: 1 }, style, animatedStyle]}>
            {children}
        </Animated.View>
    );
}
