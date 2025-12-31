import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SmashColors } from '@/constants/theme';

const { width } = Dimensions.get('window');

// Referencias a personajes por pantalla
const characterEmojis = {
  conteo: '🍄',      // Mario
  minijuego: '🔫',   // Samus
  dojo: '👊',        // Dojo del Negro
  banco: '🦖',       // Yoshi
};

export default function HomeScreen() {
  const router = useRouter();
  const { usuarios, banco, loading } = useApp();

  // Animaciones
  const titleAnim = useRef(new Animated.Value(0)).current;
  const logoGlow = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animacion del titulo
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animacion del brillo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlow, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoGlow, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Animacion de estrellas
    Animated.loop(
      Animated.timing(starAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const titleScale = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const glowOpacity = logoGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.Text style={[styles.loadingLogo, { opacity: glowOpacity }]}>
          SMASH
        </Animated.Text>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Particulas de estrellas decorativas */}
      <View style={styles.starsContainer}>
        {[...Array(8)].map((_, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.star,
              {
                left: `${10 + (i * 12)}%`,
                top: `${5 + (i % 3) * 10}%`,
                opacity: starAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          >
            {i % 2 === 0 ? '✨' : '⭐'}
          </Animated.Text>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo principal */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.logoGlow, { opacity: glowOpacity }]} />
          <Animated.Text style={[styles.title, { transform: [{ scale: titleScale }] }]}>
          SMASH INFO
          </Animated.Text>
          <Text style={styles.year}>{new Date().getFullYear()}</Text>
        </View>

        {/* Subtitulo */}
        <Text style={styles.subtitle}>Gestion de Puntos de Juego</Text>

        {/* Iconos de personajes */}
        <View style={styles.characterRow}>
          <Text style={styles.characterEmoji}>🍄</Text>
          <Text style={styles.characterEmoji}>🔫</Text>
          <Text style={styles.characterEmoji}>⚔️</Text>
          <Text style={styles.characterEmoji}>🐻</Text>
          <Text style={styles.characterEmoji}>🦖</Text>
          <Text style={styles.characterEmoji}>🎮</Text>
        </View>

        {/* Estadisticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{usuarios.length}</Text>
            <Text style={styles.statLabel}>LUCHADORES</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGold]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statNumber, styles.statNumberGold]}>
              ${banco?.total?.toFixed(0) || '0'}
            </Text>
            <Text style={styles.statLabel}>BANCO</Text>
          </View>
        </View>

        {/* Menu de navegacion */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>SELECT MODE</Text>

          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonMario]}
            onPress={() => router.push('/(tabs)/conteo')}
          >
            <Text style={styles.menuButtonEmoji}>{characterEmojis.conteo}</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonText}>CONTEO SEMANAL</Text>
              <Text style={styles.menuButtonDesc}>Registrar puntos</Text>
            </View>
            <Text style={styles.menuButtonArrow}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonMetroid]}
            onPress={() => router.push('/(tabs)/minijuego')}
          >
            <Text style={styles.menuButtonEmoji}>{characterEmojis.minijuego}</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonText}>MINIJUEGO</Text>
              <Text style={styles.menuButtonDesc}>Ruleta y apuestas</Text>
            </View>
            <Text style={styles.menuButtonArrow}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonDojo]}
            onPress={() => router.push('/(tabs)/dojo')}
          >
            <Text style={styles.menuButtonEmoji}>{characterEmojis.dojo}</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonText}>DOJO DEL NEGRO</Text>
              <Text style={styles.menuButtonDesc}>Modo especial</Text>
            </View>
            <Text style={styles.menuButtonArrow}>▶</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonYoshi]}
            onPress={() => router.push('/(tabs)/banco')}
          >
            <Text style={styles.menuButtonEmoji}>{characterEmojis.banco}</Text>
            <View style={styles.menuButtonContent}>
              <Text style={styles.menuButtonText}>BANCO SMASH</Text>
              <Text style={styles.menuButtonDesc}>Pagos y deudas</Text>
            </View>
            <Text style={styles.menuButtonArrow}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Easter egg Banjo-Kazooie */}
        <View style={styles.easterEgg}>
          <Text style={styles.easterEggEmoji}>🐻🐦</Text>
          <Text style={styles.easterEggText}>Guh-huh!</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>PRESS START</Text>
          <View style={styles.footerIcons}>
            <Text style={styles.footerIcon}>🎮</Text>
            <Text style={styles.footerIcon}>🏆</Text>
            <Text style={styles.footerIcon}>🎮</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SmashColors.backgroundPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SmashColors.backgroundPrimary,
  },
  loadingLogo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: SmashColors.accentPrimary,
    letterSpacing: 8,
  },
  loadingText: {
    fontSize: 16,
    color: SmashColors.textSecondary,
    marginTop: 20,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  star: {
    position: 'absolute',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: 30,
    width: 250,
    height: 80,
    backgroundColor: SmashColors.accentPrimary,
    borderRadius: 40,
    opacity: 0.3,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: SmashColors.gold,
    letterSpacing: 4,
    textShadowColor: SmashColors.accentPrimary,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  year: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SmashColors.textWhite,
    letterSpacing: 8,
    marginTop: -5,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  smashBall: {
    position: 'absolute',
    right: 30,
    top: 30,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: SmashColors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: SmashColors.gold,
    transform: [{ rotate: '15deg' }],
  },
  smashBallText: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: SmashColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 16,
  },
  characterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  characterEmoji: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: SmashColors.backgroundSecondary,
    padding: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: SmashColors.accentPrimary,
  },
  statCardGold: {
    borderColor: SmashColors.gold,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: SmashColors.accentPrimary,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  statNumberGold: {
    color: SmashColors.gold,
  },
  statLabel: {
    fontSize: 10,
    color: SmashColors.textSecondary,
    letterSpacing: 2,
    marginTop: 4,
  },
  menuContainer: {
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontSize: 16,
    color: SmashColors.textSecondary,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 16,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderWidth: 3,
    borderColor: SmashColors.textWhite,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  menuButtonMario: {
    backgroundColor: '#e52521',
  },
  menuButtonMetroid: {
    backgroundColor: '#ff6600',
  },
  menuButtonDojo: {
    backgroundColor: '#1a1a1a',
  },
  menuButtonYoshi: {
    backgroundColor: '#7cb342',
  },
  menuButtonEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  menuButtonContent: {
    flex: 1,
  },
  menuButtonText: {
    color: SmashColors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  menuButtonDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  menuButtonArrow: {
    color: SmashColors.textWhite,
    fontSize: 20,
  },
  easterEgg: {
    alignItems: 'center',
    marginTop: 24,
    opacity: 0.6,
  },
  easterEggEmoji: {
    fontSize: 30,
  },
  easterEggText: {
    color: SmashColors.gold,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingBottom: 20,
  },
  footerText: {
    color: SmashColors.textSecondary,
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 8,
  },
  footerIcons: {
    flexDirection: 'row',
    gap: 20,
  },
  footerIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
});
