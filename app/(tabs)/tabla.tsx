import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, CategoryLabels } from '@/constants/smashTheme';
import SmashCard from '@/components/SmashCard';
import SmashButton from '@/components/SmashButton';
import { getTablaGlobal, exportarExcel } from '@/services/api';
import { Usuario } from '@/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function TablaScreen() {
  const { usuarios, loading: contextLoading } = useApp();
  const [usuariosTabla, setUsuariosTabla] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    cargarTabla();
  }, []);

  const cargarTabla = async () => {
    try {
      setLoading(true);
      const data = await getTablaGlobal();
      // Calculate total for each user
      const dataWithTotal = data.map(u => ({
        ...u,
        total: (u.dojos || 0) + (u.pendejos || 0) + (u.chescos || 0) + (u.mimidos || 0) + (u.castitontos || 0),
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
      const blob = await exportarExcel();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(',')[1];
        
        // Save to file system
        const filename = `tabla_smash_${new Date().toISOString().split('T')[0]}.xlsx`;
        const fileUri = FileSystem.documentDirectory + filename;
        
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        // Share the file
        await Sharing.shareAsync(fileUri);
      };
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

        {usuariosTabla.map((usuario, index) => (
          <SmashCard key={usuario._id} style={[
            styles.userCard,
            index === 0 && styles.firstPlace,
          ]}>
            <View style={styles.userHeader}>
              <Text style={styles.medal}>{getMedalEmoji(index)}</Text>
              <Text style={[
                styles.userName,
                index === 0 && styles.firstPlaceText,
              ]}>
                {usuario.nombre.toUpperCase()}
              </Text>
              <Text style={[
                styles.totalPoints,
                index === 0 && styles.firstPlaceText,
              ]}>
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
        ))}

        <View style={styles.buttonContainer}>
          <SmashButton
            title="🔄 ACTUALIZAR"
            onPress={cargarTabla}
            variant="secondary"
            fullWidth
          />
          <SmashButton
            title={exportando ? "EXPORTANDO..." : "📥 EXPORTAR EXCEL"}
            onPress={handleExportar}
            variant="accent"
            fullWidth
            disabled={exportando}
          />
        </View>
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
