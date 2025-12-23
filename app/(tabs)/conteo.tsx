import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, CategoryIcons, CategoryLabels } from '@/constants/smashTheme';
import SmashButton from '@/components/SmashButton';
import SmashCard from '@/components/SmashCard';
import PointInput from '@/components/PointInput';
import { registrarConteoBatch } from '@/services/api';
import { Usuario } from '@/types';

interface UsuarioPuntos {
  usuarioId: string;
  nombre: string;
  dojos: number;
  pendejos: number;
  mimidos: number;
  castitontos: number;
  chescos: number;
}

export default function ConteoScreen() {
  const { usuarios, loading, refreshUsuarios } = useApp();
  const [puntos, setPuntos] = useState<Record<string, UsuarioPuntos>>({});
  const [semana, setSemana] = useState<string>('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    // Initialize points for all users
    const initialPuntos: Record<string, UsuarioPuntos> = {};
    usuarios.forEach(usuario => {
      initialPuntos[usuario._id] = {
        usuarioId: usuario._id,
        nombre: usuario.nombre,
        dojos: 0,
        pendejos: 0,
        mimidos: 0,
        castitontos: 0,
        chescos: 0,
      };
    });
    setPuntos(initialPuntos);

    // Set current week
    const now = new Date();
    const weekNumber = Math.ceil((now.getDate()) / 7);
    setSemana(`${now.getFullYear()}-W${weekNumber}`);
  }, [usuarios]);

  const updatePunto = (usuarioId: string, categoria: string, valor: number) => {
    setPuntos(prev => ({
      ...prev,
      [usuarioId]: {
        ...prev[usuarioId],
        [categoria]: valor,
      },
    }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      const registros = Object.values(puntos).map(p => ({
        usuarioId: p.usuarioId,
        semana,
        dojos: p.dojos,
        pendejos: p.pendejos,
        mimidos: p.mimidos,
        castitontos: p.castitontos,
        chescos: p.chescos,
      }));

      await registrarConteoBatch(semana, registros);
      await refreshUsuarios();
      
      Alert.alert(
        '✅ COMPLETE!',
        'Conteo registrado exitosamente',
        [{ text: 'OK', onPress: () => {
          // Reset points
          const resetPuntos: Record<string, UsuarioPuntos> = {};
          usuarios.forEach(usuario => {
            resetPuntos[usuario._id] = {
              usuarioId: usuario._id,
              nombre: usuario.nombre,
              dojos: 0,
              pendejos: 0,
              mimidos: 0,
              castitontos: 0,
              chescos: 0,
            };
          });
          setPuntos(resetPuntos);
        }}]
      );
    } catch (error) {
      Alert.alert('❌ ERROR', error instanceof Error ? error.message : 'Error al guardar conteo');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
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
        <Text style={styles.title}>CONTEO SEMANAL</Text>
        <Text style={styles.subtitle}>Semana: {semana}</Text>

        {usuarios.map((usuario) => {
          const userPuntos = puntos[usuario._id];
          if (!userPuntos) return null;

          return (
            <SmashCard key={usuario._id} style={styles.userCard}>
              <Text style={styles.userName}>👤 {usuario.nombre.toUpperCase()}</Text>
              
              <PointInput
                label={CategoryLabels.dojos}
                value={userPuntos.dojos}
                onChange={(val) => updatePunto(usuario._id, 'dojos', val)}
                color={SmashColors.dojos}
                icon={CategoryIcons.dojos}
              />
              
              <PointInput
                label={CategoryLabels.pendejos}
                value={userPuntos.pendejos}
                onChange={(val) => updatePunto(usuario._id, 'pendejos', val)}
                color={SmashColors.pendejos}
                icon={CategoryIcons.pendejos}
              />
              
              <PointInput
                label={CategoryLabels.chescos}
                value={userPuntos.chescos}
                onChange={(val) => updatePunto(usuario._id, 'chescos', val)}
                color={SmashColors.chescos}
                icon={CategoryIcons.chescos}
              />
              
              <PointInput
                label={CategoryLabels.mimidos}
                value={userPuntos.mimidos}
                onChange={(val) => updatePunto(usuario._id, 'mimidos', val)}
                color={SmashColors.mimidos}
                icon={CategoryIcons.mimidos}
              />
              
              <PointInput
                label={CategoryLabels.castitontos}
                value={userPuntos.castitontos}
                onChange={(val) => updatePunto(usuario._id, 'castitontos', val)}
                color={SmashColors.castitontos}
                icon={CategoryIcons.castitontos}
              />
            </SmashCard>
          );
        })}

        <SmashButton
          title={guardando ? "GUARDANDO..." : "💾 GUARDAR CONTEO"}
          onPress={handleGuardar}
          variant="accent"
          fullWidth
          disabled={guardando}
        />
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
    color: SmashColors.accent,
    textAlign: 'center',
    marginBottom: SmashSpacing.sm,
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
    marginBottom: SmashSpacing.lg,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SmashColors.text,
    marginBottom: SmashSpacing.md,
    textAlign: 'center',
  },
});
