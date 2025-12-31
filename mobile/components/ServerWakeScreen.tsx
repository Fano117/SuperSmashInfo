import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useServerWake } from '../context/ServerWakeContext';

const { width, height } = Dimensions.get('window');

export default function ServerWakeScreen() {
  const {
    isServerAwake,
    isChecking,
    currentAttempt,
    maxAttempts,
    statusMessage,
    hasError,
    retryWake,
  } = useServerWake();

  // Animaciones
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const starAnims = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(Math.random()),
    }))
  ).current;

  // Animación de pulso del título
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  // Animación de rotación del icono
  useEffect(() => {
    if (isChecking) {
      const rotate = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotate.start();

      return () => rotate.stop();
    }
  }, [isChecking, rotateAnim]);

  // Animación de progreso
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentAttempt / maxAttempts,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentAttempt, maxAttempts, progressAnim]);

  // Animación de estrellas
  useEffect(() => {
    starAnims.forEach((star, index) => {
      const animateStar = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: 1,
            duration: 500 + Math.random() * 500,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: 0.2,
            duration: 500 + Math.random() * 500,
            useNativeDriver: true,
          }),
        ]).start(animateStar);
      };
      setTimeout(animateStar, index * 200);
    });
  }, [starAnims]);

  // Fade out cuando el servidor está listo
  useEffect(() => {
    if (isServerAwake && !isChecking) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isServerAwake, isChecking, fadeAnim]);

  // No mostrar si el servidor ya está despierto
  if (isServerAwake && !isChecking) {
    return null;
  }

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Estrellas de fondo */}
      {starAnims.map((star, index) => (
        <Animated.Text
          key={index}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              opacity: star.opacity,
            },
          ]}
        >
          *
        </Animated.Text>
      ))}

      {/* Contenido principal */}
      <View style={styles.content}>
        {/* Título */}
        <Animated.Text
          style={[
            styles.title,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          SUPER SMASH
        </Animated.Text>

        {/* Icono animado */}
        <Animated.Text
          style={[
            styles.icon,
            { transform: [{ rotate: isChecking ? rotateInterpolate : '0deg' }] },
          ]}
        >
          {hasError ? '!' : isChecking ? '@' : '+'}
        </Animated.Text>

        {/* Mensaje de estado */}
        <Text style={styles.message}>{statusMessage}</Text>

        {/* Barra de progreso */}
        {isChecking && !hasError && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <Animated.View
                style={[
                  styles.progressBar,
                  { width: progressWidth },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentAttempt}/{maxAttempts}
            </Text>
          </View>
        )}

        {/* Botón de reintentar */}
        {hasError && (
          <TouchableOpacity style={styles.retryButton} onPress={retryWake}>
            <Text style={styles.retryButtonText}>REINTENTAR</Text>
          </TouchableOpacity>
        )}

        {/* Indicador de puntos animados */}
        {isChecking && !hasError && (
          <View style={styles.dotsContainer}>
            <LoadingDots />
          </View>
        )}

        {/* Mensaje adicional */}
        <Text style={styles.subMessage}>
          {hasError
            ? 'Verifica tu conexion a internet'
            : 'Usando servidor gratuito, puede tardar ~30 seg la primera vez'}
        </Text>
      </View>
    </Animated.View>
  );
}

// Componente de puntos de carga animados
function LoadingDots() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.stagger(200, [
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot1, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dot2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(dot3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(animateDots);
    };

    animateDots();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dots}>
      <Animated.Text style={[styles.dot, { opacity: dot1 }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot2 }]}>.</Animated.Text>
      <Animated.Text style={[styles.dot, { opacity: dot3 }]}>.</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  star: {
    position: 'absolute',
    color: '#ffd700',
    fontSize: 16,
    fontFamily: 'VT323_400Regular',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 24,
    color: '#ffd700',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: '#ff6600',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  icon: {
    fontSize: 60,
    color: '#ff6600',
    marginBottom: 30,
    fontFamily: 'VT323_400Regular',
  },
  message: {
    fontFamily: 'VT323_400Regular',
    fontSize: 24,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBackground: {
    width: '80%',
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffd700',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ffd700',
  },
  progressText: {
    fontFamily: 'VT323_400Regular',
    fontSize: 18,
    color: '#888',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#e52521',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffd700',
    marginTop: 20,
  },
  retryButtonText: {
    fontFamily: 'PressStart2P_400Regular',
    fontSize: 14,
    color: '#ffffff',
  },
  dotsContainer: {
    marginTop: 10,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    fontFamily: 'VT323_400Regular',
    fontSize: 48,
    color: '#ffd700',
    marginHorizontal: 5,
  },
  subMessage: {
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
    paddingHorizontal: 20,
  },
});
