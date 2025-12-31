import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';

interface SmashButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'fire';
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SmashButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: SmashButtonProps) {
  const buttonStyles = [
    styles.button,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'accent' && styles.accent,
    variant === 'fire' && styles.fire,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SmashSpacing.md,
    paddingHorizontal: SmashSpacing.lg,
    borderWidth: SmashSizes.borderWidth,
    borderColor: SmashColors.border,
    borderRadius: SmashSizes.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: SmashSizes.buttonHeight,
    // 8-bit shadow effect
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: SmashSizes.borderWidth, height: SmashSizes.borderWidth },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: SmashSizes.borderWidth,
  },
  primary: {
    backgroundColor: SmashColors.tertiary,
  },
  secondary: {
    backgroundColor: SmashColors.secondary,
  },
  accent: {
    backgroundColor: SmashColors.accent,
  },
  fire: {
    backgroundColor: SmashColors.fire,
  },
  disabled: {
    backgroundColor: SmashColors.textDark,
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    color: SmashColors.text,
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
