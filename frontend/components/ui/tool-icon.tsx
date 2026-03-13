import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { clayTheme, clayUtils } from '../../theme/clay';

interface ToolIconProps {
    url?: string;
    letter: string;
    color: string;
    size?: number;
    style?: ViewStyle;
    imageStyle?: ImageStyle;
    fontSize?: number;
    borderRadius?: number;
}

export function ToolIcon({
    url,
    letter,
    color,
    size = 40,
    style,
    imageStyle,
    fontSize,
    borderRadius,
}: ToolIconProps) {
    const [hasError, setHasError] = useState(false);

    const showImage = url && !hasError;
    const effectiveBorderRadius = borderRadius ?? size * 0.25;
    const effectiveFontSize = fontSize ?? size * 0.4;

    return (
        <View
            style={[
                styles.container,
                {
                    width: size,
                    height: size,
                    borderRadius: effectiveBorderRadius,
                    backgroundColor: showImage ? 'transparent' : color,
                },
                style,
            ]}
        >
            {showImage ? (
                <Image
                    source={{ uri: url }}
                    style={[
                        styles.image,
                        { borderRadius: effectiveBorderRadius },
                        imageStyle
                    ]}
                    contentFit="contain"
                    transition={200}
                    onError={() => setHasError(true)}
                />
            ) : (
                <Text
                    style={[
                        styles.letter,
                        { fontSize: effectiveFontSize },
                    ]}
                >
                    {letter}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        // Optional: Add clay effect to the container if needed, 
        // but usually the icon itself is flat or inside a card that has the effect.
        // For consistent look with previous implementation, we keep it simple.
    },
    image: {
        width: '100%',
        height: '100%',
    },
    letter: {
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
