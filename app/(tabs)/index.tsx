import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, SmashSizes, SmashFonts } from '@/constants/smashTheme';
import SmashButton from '@/components/SmashButton';
import SmashCard from '@/components/SmashCard';

export default function HomeScreen() {
  const router = useRouter();
  const { usuarios, banco, loading, refreshAll } = useApp();

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={SmashColors.accent} />
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>DOJO SMASH</Text>
        <Text style={styles.year}>2025</Text>
        <Text style={styles.subtitle}>⚔️ PUNTOS DE JUEGO ⚔️</Text>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <SmashCard style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>{usuarios.length}</Text>
            <Text style={styles.statLabel}>PLAYERS</Text>
          </SmashCard>
          
          <SmashCard style={styles.statCard}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statNumber, { color: SmashColors.dojos }]}>
              ${banco?.total?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.statLabel}>BANCO</Text>
          </SmashCard>
        </View>

        {/* Menu Buttons */}
        <View style={styles.menuContainer}>
          <SmashButton
            title="📝 CONTEO SEMANAL"
            onPress={() => router.push('/(tabs)/conteo')}
            variant="primary"
            fullWidth
          />
          <SmashButton
            title="🎲 MINIJUEGO"
            onPress={() => router.push('/(tabs)/minijuego')}
            variant="accent"
            fullWidth
          />
          <SmashButton
            title="📊 TABLA GLOBAL"
            onPress={() => router.push('/(tabs)/tabla')}
            variant="secondary"
            fullWidth
          />
          <SmashButton
            title="💵 BANCO SMASH"
            onPress={() => router.push('/(tabs)/banco')}
            variant="fire"
            fullWidth
          />
          
          <SmashButton
            title="🔄 REFRESH"
            onPress={refreshAll}
            variant="secondary"
            fullWidth
          />
        </View>

        {/* Footer */}
        <Text style={styles.footer}>PRESS START</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: SmashColors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SmashSpacing.lg,
    backgroundColor: SmashColors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: SmashColors.accent,
    marginBottom: 0,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: SmashColors.shadow,
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  year: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SmashColors.dojos,
    marginBottom: SmashSpacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.xl,
    textAlign: 'center',
    letterSpacing: 1,
  },
  loadingText: {
    fontSize: 14,
    color: SmashColors.textDark,
    marginTop: SmashSpacing.md,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SmashSpacing.md,
    marginBottom: SmashSpacing.xl,
    width: '100%',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SmashSpacing.lg,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: SmashSpacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SmashColors.accent,
    marginBottom: SmashSpacing.xs,
  },
  statLabel: {
    fontSize: 10,
    color: SmashColors.textDark,
    fontWeight: 'bold',
  },
  menuContainer: {
    width: '100%',
    gap: SmashSpacing.md,
    marginBottom: SmashSpacing.lg,
  },
  footer: {
    fontSize: 10,
    color: SmashColors.textDark,
    marginTop: SmashSpacing.lg,
    fontWeight: 'bold',
    opacity: 0.5,
  },
});
