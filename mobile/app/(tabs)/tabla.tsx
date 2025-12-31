import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, CategoryLabels } from '@/constants/smashTheme';
import SmashCard from '@/components/SmashCard';
import SmashButton from '@/components/SmashButton';
import { getTablaGlobal } from '@/services/api';
import { Usuario } from '@/types';
import { PacManGame } from '@/components/games';

export default function TablaScreen() {
  const { usuarios, loading: contextLoading } = useApp();
  const [usuariosTabla, setUsuariosTabla] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  // Easter egg: PacMan - Tap trophies alternately (gold, silver, gold, silver, gold)
  const [showPacMan, setShowPacMan] = useState(false);
  const [trophySequence, setTrophySequence] = useState<number[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTrophyTap = (position: number) => {
    // Only track taps on first 2 positions (gold=0, silver=1)
    if (position > 1) return;

    // Reset sequence after 3 seconds of inactivity
    if (sequenceTimerRef.current) {
      clearTimeout(sequenceTimerRef.current);
    }
    sequenceTimerRef.current = setTimeout(() => {
      setTrophySequence([]);
    }, 3000);

    const newSequence = [...trophySequence, position];
    setTrophySequence(newSequence);

    // Check for pattern: alternating taps between gold(0) and silver(1) - 5 alternating taps
    // Pattern: (0,1,0,1,0) or (1,0,1,0,1)
    if (newSequence.length >= 5) {
      const lastFive = newSequence.slice(-5);
      let isAlternating = true;
      for (let i = 1; i < lastFive.length; i++) {
        if (lastFive[i] === lastFive[i - 1]) {
          isAlternating = false;
          break;
        }
      }
      if (isAlternating) {
        setShowPacMan(true);
        setTrophySequence([]);
      }
    }

    // Reset if sequence gets too long without success
    if (newSequence.length > 10) {
      setTrophySequence([]);
    }
  };

  // Actualizar datos cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      cargarTabla();
    }, [])
  );

  const cargarTabla = async () => {
    try {
      setLoading(true);
      const data = await getTablaGlobal();
      // Calculate total for each user
      // Dojos suman, pendejos/mimidos/castitontos restan, chescos son neutrales
      const dataWithTotal = data.map(u => ({
        ...u,
        total: (u.dojos || 0) - (u.pendejos || 0) - (u.mimidos || 0) - (u.castitontos || 0),
      }));
      // Sort by total descending
      dataWithTotal.sort((a, b) => (b.total || 0) - (a.total || 0));
      setUsuariosTabla(dataWithTotal);
    } catch (error) {
      Alert.alert('❌ ERROR', 'Error al cargar tabla');
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      setExportando(true);
      // For now, just show an alert that Excel export requires backend setup
      Alert.alert(
        '📥 EXPORTAR',
        'La exportación a Excel está disponible desde el backend en /api/tabla-global/exportar. Por favor configura el backend para usar esta funcionalidad.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('❌ ERROR', 'Error al exportar Excel');
    } finally {
      setExportando(false);
    }
  };

  const getMedalEmoji = (position: number) => {
    if (position === 0) return '🥇';
    if (position === 1) return '🥈';
    if (position === 2) return '🥉';
    return '▪️';
  };

  if (loading || contextLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={SmashColors.accent} />
        <Text style={styles.loadingText}>LOADING...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>🏆 TABLA GLOBAL 🏆</Text>
        <Text style={styles.subtitle}>RANKING DE PUNTOS</Text>

        {usuariosTabla.map((usuario, index) => {
          const isFirstPlace = index === 0;
          const cardStyle = isFirstPlace 
            ? { ...styles.userCard, ...styles.firstPlace }
            : styles.userCard;
          const nameStyle = isFirstPlace
            ? { ...styles.userName, ...styles.firstPlaceText }
            : styles.userName;
          const totalStyle = isFirstPlace
            ? { ...styles.totalPoints, ...styles.firstPlaceText }
            : styles.totalPoints;
          
          return (
            <SmashCard 
              key={usuario._id} 
              style={cardStyle}
            >
              <View style={styles.userHeader}>
                <TouchableOpacity onPress={() => handleTrophyTap(index)}>
                  <Text style={styles.medal}>{getMedalEmoji(index)}</Text>
                </TouchableOpacity>
                <Text style={nameStyle}>
                  {usuario.nombre.toUpperCase()}
                </Text>
                <Text style={totalStyle}>
                  {usuario.total?.toFixed(1) || '0'}
                </Text>
              </View>

            <View style={styles.pointsGrid}>
              <View style={styles.pointItem}>
                <Text style={styles.pointLabel}>{CategoryLabels.dojos}</Text>
                <Text style={[styles.pointValue, { color: SmashColors.dojos }]}>
                  {usuario.dojos?.toFixed(1) || '0'}
                </Text>
              </View>
              
              <View style={styles.pointItem}>
                <Text style={styles.pointLabel}>{CategoryLabels.pendejos}</Text>
                <Text style={[styles.pointValue, { color: SmashColors.pendejos }]}>
                  {usuario.pendejos?.toFixed(1) || '0'}
                </Text>
              </View>
              
              <View style={styles.pointItem}>
                <Text style={styles.pointLabel}>{CategoryLabels.chescos}</Text>
                <Text style={[styles.pointValue, { color: SmashColors.chescos }]}>
                  {usuario.chescos?.toFixed(1) || '0'}
                </Text>
              </View>
              
              <View style={styles.pointItem}>
                <Text style={styles.pointLabel}>{CategoryLabels.mimidos}</Text>
                <Text style={[styles.pointValue, { color: SmashColors.mimidos }]}>
                  {usuario.mimidos?.toFixed(1) || '0'}
                </Text>
              </View>
              
              <View style={styles.pointItem}>
                <Text style={styles.pointLabel}>{CategoryLabels.castitontos}</Text>
                <Text style={[styles.pointValue, { color: SmashColors.castitontos }]}>
                  {usuario.castitontos?.toFixed(1) || '0'}
                </Text>
              </View>
            </View>
          </SmashCard>
        );
        })}

        <View style={styles.buttonContainer}>
          <SmashButton
            title={exportando ? "EXPORTANDO..." : "📥 EXPORTAR EXCEL"}
            onPress={handleExportar}
            variant="accent"
            fullWidth
            disabled={exportando}
          />
        </View>
      </View>

      {/* PacMan Game Easter Egg */}
      <PacManGame visible={showPacMan} onClose={() => setShowPacMan(false)} />
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
    padding: SmashSpacing.lg,
    paddingBottom: SmashSpacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SmashColors.primary,
  },
  loadingText: {
    fontSize: 14,
    color: SmashColors.textDark,
    marginTop: SmashSpacing.md,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: SmashColors.dojos,
    textAlign: 'center',
    marginBottom: SmashSpacing.xs,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: SmashColors.textDark,
    textAlign: 'center',
    marginBottom: SmashSpacing.lg,
    fontWeight: 'bold',
  },
  userCard: {
    marginBottom: SmashSpacing.md,
  },
  firstPlace: {
    borderColor: SmashColors.dojos,
    backgroundColor: '#1a2a1a',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SmashSpacing.md,
    paddingBottom: SmashSpacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: SmashColors.border,
  },
  medal: {
    fontSize: 24,
    marginRight: SmashSpacing.sm,
  },
  userName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: SmashColors.text,
  },
  firstPlaceText: {
    color: SmashColors.dojos,
  },
  totalPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: SmashColors.accent,
  },
  pointsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SmashSpacing.sm,
  },
  pointItem: {
    width: '30%',
    alignItems: 'center',
  },
  pointLabel: {
    fontSize: 9,
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.xs,
    fontWeight: 'bold',
  },
  pointValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: SmashSpacing.md,
    marginTop: SmashSpacing.lg,
  },
});
