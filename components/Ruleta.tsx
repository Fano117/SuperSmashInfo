import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';
import SmashButton from './SmashButton';

interface RuletaProps {
  opciones: string[];
  onResultado: (resultado: string, index: number) => void;
}

const RULETA_SIZE = 280;
const CENTER_SIZE = 60;
const RADIUS = RULETA_SIZE / 2;

export default function Ruleta({ opciones, onResultado }: RuletaProps) {
  const [girando, setGirando] = useState(false);
  const rotacion = useRef(new Animated.Value(0)).current;

  const girar = () => {
    if (girando || opciones.length === 0) return;

    setGirando(true);

    // Random result
    const resultIndex = Math.floor(Math.random() * opciones.length);
    const segmentAngle = 360 / opciones.length;
    const targetRotation = 360 * 5 + (360 - (resultIndex * segmentAngle + segmentAngle / 2));

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

  const createPieSlice = (index: number, total: number) => {
    const anglePerSlice = (2 * Math.PI) / total;
    const startAngle = index * anglePerSlice - Math.PI / 2;
    const endAngle = (index + 1) * anglePerSlice - Math.PI / 2;

    const x1 = RADIUS + RADIUS * Math.cos(startAngle);
    const y1 = RADIUS + RADIUS * Math.sin(startAngle);
    const x2 = RADIUS + RADIUS * Math.cos(endAngle);
    const y2 = RADIUS + RADIUS * Math.sin(endAngle);

    const largeArcFlag = anglePerSlice > Math.PI ? 1 : 0;

    return `M ${RADIUS} ${RADIUS} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number, total: number) => {
    const anglePerSlice = (2 * Math.PI) / total;
    const midAngle = (index + 0.5) * anglePerSlice - Math.PI / 2;
    const textRadius = RADIUS * 0.65;

    return {
      x: RADIUS + textRadius * Math.cos(midAngle),
      y: RADIUS + textRadius * Math.sin(midAngle),
      rotation: (midAngle * 180) / Math.PI + 90,
    };
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
          <Svg width={RULETA_SIZE} height={RULETA_SIZE}>
            <G>
              {opciones.map((opcion, index) => {
                const color = colors[index % colors.length];
                const textPos = getTextPosition(index, opciones.length);

                return (
                  <G key={index}>
                    <Path
                      d={createPieSlice(index, opciones.length)}
                      fill={color}
                      stroke={SmashColors.border}
                      strokeWidth={2}
                    />
                    <SvgText
                      x={textPos.x}
                      y={textPos.y}
                      fill={SmashColors.text}
                      fontSize={11}
                      fontWeight="bold"
                      textAnchor="middle"
                      rotation={textPos.rotation}
                      origin={`${textPos.x}, ${textPos.y}`}
                    >
                      {opcion.length > 10 ? opcion.substring(0, 10) + '...' : opcion}
                    </SvgText>
                  </G>
                );
              })}
            </G>
          </Svg>

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
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
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
