import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { liquidGlassTheme } from '../../theme/liquidGlass';

const GlassCard = React.memo(({ children, style }) => (
  <View
    style={[
      {
        backgroundColor: liquidGlassTheme.glass.background,
        borderColor: liquidGlassTheme.glass.border,
        borderWidth: 1,
        borderRadius: 24, // Larger radius for softness
        shadowColor: liquidGlassTheme.glass.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        // Add frosted glass effect
        // Note: backdropFilter not available in React Native, we'll use opacity
      },
      style
    ]}
  >
    <View style={styles.glassContent}>
      {children}
    </View>
  </View>
));

const styles = StyleSheet.create({
  glassContent: {
    padding: 24, // Extra padding inside glass
    // Semi-transparent overlay for glass effect
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  }
});

GlassCard.displayName = "GlassCard";

export { GlassCard };