import React from 'react';
import { Pressable, PressableProps, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressProps extends PressableProps {
    style?: ViewStyle | ViewStyle[];
    scaleMin?: number;
}

export function AnimatedPress({
    children,
    style,
    scaleMin = 0.96,
    onPressIn,
    onPressOut,
    ...props
}: AnimatedPressProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = (e: any) => {
        scale.value = withSpring(scaleMin, { damping: 10, stiffness: 300 });
        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
        onPressOut?.(e);
    };

    return (
        <AnimatedPressable
            style={[style, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}

            {...props}
        >
            {children}
        </AnimatedPressable>
    );
}
