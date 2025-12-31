import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '@/context/AppContext';
import { SmashColors } from '@/constants/theme';
import { guardarDojoRifa, getUltimaDojoRifa, DojoRifa } from '@/services/api';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width - 80;
const WHEEL_RADIUS = WHEEL_SIZE / 2;

// Colores para las rebanadas de la ruleta
const SLICE_COLORS = [
  '#e52521', // Rojo Mario
  '#049cd8', // Azul
  '#fbd000', // Amarillo
  '#43b047', // Verde
  '#ff6600', // Naranja
  '#9b59b6', // Morado
  '#e91e63', // Rosa
  '#00bcd4', // Cyan
  '#ff5722', // Naranja oscuro
  '#8bc34a', // Verde claro
  '#3f51b5', // Indigo
  '#f44336', // Rojo
  '#009688', // Teal
  '#ffeb3b', // Amarillo brillante
  '#673ab7', // Morado profundo
];

// Keys para AsyncStorage
const STORAGE_KEYS = {
  COSAS: 'dojo_cosas_lista',
  RESULTADOS: 'dojo_resultados',
};

interface Cosa {
  id: string;
  nombre: string;
  disponible: boolean;
}

interface Resultado {
  id: string;
  cosa: string;
  jugador: string;
  timestamp: number;
}

export default function DojoScreen() {
  const { usuarios } = useApp();

  // Estados principales
  const [cosas, setCosas] = useState<Cosa[]>([]);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  // Estados para modales
  const [modalAgregar, setModalAgregar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalJugador, setModalJugador] = useState(false);
  const [modalUltimaRifa, setModalUltimaRifa] = useState(false);
  const [cosaEditando, setCosaEditando] = useState<Cosa | null>(null);
  const [cosaGanadora, setCosaGanadora] = useState<Cosa | null>(null);

  // Estados para inputs
  const [nuevaCosa, setNuevaCosa] = useState('');
  const [nombreEditado, setNombreEditado] = useState('');

  // Estados para la ruleta
  const [girando, setGirando] = useState(false);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const [rotationDegrees, setRotationDegrees] = useState(0);

  // Estados para backend
  const [guardando, setGuardando] = useState(false);
  const [cargandoUltima, setCargandoUltima] = useState(false);
  const [ultimaRifa, setUltimaRifa] = useState<DojoRifa | null>(null);

  // Cargar datos al iniciar
  useEffect(() => {
    cargarDatos();
  }, []);

  // Guardar datos cuando cambien
  useEffect(() => {
    guardarDatos();
  }, [cosas, resultados]);

  const cargarDatos = async () => {
    try {
      const cosasGuardadas = await AsyncStorage.getItem(STORAGE_KEYS.COSAS);
      const resultadosGuardados = await AsyncStorage.getItem(STORAGE_KEYS.RESULTADOS);

      if (cosasGuardadas) {
        setCosas(JSON.parse(cosasGuardadas));
      }
      if (resultadosGuardados) {
        setResultados(JSON.parse(resultadosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const guardarDatos = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COSAS, JSON.stringify(cosas));
      await AsyncStorage.setItem(STORAGE_KEYS.RESULTADOS, JSON.stringify(resultados));
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  // Cosas disponibles para la ruleta
  const cosasDisponibles = cosas.filter(c => c.disponible);

  // Agregar nueva cosa
  const handleAgregarCosa = () => {
    if (!nuevaCosa.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para la cosa');
      return;
    }
    if (cosas.length >= 30) {
      Alert.alert('Limite alcanzado', 'Solo puedes agregar hasta 30 cosas');
      return;
    }

    const nueva: Cosa = {
      id: Date.now().toString(),
      nombre: nuevaCosa.trim().toUpperCase(),
      disponible: true,
    };

    setCosas([...cosas, nueva]);
    setNuevaCosa('');
    setModalAgregar(false);
  };

  // Editar cosa
  const handleEditarCosa = () => {
    if (!nombreEditado.trim() || !cosaEditando) return;

    setCosas(cosas.map(c =>
      c.id === cosaEditando.id
        ? { ...c, nombre: nombreEditado.trim().toUpperCase() }
        : c
    ));
    setModalEditar(false);
    setCosaEditando(null);
    setNombreEditado('');
  };

  // Eliminar cosa
  const handleEliminarCosa = (cosa: Cosa) => {
    Alert.alert(
      'Eliminar',
      `¿Eliminar "${cosa.nombre}" de la lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setCosas(cosas.filter(c => c.id !== cosa.id));
          },
        },
      ]
    );
  };

  // Abrir modal de edicion
  const abrirEdicion = (cosa: Cosa) => {
    setCosaEditando(cosa);
    setNombreEditado(cosa.nombre);
    setModalEditar(true);
  };

  // Girar la ruleta
  const girarRuleta = () => {
    if (cosasDisponibles.length === 0) {
      Alert.alert('Sin cosas', 'Agrega cosas a la lista primero');
      return;
    }
    if (cosasDisponibles.length === 1) {
      // Si solo hay una, seleccionarla directamente
      setCosaGanadora(cosasDisponibles[0]);
      setModalJugador(true);
      return;
    }
    if (girando) return;

    setGirando(true);

    // Calcular angulo aleatorio
    const numCosas = cosasDisponibles.length;
    const sliceAngle = 360 / numCosas;
    const randomIndex = Math.floor(Math.random() * numCosas);

    // La ruleta se dibuja con el primer segmento (index 0) empezando en las 12 en punto
    // Para que el segmento randomIndex quede arriba donde está la flecha:
    // - El centro del segmento 0 está en sliceAngle/2 grados
    // - El centro del segmento N está en (N * sliceAngle) + (sliceAngle/2)
    // - Necesitamos rotar para que ese centro quede en 0° (arriba)
    const segmentCenterAngle = randomIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = 360 - segmentCenterAngle;
    const totalRotation = rotationDegrees + 1800 + targetAngle; // 5 vueltas + angulo final

    Animated.timing(rotationAnim, {
      toValue: totalRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setRotationDegrees(totalRotation);
      setGirando(false);

      // El ganador es el randomIndex que calculamos al inicio
      const ganadora = cosasDisponibles[randomIndex];

      setCosaGanadora(ganadora);
      setModalJugador(true);
    });
  };

  // Asignar cosa a jugador
  const asignarAJugador = (jugadorNombre: string) => {
    if (!cosaGanadora) return;

    // Agregar a resultados
    const nuevoResultado: Resultado = {
      id: Date.now().toString(),
      cosa: cosaGanadora.nombre,
      jugador: jugadorNombre,
      timestamp: Date.now(),
    };
    setResultados([nuevoResultado, ...resultados]);

    // Marcar cosa como no disponible
    setCosas(cosas.map(c =>
      c.id === cosaGanadora.id ? { ...c, disponible: false } : c
    ));

    setModalJugador(false);
    setCosaGanadora(null);
  };

  // Reiniciar (poner todas las cosas disponibles de nuevo)
  const handleReiniciar = () => {
    Alert.alert(
      'Reiniciar Rifa',
      '¿Poner todas las cosas disponibles de nuevo? Los resultados se mantendran.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          onPress: () => {
            setCosas(cosas.map(c => ({ ...c, disponible: true })));
          },
        },
      ]
    );
  };

  // Limpiar resultados
  const handleLimpiarResultados = () => {
    Alert.alert(
      'Limpiar Resultados',
      '¿Eliminar todos los resultados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            setResultados([]);
          },
        },
      ]
    );
  };

  // Guardar rifa terminada en el backend
  const handleGuardarRifa = async () => {
    if (resultados.length === 0) {
      Alert.alert('Sin resultados', 'No hay resultados para guardar');
      return;
    }

    Alert.alert(
      'Guardar Rifa',
      '¿Guardar esta rifa como terminada? Se enviara al servidor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async () => {
            setGuardando(true);
            try {
              const resultadosParaGuardar = resultados.map(r => ({
                cosa: r.cosa,
                jugador: r.jugador,
              }));

              const fecha = new Date().toLocaleDateString('es-MX', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              await guardarDojoRifa(resultadosParaGuardar, `Rifa del Dojo - ${fecha}`);

              Alert.alert(
                '¡Guardado!',
                'La rifa ha sido guardada exitosamente en el servidor.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Error al guardar rifa:', error);
              Alert.alert('Error', 'No se pudo guardar la rifa. Verifica tu conexion.');
            } finally {
              setGuardando(false);
            }
          },
        },
      ]
    );
  };

  // Cargar ultima rifa del backend
  const handleVerUltimaRifa = async () => {
    setCargandoUltima(true);
    try {
      const rifa = await getUltimaDojoRifa();
      setUltimaRifa(rifa);
      setModalUltimaRifa(true);
    } catch (error) {
      console.error('Error al cargar ultima rifa:', error);
      Alert.alert('Sin rifas', 'No hay rifas guardadas en el servidor.');
    } finally {
      setCargandoUltima(false);
    }
  };

  // Funcion para crear path de arco SVG
  const createArcPath = (
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number
  ): string => {
    // Convertir angulos a radianes (ajustar para que 0 sea arriba)
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // Renderizar rebanadas de la ruleta con SVG
  const renderWheelSVG = () => {
    if (cosasDisponibles.length === 0) return null;

    const numSlices = cosasDisponibles.length;
    const sliceAngle = 360 / numSlices;
    const centerX = WHEEL_RADIUS;
    const centerY = WHEEL_RADIUS;
    const radius = WHEEL_RADIUS - 6; // Restar el borde

    return (
      <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
        <G>
          {cosasDisponibles.map((cosa, index) => {
            const startAngle = index * sliceAngle;
            const endAngle = startAngle + sliceAngle;
            const color = SLICE_COLORS[index % SLICE_COLORS.length];
            const pathData = createArcPath(centerX, centerY, radius, startAngle, endAngle);

            // Calcular posicion del texto (en el medio del arco)
            const midAngle = ((startAngle + endAngle) / 2 - 90) * (Math.PI / 180);
            const textRadius = radius * 0.6;
            const textX = centerX + textRadius * Math.cos(midAngle);
            const textY = centerY + textRadius * Math.sin(midAngle);
            const textRotation = (startAngle + endAngle) / 2;

            // Truncar nombre si es muy largo
            const displayName = cosa.nombre.length > 8
              ? cosa.nombre.substring(0, 7) + '..'
              : cosa.nombre;

            return (
              <G key={cosa.id}>
                <Path d={pathData} fill={color} />
                <SvgText
                  x={textX}
                  y={textY}
                  fill="#fff"
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                >
                  {displayName}
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    );
  };

  const spin = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🎰</Text>
          <Text style={styles.headerTitle}>LA RIFA DEL NEGRO</Text>
          <Text style={styles.headerSubtitle}>
            {cosasDisponibles.length} de {cosas.length} cosas disponibles
          </Text>

          {/* Boton Ver Ultima Rifa */}
          <TouchableOpacity
            style={styles.verUltimaBtn}
            onPress={handleVerUltimaRifa}
            disabled={cargandoUltima}
          >
            {cargandoUltima ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.verUltimaBtnEmoji}>📜</Text>
                <Text style={styles.verUltimaBtnText}>VER ULTIMA RIFA GUARDADA</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Seccion: Lista de Cosas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 LISTA DE COSAS</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalAgregar(true)}
              disabled={cosas.length >= 30}
            >
              <Text style={styles.addButtonText}>+ AGREGAR</Text>
            </TouchableOpacity>
          </View>

          {cosas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No hay cosas en la lista</Text>
              <Text style={styles.emptySubtext}>Agrega hasta 30 cosas para rifar</Text>
            </View>
          ) : (
            <View style={styles.cosasGrid}>
              {cosas.map((cosa, index) => (
                <View
                  key={cosa.id}
                  style={[
                    styles.cosaItem,
                    !cosa.disponible && styles.cosaItemUsada,
                  ]}
                >
                  <View
                    style={[
                      styles.cosaColor,
                      { backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] },
                      !cosa.disponible && styles.cosaColorUsada,
                    ]}
                  />
                  <Text
                    style={[
                      styles.cosaNombre,
                      !cosa.disponible && styles.cosaNombreUsada,
                    ]}
                    numberOfLines={1}
                  >
                    {cosa.nombre}
                  </Text>
                  <View style={styles.cosaActions}>
                    <TouchableOpacity
                      style={styles.cosaActionBtn}
                      onPress={() => abrirEdicion(cosa)}
                    >
                      <Text style={styles.cosaActionText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.cosaActionBtn, styles.cosaDeleteBtn]}
                      onPress={() => handleEliminarCosa(cosa)}
                    >
                      <Text style={styles.cosaActionText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Seccion: Ruleta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitleCenter}>🎡 RULETA</Text>

          <View style={styles.wheelContainer}>
            {/* Indicador/Flecha */}
            <View style={styles.wheelPointer}>
              <Text style={styles.wheelPointerText}>▼</Text>
            </View>

            {/* Ruleta */}
            <Animated.View
              style={[
                styles.wheel,
                {
                  transform: [{ rotate: spin }],
                },
              ]}
            >
              {cosasDisponibles.length > 0 ? (
                renderWheelSVG()
              ) : (
                <View style={styles.wheelEmpty}>
                  <Text style={styles.wheelEmptyText}>SIN COSAS</Text>
                </View>
              )}
            </Animated.View>

            {/* Centro de la ruleta */}
            <View style={styles.wheelCenter}>
              <Text style={styles.wheelCenterText}>🎯</Text>
            </View>
          </View>

          {/* Boton girar */}
          <TouchableOpacity
            style={[
              styles.spinButton,
              (girando || cosasDisponibles.length === 0) && styles.spinButtonDisabled,
            ]}
            onPress={girarRuleta}
            disabled={girando || cosasDisponibles.length === 0}
          >
            <Text style={styles.spinButtonText}>
              {girando ? '🌀 GIRANDO...' : '🎰 GIRAR RULETA'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seccion: Resultados */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 RESULTADOS</Text>
            {resultados.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleLimpiarResultados}
              >
                <Text style={styles.clearButtonText}>LIMPIAR</Text>
              </TouchableOpacity>
            )}
          </View>

          {resultados.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🎲</Text>
              <Text style={styles.emptyText}>Sin resultados aun</Text>
              <Text style={styles.emptySubtext}>Gira la ruleta para asignar cosas</Text>
            </View>
          ) : (
            <View style={styles.resultadosTable}>
              <View style={styles.resultadosHeader}>
                <Text style={[styles.resultadoCell, styles.resultadoCellJugador]}>JUGADOR</Text>
                <Text style={[styles.resultadoCell, styles.resultadoCellCosa]}>LE TOCO</Text>
              </View>
              {resultados.map((resultado) => (
                <View key={resultado.id} style={styles.resultadoRow}>
                  <Text style={[styles.resultadoCell, styles.resultadoCellJugador, styles.resultadoJugador]}>
                    {resultado.jugador}
                  </Text>
                  <Text style={[styles.resultadoCell, styles.resultadoCellCosa, styles.resultadoCosa]}>
                    {resultado.cosa}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Botones de accion finales */}
        {cosas.some(c => !c.disponible) && (
          <View style={styles.actionButtonsContainer}>
            {/* Boton Reiniciar */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReiniciar}
            >
              <Text style={styles.resetButtonText}>🔄 REINICIAR RIFA</Text>
              <Text style={styles.resetButtonSubtext}>
                Poner todas las cosas disponibles
              </Text>
            </TouchableOpacity>

            {/* Boton Dojo Terminado */}
            <TouchableOpacity
              style={[styles.finishButton, guardando && styles.finishButtonDisabled]}
              onPress={handleGuardarRifa}
              disabled={guardando || resultados.length === 0}
            >
              {guardando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.finishButtonText}>✅ DOJO TERMINADO</Text>
                  <Text style={styles.finishButtonSubtext}>
                    Guardar rifa en el servidor
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal: Agregar Cosa */}
      <Modal
        visible={modalAgregar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalAgregar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ AGREGAR COSA</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalAgregar(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>NOMBRE:</Text>
              <TextInput
                style={styles.textInput}
                value={nuevaCosa}
                onChangeText={setNuevaCosa}
                placeholder="Ej: LAVAR TRASTES"
                placeholderTextColor="#888"
                autoCapitalize="characters"
                maxLength={30}
              />
              <Text style={styles.inputHint}>
                {cosas.length}/30 cosas en la lista
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAgregarCosa}
              >
                <Text style={styles.modalButtonText}>AGREGAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Cosa */}
      <Modal
        visible={modalEditar}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ EDITAR COSA</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalEditar(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>NOMBRE:</Text>
              <TextInput
                style={styles.textInput}
                value={nombreEditado}
                onChangeText={setNombreEditado}
                autoCapitalize="characters"
                maxLength={30}
              />

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleEditarCosa}
              >
                <Text style={styles.modalButtonText}>GUARDAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Seleccionar Jugador */}
      <Modal
        visible={modalJugador}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalJugador(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderWinner}>
              <Text style={styles.winnerEmoji}>🎉</Text>
              <Text style={styles.winnerTitle}>¡SALIO!</Text>
              <Text style={styles.winnerCosa}>{cosaGanadora?.nombre}</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.selectLabel}>¿A QUIEN LE TOCA?</Text>

              <View style={styles.jugadoresGrid}>
                {usuarios.map((usuario) => (
                  <TouchableOpacity
                    key={usuario._id}
                    style={styles.jugadorBtn}
                    onPress={() => asignarAJugador(usuario.nombre)}
                  >
                    <Text style={styles.jugadorBtnText}>{usuario.nombre}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalJugador(false);
                  setCosaGanadora(null);
                }}
              >
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Ver Ultima Rifa */}
      <Modal
        visible={modalUltimaRifa}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalUltimaRifa(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderUltima}>
              <Text style={styles.ultimaEmoji}>📜</Text>
              <Text style={styles.ultimaTitle}>ULTIMA RIFA GUARDADA</Text>
              {ultimaRifa && (
                <Text style={styles.ultimaFecha}>
                  {new Date(ultimaRifa.fechaCreacion).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              )}
            </View>

            <View style={styles.modalBody}>
              {ultimaRifa && ultimaRifa.resultados.length > 0 ? (
                <View style={styles.ultimaResultados}>
                  <View style={styles.resultadosHeader}>
                    <Text style={[styles.resultadoCell, styles.resultadoCellJugador]}>JUGADOR</Text>
                    <Text style={[styles.resultadoCell, styles.resultadoCellCosa]}>LE TOCO</Text>
                  </View>
                  {ultimaRifa.resultados.map((resultado, index) => (
                    <View key={index} style={styles.resultadoRow}>
                      <Text style={[styles.resultadoCell, styles.resultadoCellJugador, styles.resultadoJugador]}>
                        {resultado.jugador}
                      </Text>
                      <Text style={[styles.resultadoCell, styles.resultadoCellCosa, styles.resultadoCosa]}>
                        {resultado.cosa}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>Sin resultados</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalUltimaRifa(false)}
              >
                <Text style={styles.cancelButtonText}>CERRAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0d',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 4,
    borderBottomColor: SmashColors.gold,
  },
  headerEmoji: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: SmashColors.gold,
    letterSpacing: 3,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 12,
    color: SmashColors.textSecondary,
    marginTop: 4,
  },
  verUltimaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    borderWidth: 2,
    borderColor: '#555',
  },
  verUltimaBtnEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  verUltimaBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#252525',
    borderBottomWidth: 3,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: SmashColors.textWhite,
    letterSpacing: 2,
  },
  sectionTitleCenter: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SmashColors.textWhite,
    letterSpacing: 2,
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#252525',
    borderBottomWidth: 3,
    borderBottomColor: '#333',
  },
  addButton: {
    backgroundColor: '#43b047',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#2d5a2e',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: SmashColors.textWhite,
    fontWeight: 'bold',
  },
  emptySubtext: {
    fontSize: 12,
    color: SmashColors.textSecondary,
    marginTop: 4,
  },
  cosasGrid: {
    padding: 8,
  },
  cosaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#252525',
    padding: 10,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#444',
  },
  cosaItemUsada: {
    opacity: 0.5,
    borderStyle: 'dashed',
  },
  cosaColor: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  cosaColorUsada: {
    backgroundColor: '#666',
  },
  cosaNombre: {
    flex: 1,
    fontSize: 14,
    color: SmashColors.textWhite,
    fontWeight: 'bold',
  },
  cosaNombreUsada: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  cosaActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cosaActionBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  cosaDeleteBtn: {
    backgroundColor: '#4a1a1a',
    borderColor: '#8b0000',
  },
  cosaActionText: {
    fontSize: 14,
  },
  // Ruleta
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  wheelPointer: {
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  wheelPointerText: {
    fontSize: 30,
    color: SmashColors.gold,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    backgroundColor: '#2d2d2d',
    overflow: 'hidden',
    borderWidth: 6,
    borderColor: SmashColors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelEmptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wheelCenter: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: SmashColors.gold,
  },
  wheelCenterText: {
    fontSize: 20,
  },
  spinButton: {
    backgroundColor: '#e52521',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#8b0000',
  },
  spinButtonDisabled: {
    backgroundColor: '#444',
    borderColor: '#333',
  },
  spinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  // Resultados
  clearButton: {
    backgroundColor: '#4a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#8b0000',
  },
  clearButtonText: {
    color: '#ff6666',
    fontSize: 12,
    fontWeight: 'bold',
  },
  resultadosTable: {
    borderTopWidth: 0,
  },
  resultadosHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#444',
  },
  resultadoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  resultadoCell: {
    padding: 12,
    fontSize: 14,
    color: SmashColors.textWhite,
  },
  resultadoCellJugador: {
    flex: 1,
    fontWeight: 'bold',
  },
  resultadoCellCosa: {
    flex: 2,
  },
  resultadoJugador: {
    color: SmashColors.gold,
  },
  resultadoCosa: {
    color: SmashColors.textSecondary,
  },
  // Botones de accion
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1a3a1a',
    padding: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#43b047',
  },
  resetButtonText: {
    color: '#43b047',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resetButtonSubtext: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  finishButton: {
    flex: 1,
    backgroundColor: '#1a2a4a',
    padding: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#049cd8',
  },
  finishButtonDisabled: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  finishButtonText: {
    color: '#049cd8',
    fontSize: 14,
    fontWeight: 'bold',
  },
  finishButtonSubtext: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderWidth: 4,
    borderColor: SmashColors.gold,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: '#252525',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#333',
  },
  modalHeaderWinner: {
    backgroundColor: '#43b047',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#2d5a2e',
  },
  modalHeaderUltima: {
    backgroundColor: '#333',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#444',
  },
  modalTitle: {
    color: SmashColors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalClose: {
    width: 36,
    height: 36,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    color: SmashColors.gold,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#252525',
    borderWidth: 3,
    borderColor: '#444',
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  inputHint: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  modalButton: {
    backgroundColor: '#43b047',
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 3,
    borderColor: '#2d5a2e',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  winnerEmoji: {
    fontSize: 50,
  },
  winnerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  winnerCosa: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fbd000',
    marginTop: 8,
    textAlign: 'center',
  },
  selectLabel: {
    color: SmashColors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  jugadoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  jugadorBtn: {
    backgroundColor: '#e52521',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: '#8b0000',
    minWidth: 100,
    alignItems: 'center',
  },
  jugadorBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#333',
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#555',
  },
  cancelButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Ultima rifa modal
  ultimaEmoji: {
    fontSize: 40,
  },
  ultimaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: SmashColors.gold,
    marginTop: 8,
    letterSpacing: 2,
  },
  ultimaFecha: {
    fontSize: 12,
    color: SmashColors.textSecondary,
    marginTop: 4,
  },
  ultimaResultados: {
    borderWidth: 2,
    borderColor: '#333',
  },
});
