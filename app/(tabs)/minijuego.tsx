import { StyleSheet, View, Text, ScrollView, Alert, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, CategoryLabels, CategoryIcons } from '@/constants/smashTheme';
import SmashButton from '@/components/SmashButton';
import SmashCard from '@/components/SmashCard';
import Ruleta from '@/components/Ruleta';
import PasswordModal from '@/components/PasswordModal';
import { SnakeGame, FlappyYoshi, TetrisGame, PacManGame } from '@/components/games';
import { crearApuesta, resolverApuesta } from '@/services/api';
import { TipoPunto } from '@/types';

type ModoRuleta = 'numeros' | 'integrantes';

export default function MinijuegoScreen() {
  const { usuarios, loading, refreshUsuarios } = useApp();
  const [modo, setModo] = useState<ModoRuleta>('numeros');
  const [numCampos, setNumCampos] = useState(6);
  const [participantesSeleccionados, setParticipantesSeleccionados] = useState<string[]>([]);
  const [tipoPunto, setTipoPunto] = useState<TipoPunto>('dojos');
  const [cantidad, setCantidad] = useState('0');
  const [resultado, setResultado] = useState<string | null>(null);
  const [apuestaId, setApuestaId] = useState<string | null>(null);
  const [ganadorSeleccionado, setGanadorSeleccionado] = useState<string | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [showSnake, setShowSnake] = useState(false);
  const [showFlappy, setShowFlappy] = useState(false);
  const [showTetris, setShowTetris] = useState(false);
  const [showPacman, setShowPacman] = useState(false);
  const [jugadorActivo, setJugadorActivo] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado para modal de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const handleCrearApuesta = () => {
    if (participantesSeleccionados.length < 2) {
      Alert.alert('⚠️ ATENCION', 'Selecciona al menos 2 participantes');
      return;
    }

    if (!cantidad || parseFloat(cantidad) <= 0) {
      Alert.alert('⚠️ ATENCION', 'Ingresa una cantidad valida');
      return;
    }

    // Mostrar modal de contraseña
    setShowPasswordModal(true);
  };

  const handleCrearApuestaConfirmado = async () => {
    try {
      setProcesando(true);
      const apuesta = await crearApuesta(participantesSeleccionados, tipoPunto, parseFloat(cantidad));
      setApuestaId(apuesta._id);
      Alert.alert('✅ APUESTA CREADA', 'Selecciona el ganador!');
    } catch (error) {
      Alert.alert('❌ ERROR', error instanceof Error ? error.message : 'Error al crear apuesta');
    } finally {
      setProcesando(false);
    }
  };

  const handleResultadoRuleta = (resultado: string, index: number) => {
    setResultado(resultado);
    Alert.alert('🎯 RESULTADO', `Ha salido: ${resultado}`);
  };

  const handleResolverApuesta = async () => {
    if (!apuestaId || !ganadorSeleccionado) {
      Alert.alert('⚠️ ATENCION', 'Selecciona un ganador');
      return;
    }

    try {
      setProcesando(true);
      await resolverApuesta(apuestaId, ganadorSeleccionado);
      await refreshUsuarios();

      const ganador = usuarios.find(u => u._id === ganadorSeleccionado);
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
    setGanadorSeleccionado(null);
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

        {/* Titulo Minijuego - Long press 3s en dados abre Snake */}
        <View style={styles.titleContainer}>
          <TouchableOpacity
            onPressIn={() => {
              longPressTimer.current = setTimeout(() => {
                setShowSnake(true);
              }, 3000);
            }}
            onPressOut={() => {
              if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
              }
            }}
          >
            <Text style={styles.title}>🎲 MINIJUEGO 🎲</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>ROBO DE PUNTOS</Text>

        {/* Seccion Minijuegos Arcade */}
        <SmashCard style={styles.card}>
          <Text style={styles.sectionTitle}>🕹️ ARCADE</Text>

          <Text style={styles.label}>JUGADOR (para guardar puntuacion):</Text>
          <View style={styles.participantesContainer}>
            {usuarios.map(usuario => (
              <SmashButton
                key={usuario._id}
                title={usuario.nombre}
                onPress={() => setJugadorActivo(jugadorActivo === usuario._id ? null : usuario._id)}
                variant={jugadorActivo === usuario._id ? 'fire' : 'secondary'}
                style={styles.participanteButton}
              />
            ))}
          </View>

          <Text style={styles.label}>SELECCIONA UN JUEGO:</Text>
          <View style={styles.gamesGrid}>
            <SmashButton
              title="🐍 SNAKE"
              onPress={() => setShowSnake(true)}
              variant="accent"
              style={styles.gameButton}
            />
            <SmashButton
              title="🥚 FLAPPY"
              onPress={() => setShowFlappy(true)}
              variant="accent"
              style={styles.gameButton}
            />
            <SmashButton
              title="🧱 TETRIS"
              onPress={() => setShowTetris(true)}
              variant="accent"
              style={styles.gameButton}
            />
            <SmashButton
              title="👻 PACMAN"
              onPress={() => setShowPacman(true)}
              variant="accent"
              style={styles.gameButton}
            />
          </View>
        </SmashCard>

        {/* Games Modals */}
        <SnakeGame visible={showSnake} onClose={() => setShowSnake(false)} usuarioId={jugadorActivo || undefined} />
        <FlappyYoshi visible={showFlappy} onClose={() => setShowFlappy(false)} usuarioId={jugadorActivo || undefined} />
        <TetrisGame visible={showTetris} onClose={() => setShowTetris(false)} usuarioId={jugadorActivo || undefined} />
        <PacManGame visible={showPacman} onClose={() => setShowPacman(false)} usuarioId={jugadorActivo || undefined} />

        {/* Configurar Apuesta */}
        <SmashCard style={styles.card}>
          <Text style={styles.sectionTitle}>⚔️ APUESTAS</Text>

          {!apuestaId ? (
            <>
              <Text style={styles.label}>PARTICIPANTES (puntos {CategoryLabels[tipoPunto]}):</Text>
              <View style={styles.participantesContainer}>
                {usuarios.map(usuario => (
                  <SmashButton
                    key={usuario._id}
                    title={`${usuario.nombre} (${usuario[tipoPunto] || 0})`}
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

              <SmashButton
                title={procesando ? "CREANDO..." : " CREAR APUESTA"}
                onPress={handleCrearApuesta}
                variant="accent"
                fullWidth
                disabled={procesando}
              />
            </>
          ) : (
            <>
              <View style={styles.apuestaInfo}>
                <Text style={styles.apuestaInfoText}>
                  {participantesSeleccionados.length} jugadores × {cantidad} {CategoryLabels[tipoPunto]}
                </Text>
              </View>

              <Text style={styles.label}>SELECCIONA EL GANADOR:</Text>
              <View style={styles.participantesContainer}>
                {participantesSeleccionados.map(id => {
                  const usuario = usuarios.find(u => u._id === id);
                  return (
                    <SmashButton
                      key={id}
                      title={`🏆 ${usuario?.nombre}`}
                      onPress={() => setGanadorSeleccionado(id)}
                      variant={ganadorSeleccionado === id ? 'fire' : 'secondary'}
                      style={styles.participanteButton}
                    />
                  );
                })}
              </View>

              <SmashButton
                title={procesando ? "RESOLVIENDO..." : "✅ CONFIRMAR GANADOR"}
                onPress={handleResolverApuesta}
                variant="accent"
                fullWidth
                disabled={procesando || !ganadorSeleccionado}
                style={styles.confirmarButton}
              />

              <SmashButton
                title="❌ CANCELAR APUESTA"
                onPress={resetApuesta}
                variant="secondary"
                fullWidth
              />
            </>
          )}
        </SmashCard>
      </View>

      {/* Modal: Contraseña para crear apuesta */}
      <PasswordModal
        visible={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          handleCrearApuestaConfirmado();
        }}
        title="🔐 AUTORIZACIÓN REQUERIDA"
      />
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
  titleContainer: {
    alignItems: 'center',
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
  apuestaInfo: {
    backgroundColor: SmashColors.tertiary,
    padding: SmashSpacing.md,
    marginBottom: SmashSpacing.md,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: SmashColors.border,
  },
  apuestaInfoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: SmashColors.text,
  },
  confirmarButton: {
    marginBottom: SmashSpacing.sm,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SmashSpacing.sm,
    justifyContent: 'center',
  },
  gameButton: {
    width: '45%',
    paddingVertical: SmashSpacing.md,
  },
});
