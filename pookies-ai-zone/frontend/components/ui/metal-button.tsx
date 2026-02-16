import * as React from "react";
import { Text, TouchableOpacity, View, useColorScheme, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { clayTheme } from "../../theme/clay";

export interface MetalButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

import { TouchableOpacity as RNTouchableOpacity } from "react-native";

const MetalButton = React.forwardRef<any, MetalButtonProps>(
  ({ variant = "primary", size = "md", disabled, onPress, children, style, ...props }, ref) => {
    const colorScheme = useColorScheme();

    const getButtonStyle = (): ViewStyle => {
      let baseStyle: ViewStyle = {
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
      };

      // Variant
      if (variant === 'primary') {
        baseStyle.backgroundColor = clayTheme.accent.primary;
        baseStyle.borderColor = clayTheme.accent.primary;
      } else if (variant === 'secondary') {
        baseStyle.backgroundColor = clayTheme.accent.secondary;
        baseStyle.borderColor = clayTheme.accent.secondary;
      } else {
        baseStyle.backgroundColor = 'rgba(0, 0, 0, 0.05)';
        baseStyle.borderColor = 'rgba(0, 0, 0, 0.1)';
      }

      // Size
      if (size === 'sm') {
        baseStyle.paddingVertical = 6;
        baseStyle.paddingHorizontal = 12;
      } else if (size === 'lg') {
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 20;
      } else {
        baseStyle.paddingVertical = 8;
        baseStyle.paddingHorizontal = 16;
      }

      return baseStyle;
    };

    const getTextStyle = (): TextStyle => {
      return {
        color: variant === 'ghost' ? clayTheme.text.primary : '#FFFFFF',
        fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
        fontWeight: '600',
        textAlign: 'center',
      };
    };

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 0.7 : 0.8}
        style={[getButtonStyle(), style]}
        {...props}
      >
        <Text style={getTextStyle()}>
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);

MetalButton.displayName = "MetalButton";

export { MetalButton };