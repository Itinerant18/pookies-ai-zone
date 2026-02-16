import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { clayTheme, clayUtils } from '../../theme/clay';

interface ClayCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const ClayCard = React.memo(({ children, style }: ClayCardProps) => (
    <View
        style={[
            styles.card,
            style
        ]}
    >
        {children}
    </View>
));

const styles = StyleSheet.create({
    card: {
        ...clayUtils.card, // Applies background, borderRadius, shadow, etc.
        // Ensure sufficient padding if not handled by children
    }
});

ClayCard.displayName = "ClayCard";

export { ClayCard };
