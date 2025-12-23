import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { SmashColors, CategoryIcons } from '@/constants/theme';
import { TipoPunto } from '@/types';

interface FormularioPuntosProps {
  nombreUsuario: string;
  valoresIniciales?: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
  };
  onChange: (puntos: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
  }) => void;
  theme?: 'mario' | 'metroid' | 'banjo' | 'gamewatch' | 'smash';
}

const themeColors = {
  mario: {
    border: '#e52521',
    bg: '#049cd8',
    button: '#fbd000',
  },
  metroid: {
    border: '#ff6600',
    bg: '#1a1a2e',
    button: '#00ff00',
  },
  banjo: {
    border: '#f4a460',
    bg: '#228b22',
    button: '#ff69b4',
  },
  gamewatch: {
    border: '#333333',
    bg: '#b8c4a8',
    button: '#333333',
  },
  smash: {
    border: SmashColors.accentPrimary,
    bg: SmashColors.backgroundSecondary,
    button: SmashColors.gold,
  },
};

const categorias: { key: TipoPunto; label: string; icon: string; color: string }[] = [
  { key: 'dojos', label: 'Dojos', icon: CategoryIcons.dojos, color: SmashColors.dojos },
  { key: 'pendejos', label: 'Pendejos', icon: CategoryIcons.pendejos, color: SmashColors.pendejos },
  { key: 'mimidos', label: 'Mimidos', icon: CategoryIcons.mimidos, color: SmashColors.mimidos },
  { key: 'castitontos', label: 'Castitontos', icon: CategoryIcons.castitontos, color: SmashColors.castitontos },
  { key: 'chescos', label: 'Chescos', icon: CategoryIcons.chescos, color: SmashColors.chescos },
];

export default function FormularioPuntos({
  nombreUsuario,
  valoresIniciales = { dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0 },
  onChange,
  theme = 'mario',
}: FormularioPuntosProps) {
  const [puntos, setPuntos] = useState(valoresIniciales);
  const colors = themeColors[theme];

  const handleChange = (key: TipoPunto, delta: number) => {
    const nuevoValor = Math.round((puntos[key] + delta) * 100) / 100;
    const nuevosPuntos = { ...puntos, [key]: nuevoValor };
    setPuntos(nuevosPuntos);
    onChange(nuevosPuntos);
  };

  const handleInputChange = (key: TipoPunto, value: string) => {
    const numValue = parseFloat(value) || 0;
    const nuevosPuntos = { ...puntos, [key]: numValue };
    setPuntos(nuevosPuntos);
    onChange(nuevosPuntos);
  };

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={[styles.header, { backgroundColor: colors.border }]}>
        <Text style={styles.headerText}>{nombreUsuario}</Text>
        {theme === 'mario' && <Text style={styles.themeEmoji}>🍄</Text>}
        {theme === 'metroid' && <Text style={styles.themeEmoji}>🔫</Text>}
        {theme === 'banjo' && <Text style={styles.themeEmoji}>🐻</Text>}
        {theme === 'gamewatch' && <Text style={styles.themeEmoji}>🎮</Text>}
      </View>

      {categorias.map((cat) => (
        <View key={cat.key} style={styles.row}>
          <Text style={styles.icon}>{cat.icon}</Text>
          <Text style={[styles.label, { color: cat.color }]}>{cat.label}</Text>

          <View style={styles.controls}>
            {/* Boton -1 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonMinus]}
              onPress={() => handleChange(cat.key, -1)}
            >
              <Text style={styles.buttonText}>-1</Text>
            </TouchableOpacity>

            {/* Boton -0.5 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonMinus, styles.buttonSmall]}
              onPress={() => handleChange(cat.key, -0.5)}
            >
              <Text style={styles.buttonTextSmall}>-.5</Text>
            </TouchableOpacity>

            {/* Input */}
            <TextInput
              style={styles.input}
              value={puntos[cat.key].toString()}
              onChangeText={(v) => handleInputChange(cat.key, v)}
              keyboardType="numeric"
              selectTextOnFocus
            />

            {/* Boton +0.5 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonPlus, styles.buttonSmall]}
              onPress={() => handleChange(cat.key, 0.5)}
            >
              <Text style={styles.buttonTextSmall}>+.5</Text>
            </TouchableOpacity>

            {/* Boton +1 */}
            <TouchableOpacity
              style={[styles.button, styles.buttonPlus]}
              onPress={() => handleChange(cat.key, 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Total - Dojos suman, pendejos/mimidos/castitontos restan, chescos neutrales */}
      <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>
          {(puntos.dojos - puntos.pendejos - puntos.mimidos - puntos.castitontos).toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SmashColors.backgroundSecondary,
    borderWidth: 3,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerText: {
    color: SmashColors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  themeEmoji: {
    fontSize: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: SmashColors.backgroundPrimary,
  },
  icon: {
    fontSize: 20,
    width: 30,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
  },
  buttonSmall: {
    width: 32,
    height: 32,
  },
  buttonMinus: {
    backgroundColor: SmashColors.accentPrimary,
  },
  buttonPlus: {
    backgroundColor: SmashColors.greenVictory,
  },
  buttonText: {
    color: SmashColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  buttonTextSmall: {
    color: SmashColors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
  },
  input: {
    width: 60,
    height: 36,
    backgroundColor: SmashColors.backgroundPrimary,
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
    color: SmashColors.textWhite,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 3,
    backgroundColor: SmashColors.backgroundPrimary,
  },
  totalLabel: {
    color: SmashColors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  totalValue: {
    color: SmashColors.gold,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: SmashColors.accentPrimary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});
