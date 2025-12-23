import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';

interface SmashCardProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  style?: ViewStyle;
}

export default function SmashCard({ children, variant = 'primary', style }: SmashCardProps) {
  return (
    <View style={[
      styles.card,
      variant === 'primary' && styles.primary,
      variant === 'secondary' && styles.secondary,
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SmashSpacing.md,
    borderWidth: SmashSizes.borderWidth,
    borderColor: SmashColors.border,
    borderRadius: SmashSizes.borderRadius,
    // 8-bit shadow effect
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: SmashSizes.borderWidth, height: SmashSizes.borderWidth },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: SmashSizes.borderWidth,
  },
  primary: {
    backgroundColor: SmashColors.secondary,
  },
  secondary: {
    backgroundColor: SmashColors.tertiary,
  },
});
