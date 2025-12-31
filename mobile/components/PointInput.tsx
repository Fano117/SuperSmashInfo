import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SmashColors, SmashSpacing, SmashSizes, CategoryIcons } from '@/constants/smashTheme';

interface PointInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  color: string;
  icon?: string;
}

export default function PointInput({ label, value, onChange, color, icon }: PointInputProps) {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(value - 1);
  
  const handleTextChange = (text: string) => {
    const parsed = parseFloat(text);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else if (text === '' || text === '-') {
      onChange(0);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonLeft]}
          onPress={decrement}
        >
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { borderColor: color }]}
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          textAlign="center"
        />
        
        <TouchableOpacity
          style={[styles.button, styles.buttonRight]}
          onPress={increment}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SmashSpacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SmashSpacing.sm,
  },
  icon: {
    fontSize: 16,
    marginRight: SmashSpacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: SmashSizes.inputHeight,
    backgroundColor: SmashColors.tertiary,
    borderWidth: SmashSizes.borderWidth,
    borderColor: SmashColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    // 8-bit shadow
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  buttonLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  buttonRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  buttonText: {
    color: SmashColors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    height: SmashSizes.inputHeight,
    backgroundColor: SmashColors.primary,
    borderWidth: SmashSizes.borderWidth,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    color: SmashColors.text,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: SmashSpacing.sm,
  },
});
