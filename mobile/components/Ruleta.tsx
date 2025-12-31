import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Switch } from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { Accelerometer } from 'expo-sensors';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';
import SmashButton from './SmashButton';

interface RuletaProps {
  opciones: string[];
  onResultado: (resultado: string, index: number) => void;
}

const RULETA_SIZE = 280;
const BORDER_WIDTH = 6;
const CENTER_SIZE = 60;
const SVG_SIZE = RULETA_SIZE - (BORDER_WIDTH * 2);
const RADIUS = SVG_SIZE / 2;

// Configuración del shake
const SHAKE_THRESHOLD = 1.5; // Umbral mínimo para detectar shake
const SHAKE_TIMEOUT = 500; // ms entre detecciones de shake

export default function Ruleta({ opciones, onResultado }: RuletaProps) {
  const [girando, setGirando] = useState(false);
  const [shakeEnabled, setShakeEnabled] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const rotacion = useRef(new Animated.Value(0)).current;
  const lastShakeTime = useRef(0);
  const shakeAccumulator = useRef(0);
  const shakeCount = useRef(0);
  const shakeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Configurar el acelerómetro
  useEffect(() => {
    let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;

    if (shakeEnabled && !girando) {
      Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        // Calcular la magnitud del movimiento
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        // Detectar shake si supera el umbral
        if (acceleration > SHAKE_THRESHOLD && now - lastShakeTime.current > 100) {
          lastShakeTime.current = now;
          shakeAccumulator.current += acceleration;
          shakeCount.current += 1;

          // Actualizar indicador visual de intensidad
          setShakeIntensity(Math.min(shakeAccumulator.current / 10, 1));

          // Reiniciar el timer para detectar fin del shake
          if (shakeTimer.current) {
            clearTimeout(shakeTimer.current);
          }

          shakeTimer.current = setTimeout(() => {
            // El usuario dejó de agitar - girar la ruleta
            if (shakeCount.current >= 3 && !girando) {
              const intensity = Math.min(shakeAccumulator.current / 5, 10); // Max 10 vueltas extra
              girarConIntensidad(intensity);
            }
            // Reset
            shakeAccumulator.current = 0;
            shakeCount.current = 0;
            setShakeIntensity(0);
          }, SHAKE_TIMEOUT);
        }
      });
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (shakeTimer.current) {
        clearTimeout(shakeTimer.current);
      }
    };
  }, [shakeEnabled, girando, opciones.length]);

  const girarConIntensidad = (intensity: number) => {
    if (girando || opciones.length === 0) return;

    setGirando(true);

    const resultIndex = Math.floor(Math.random() * opciones.length);
    const segmentAngle = 360 / opciones.length;

    const segmentCenterAngle = resultIndex * segmentAngle + segmentAngle / 2;
    const baseRotation = 360 - segmentCenterAngle;

    // Vueltas base (3) + vueltas extra basadas en la intensidad del shake
    const vueltas = 3 + Math.floor(intensity);
    const totalRotation = 360 * vueltas + baseRotation;

    // Duración basada en las vueltas (más vueltas = más tiempo)
    const duration = 2000 + (vueltas * 400);

    rotacion.setValue(0);

    Animated.timing(rotacion, {
      toValue: totalRotation,
      duration: duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setGirando(false);
      onResultado(opciones[resultIndex], resultIndex);
    });
  };

  const girar = () => {
    if (girando || opciones.length === 0) return;

    setGirando(true);

    const resultIndex = Math.floor(Math.random() * opciones.length);
    const segmentAngle = 360 / opciones.length;

    const segmentCenterAngle = resultIndex * segmentAngle + segmentAngle / 2;
    const baseRotation = 360 - segmentCenterAngle;
    const totalRotation = 360 * 5 + baseRotation;

    rotacion.setValue(0);

    Animated.timing(rotacion, {
      toValue: totalRotation,
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
      {/* Switch para activar shake */}
      <View style={styles.shakeToggle}>
        <Text style={styles.shakeLabel}>AGITAR PARA GIRAR</Text>
        <Switch
          value={shakeEnabled}
          onValueChange={setShakeEnabled}
          trackColor={{ false: SmashColors.border, true: SmashColors.fire }}
          thumbColor={shakeEnabled ? SmashColors.accent : SmashColors.textDark}
        />
      </View>

      {/* Indicador de intensidad del shake */}
      {shakeEnabled && shakeIntensity > 0 && (
        <View style={styles.intensityContainer}>
          <View style={styles.intensityBar}>
            <View
              style={[
                styles.intensityFill,
                { width: `${shakeIntensity * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.intensityText}>AGITANDO...</Text>
        </View>
      )}

      {shakeEnabled && !girando && shakeIntensity === 0 && (
        <Text style={styles.shakeHint}>Agita el celular para girar la ruleta</Text>
      )}

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
          <Svg width={SVG_SIZE} height={SVG_SIZE}>
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
            <Text style={styles.centerText}>{shakeEnabled ? '📳' : '🎲'}</Text>
          </View>
        </Animated.View>
      </View>

      <SmashButton
        title={girando ? "GIRANDO..." : (shakeEnabled ? "📳 AGITA EL CELULAR" : "🎰 GIRAR RULETA")}
        onPress={shakeEnabled ? undefined : girar}
        variant="fire"
        fullWidth
        disabled={girando || opciones.length === 0 || shakeEnabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  shakeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: SmashSpacing.md,
    padding: SmashSpacing.sm,
    backgroundColor: SmashColors.secondary,
    borderWidth: 2,
    borderColor: SmashColors.border,
  },
  shakeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SmashColors.text,
    letterSpacing: 1,
  },
  shakeHint: {
    fontSize: 10,
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.sm,
    fontStyle: 'italic',
  },
  intensityContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SmashSpacing.md,
  },
  intensityBar: {
    width: '80%',
    height: 12,
    backgroundColor: SmashColors.border,
    borderWidth: 2,
    borderColor: SmashColors.text,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    backgroundColor: SmashColors.fire,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SmashColors.fire,
    marginTop: 4,
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
    borderWidth: BORDER_WIDTH,
    borderColor: SmashColors.border,
    backgroundColor: SmashColors.primary,
    shadowColor: SmashColors.shadow,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    top: (RULETA_SIZE - CENTER_SIZE) / 2,
    left: (RULETA_SIZE - CENTER_SIZE) / 2,
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
