import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { liquidGlassTheme } from '../../theme/liquidGlass';

const GlassButton = ({ children, onPress, style, variant = 'ghost', size = 'md', disabled = false }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={disabled ? 0.7 : 1}
    style={[
      {
        backgroundColor: variant === 'ghost'
          ? liquidGlassTheme.glass.background
          : liquidGlassTheme.accent.primary,
        borderColor: liquidGlassTheme.glass.border,
        borderWidth: 1,
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 16,
        shadowColor: liquidGlassTheme.glass.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      style
    ]}
  >
    <Text
      style={{
        color: variant === 'ghost'
          ? liquidGlassTheme.text.secondary
          : '#FFFFFF',
        fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
        fontWeight: '600',
        textAlign: 'center',
      }}
    >
      {children}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  // No additional styles needed - using theme directly
});

GlassButton.displayName = "GlassButton";

export { GlassButton };