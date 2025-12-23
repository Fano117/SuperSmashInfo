import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';
import SmashButton from './SmashButton';

interface RuletaProps {
  opciones: string[];
  onResultado: (resultado: string, index: number) => void;
}

export default function Ruleta({ opciones, onResultado }: RuletaProps) {
  const [girando, setGirando] = useState(false);
  const rotacion = useRef(new Animated.Value(0)).current;

  const girar = () => {
    if (girando || opciones.length === 0) return;

    setGirando(true);
    
    // Random result
    const resultIndex = Math.floor(Math.random() * opciones.length);
    const segmentAngle = 360 / opciones.length;
    const targetRotation = 360 * 5 + (360 - (resultIndex * segmentAngle + segmentAngle / 2)); // 5 full spins + position
    
    rotacion.setValue(0);
    
    Animated.timing(rotacion, {
      toValue: targetRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setGirando(false);
      onResultado(opciones[resultIndex], resultIndex);
    });
  };

  const renderSegmentos = () => {
    if (opciones.length === 0) return null;

    const segmentAngle = 360 / opciones.length;
    const colors = [
      SmashColors.accent,
      SmashColors.tertiary,
      SmashColors.fire,
      SmashColors.dojos,
      SmashColors.chescos,
      SmashColors.mimidos,
      SmashColors.pendejos,
      SmashColors.castitontos,
    ];

    return opciones.map((opcion, index) => {
      const rotation = index * segmentAngle;
      const color = colors[index % colors.length];

      return (
        <View
          key={index}
          style={[
            styles.segment,
            {
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}
        >
          <View style={[styles.segmentInner, { backgroundColor: color }]}>
            <Text style={styles.segmentText}>{opcion}</Text>
          </View>
        </View>
      );
    });
  };

  const spin = rotacion.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.ruletaContainer}>
        {/* Flecha indicadora */}
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>▼</Text>
        </View>

        {/* Ruleta */}
        <Animated.View
          style={[
            styles.ruleta,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          {renderSegmentos()}
          
          {/* Centro */}
          <View style={styles.center}>
            <Text style={styles.centerText}>🎲</Text>
          </View>
        </Animated.View>
      </View>

      <SmashButton
        title={girando ? "GIRANDO..." : "🎰 GIRAR RULETA"}
        onPress={girar}
        variant="fire"
        fullWidth
        disabled={girando || opciones.length === 0}
      />
    </View>
  );
}

const RULETA_SIZE = 280;
const CENTER_SIZE = 60;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  ruletaContainer: {
    position: 'relative',
    width: RULETA_SIZE,
    height: RULETA_SIZE,
    marginBottom: SmashSpacing.xl,
  },
  arrow: {
    position: 'absolute',
    top: -20,
    left: RULETA_SIZE / 2 - 15,
    width: 30,
    height: 30,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 30,
    color: SmashColors.accent,
    textShadowColor: SmashColors.shadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  ruleta: {
    width: RULETA_SIZE,
    height: RULETA_SIZE,
    borderRadius: RULETA_SIZE / 2,
    borderWidth: SmashSizes.borderWidth * 2,
    borderColor: SmashColors.border,
    overflow: 'hidden',
    backgroundColor: SmashColors.primary,
    // 8-bit shadow
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  segment: {
    position: 'absolute',
    width: RULETA_SIZE / 2,
    height: RULETA_SIZE / 2,
    top: 0,
    left: RULETA_SIZE / 4,
    transformOrigin: `${RULETA_SIZE / 4}px ${RULETA_SIZE / 2}px`,
  },
  segmentInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingTop: SmashSpacing.md,
  },
  segmentText: {
    color: SmashColors.text,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: SmashColors.shadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  center: {
    position: 'absolute',
    top: RULETA_SIZE / 2 - CENTER_SIZE / 2,
    left: RULETA_SIZE / 2 - CENTER_SIZE / 2,
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: SmashColors.secondary,
    borderWidth: SmashSizes.borderWidth,
    borderColor: SmashColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerText: {
    fontSize: 24,
  },
});
