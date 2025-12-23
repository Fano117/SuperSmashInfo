import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, CategoryLabels, CategoryIcons } from '@/constants/smashTheme';
import SmashButton from '@/components/SmashButton';
import SmashCard from '@/components/SmashCard';
import Ruleta from '@/components/Ruleta';
import { crearApuesta, resolverApuesta } from '@/services/api';
import { TipoPunto } from '@/types';

type ModoRuleta = 'numeros' | 'integrantes';

export default function MinijuegoScreen() {
  const { usuarios, loading, refreshUsuarios } = useApp();
  const [modo, setModo] = useState<ModoRuleta>('numeros');
  const [numCampos, setNumCampos] = useState(6);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([]);
  const [tipoPunto, setTipoPunto] = useState<TipoPunto>('dojos');
  const [cantidad, setCantidad] = useState('10');
  const [resultado, setResultado] = useState<string | null>(null);
  const [apuestaId, setApuestaId] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);

  const opciones = modo === 'numeros'
    ? Array.from({ length: numCampos }, (_, i) => (i + 1).toString())
    : usuarios.map(u => u.nombre);

  const toggleParticipante = (usuarioId: string) => {
    if (participantesSeleccionados.includes(usuarioId)) {
      setParticipantesSeleccionados(prev => prev.filter(id => id !== usuarioId));
    } else {
      setParticipantesSeleccionados(prev => [...prev, usuarioId]);
    }
  };

  const handleCrearApuesta = async () => {
    if (participantesSeleccionados.length < 2) {
      Alert.alert('⚠️ ATENCION', 'Selecciona al menos 2 participantes');
      return;
    }

    if (!cantidad || parseFloat(cantidad) <= 0) {
      Alert.alert('⚠️ ATENCION', 'Ingresa una cantidad valida');
      return;
    }

    try {
      setProcesando(true);
      const apuesta = await crearApuesta(participantesSeleccionados, tipoPunto, parseFloat(cantidad));
      setApuestaId(apuesta._id);
      Alert.alert('✅ APUESTA CREADA', 'Gira la ruleta para determinar el ganador!');
    } catch (error) {
      Alert.alert('❌ ERROR', error instanceof Error ? error.message : 'Error al crear apuesta');
    } finally {
      setProcesando(false);
    }
  };

  const handleResultadoRuleta = async (resultado: string, index: number) => {
    setResultado(resultado);

    if (!apuestaId) {
      // Just show result, no bet
      Alert.alert('🎯 RESULTADO', `Ha salido: ${resultado}`);
      return;
    }

    // Determine winner
    let ganadorId: string | null = null;

    if (modo === 'integrantes') {
      const usuario = usuarios.find(u => u.nombre === resultado);
      if (usuario && participantesSeleccionados.includes(usuario._id)) {
        ganadorId = usuario._id;
      }
    } else {
      // In number mode, distribute winners evenly
      const ganadorIndex = index % participantesSeleccionados.length;
      ganadorId = participantesSeleccionados[ganadorIndex];
    }

    if (!ganadorId) {
      Alert.alert('⚠️ ERROR', 'No se pudo determinar ganador');
      return;
    }

    try {
      setProcesando(true);
      await resolverApuesta(apuestaId, ganadorId);
      await refreshUsuarios();

      const ganador = usuarios.find(u => u._id === ganadorId);
      Alert.alert(
        '🏆 WINNER!',
        `${ganador?.nombre} ha ganado ${cantidad} ${CategoryLabels[tipoPunto]}!`,
        [{ text: 'OK', onPress: resetApuesta }]
      );
    } catch (error) {
      Alert.alert('❌ ERROR', error instanceof Error ? error.message : 'Error al resolver apuesta');
    } finally {
      setProcesando(false);
    }
  };

  const resetApuesta = () => {
    setApuestaId(null);
    setResultado(null);
    setParticipantesSeleccionados([]);
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
        <Text style={styles.title}>🎲 MINIJUEGO 🎲</Text>
        <Text style={styles.subtitle}>ROBO DE PUNTOS</Text>

        {/* Modo de Ruleta */}
        <SmashCard style={styles.card}>
          <Text style={styles.sectionTitle}>MODO DE RULETA</Text>
          <View style={styles.modoButtons}>
            <SmashButton
              title="🔢 NUMEROS"
              onPress={() => setModo('numeros')}
              variant={modo === 'numeros' ? 'accent' : 'secondary'}
              style={styles.modoButton}
            />
            <SmashButton
              title="👥 INTEGRANTES"
              onPress={() => setModo('integrantes')}
              variant={modo === 'integrantes' ? 'accent' : 'secondary'}
              style={styles.modoButton}
            />
          </View>

          {modo === 'numeros' && (
            <View style={styles.camposContainer}>
              <Text style={styles.label}>NUMERO DE CAMPOS:</Text>
              <View style={styles.camposButtons}>
                {[2, 4, 6, 8, 10].map(n => (
                  <SmashButton
                    key={n}
                    title={n.toString()}
                    onPress={() => setNumCampos(n)}
                    variant={numCampos === n ? 'fire' : 'secondary'}
                    style={styles.campoButton}
                  />
                ))}
              </View>
            </View>
          )}
        </SmashCard>

        {/* Ruleta */}
        <SmashCard style={styles.card}>
          <Text style={styles.sectionTitle}>🎰 RULETA</Text>
          {resultado && (
            <View style={styles.resultadoContainer}>
              <Text style={styles.resultadoLabel}>RESULTADO:</Text>
              <Text style={styles.resultadoText}>{resultado}</Text>
            </View>
          )}
          <Ruleta opciones={opciones} onResultado={handleResultadoRuleta} />
        </SmashCard>

        {/* Configurar Apuesta */}
        <SmashCard style={styles.card}>
          <Text style={styles.sectionTitle}>⚔️ CONFIGURAR APUESTA</Text>

          <Text style={styles.label}>PARTICIPANTES:</Text>
          <View style={styles.participantesContainer}>
            {usuarios.map(usuario => (
              <SmashButton
                key={usuario._id}
                title={usuario.nombre}
                onPress={() => toggleParticipante(usuario._id)}
                variant={participantesSeleccionados.includes(usuario._id) ? 'accent' : 'secondary'}
                style={styles.participanteButton}
              />
            ))}
          </View>

          <Text style={styles.label}>TIPO DE PUNTO:</Text>
          <View style={styles.tipoButtons}>
            {(['dojos', 'pendejos', 'chescos', 'mimidos', 'castitontos'] as TipoPunto[]).map(tipo => (
              <SmashButton
                key={tipo}
                title={`${CategoryIcons[tipo]} ${CategoryLabels[tipo]}`}
                onPress={() => setTipoPunto(tipo)}
                variant={tipoPunto === tipo ? 'fire' : 'secondary'}
                style={styles.tipoButton}
              />
            ))}
          </View>

          <Text style={styles.label}>CANTIDAD:</Text>
          <TextInput
            style={styles.input}
            value={cantidad}
            onChangeText={setCantidad}
            placeholder="10"
            placeholderTextColor={SmashColors.textDark}
            keyboardType="numeric"
          />

          {!apuestaId ? (
            <SmashButton
              title={procesando ? "CREANDO..." : "✅ CREAR APUESTA"}
              onPress={handleCrearApuesta}
              variant="accent"
              fullWidth
              disabled={procesando}
            />
          ) : (
            <SmashButton
              title="🔄 NUEVA APUESTA"
              onPress={resetApuesta}
              variant="secondary"
              fullWidth
            />
          )}
        </SmashCard>
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
    color: SmashColors.fire,
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
  card: {
    marginBottom: SmashSpacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: SmashColors.text,
    marginBottom: SmashSpacing.md,
    textAlign: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.sm,
    marginTop: SmashSpacing.sm,
  },
  modoButtons: {
    flexDirection: 'row',
    gap: SmashSpacing.sm,
  },
  modoButton: {
    flex: 1,
  },
  camposContainer: {
    marginTop: SmashSpacing.md,
  },
  camposButtons: {
    flexDirection: 'row',
    gap: SmashSpacing.sm,
    flexWrap: 'wrap',
  },
  campoButton: {
    width: 50,
    paddingVertical: SmashSpacing.sm,
    paddingHorizontal: 0,
    minHeight: 0,
  },
  resultadoContainer: {
    alignItems: 'center',
    marginBottom: SmashSpacing.md,
    padding: SmashSpacing.md,
    backgroundColor: SmashColors.tertiary,
    borderRadius: 0,
  },
  resultadoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.xs,
  },
  resultadoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SmashColors.dojos,
  },
  participantesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SmashSpacing.sm,
  },
  participanteButton: {
    paddingVertical: SmashSpacing.sm,
    paddingHorizontal: SmashSpacing.md,
    minHeight: 0,
  },
  tipoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SmashSpacing.sm,
  },
  tipoButton: {
    paddingVertical: SmashSpacing.sm,
    paddingHorizontal: SmashSpacing.md,
    minHeight: 0,
  },
  input: {
    height: 40,
    backgroundColor: SmashColors.secondary,
    borderWidth: 3,
    borderColor: SmashColors.border,
    color: SmashColors.text,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: SmashSpacing.md,
    marginBottom: SmashSpacing.md,
    textAlign: 'center',
  },
});
