import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

// Base Metal Button Styles
const buttonVariants = cva(
  "base",
  {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  {
    variants: {
      variant: {
        primary: {
          backgroundColor: "#6366F1",
          borderColor: "#6366F1",
        },
        secondary: {
          backgroundColor: "#8B5CF6",
          borderColor: "#8B5CF6",
        },
        ghost: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      },
      size: {
        sm: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 14,
        },
        md: {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 16,
        },
        lg: {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 18,
        },
      },
    },
  }
);

export interface MetalButtonProps extends React.ComponentProps<typeof TouchableOpacity> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
}

const MetalButton = React.forwardRef<TouchableOpacity, MetalButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, onPress, children, style, ...props }, ref) => {
    const colorScheme = useColorScheme();

    return (
      <TouchableOpacity
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={disabled ? 0.7 : 1}
        style={[
          style,
          {
            // Glass effect for active state
            ...(variant === 'ghost' && {
              backgroundColor: colorScheme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)',
            })
          }
        ]}
        {...props}
      >
        <Text
          className={`text-${variant}-${size}`}
          style={{
            color: variant === 'ghost'
              ? (colorScheme === 'dark' ? '#1A1A1A' : '#1A1A1A')
              : '#FFFFFF',
            fontWeight: '600',
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
      </TouchableOpacity>
    );
  }
);

MetalButton.displayName = "MetalButton";

export { MetalButton, buttonVariants };