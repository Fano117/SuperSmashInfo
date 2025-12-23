import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { usuarios, banco, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DOJO SMASH 2025</Text>
      <Text style={styles.subtitle}>Gestion de Puntos de Juego</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{usuarios.length}</Text>
          <Text style={styles.statLabel}>Integrantes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${banco?.total?.toFixed(2) || '0.00'}</Text>
          <Text style={styles.statLabel}>Banco Total</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(tabs)/conteo')}>
          <Text style={styles.menuButtonText}>Registrar Conteo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(tabs)/minijuego')}>
          <Text style={styles.menuButtonText}>Minijuego</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(tabs)/tabla')}>
          <Text style={styles.menuButtonText}>Ver Tabla</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(tabs)/banco')}>
          <Text style={styles.menuButtonText}>Banco Smash</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
  },
  loadingText: {
    fontSize: 18,
    color: '#888',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  statCard: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  menuContainer: {
    width: '100%',
    gap: 12,
  },
  menuButton: {
    backgroundColor: '#0f3460',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  menuButtonText: {
    color: '#eee',
    fontSize: 18,
    fontWeight: '600',
  },
});
