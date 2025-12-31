import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Image,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TetrisGame } from '@/components/games';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import FormularioPuntos from '@/components/FormularioPuntos';
import Avatar8Bit, { AVATARES_DISPONIBLES } from '@/components/Avatar8Bit';
import PasswordModal from '@/components/PasswordModal';
import { SmashColors } from '@/constants/theme';
import * as api from '@/services/api';
import { Usuario, AvatarId, RegistroSemanal, HistorialSemana } from '@/types';

// Colores tema Mario/Yoshi
const MarioColors = {
  red: '#e52521',
  blue: '#049cd8',
  yellow: '#fbd000',
  green: '#43b047',
  white: '#ffffff',
  brown: '#5c3c0d',
};

// Key para AsyncStorage
const CONTEO_STORAGE_KEY = 'conteo_semanal_puntos';


export default function ConteoScreen() {
  const router = useRouter();
  const { usuarios, refreshUsuarios, loading } = useApp();
  const [puntosUsuarios, setPuntosUsuarios] = useState<{
    [key: string]: {
      dojos: number;
      pendejos: number;
      mimidos: number;
      castitontos: number;
      chescos: number;
    };
  }>({});
  const [guardando, setGuardando] = useState(false);
  const [semana, setSemana] = useState(() => {
    const hoy = new Date();
    const inicioAno = new Date(hoy.getFullYear(), 0, 1);
    const dias = Math.floor((hoy.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000));
    return `${hoy.getFullYear()}-S${Math.ceil((dias + 1) / 7)}`;
  });

  // Estados para modales
  const [modalNuevoUsuario, setModalNuevoUsuario] = useState(false);
  const [modalGestionUsuarios, setModalGestionUsuarios] = useState(false);
  const [modalEditarUsuario, setModalEditarUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  // Estados para nuevo usuario
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState<AvatarId>('mario');
  const [creandoUsuario, setCreandoUsuario] = useState(false);

  // Estados para editar usuario
  const [avatarSeleccionado, setAvatarSeleccionado] = useState<AvatarId>('mario');
  const [fotoPersonalizada, setFotoPersonalizada] = useState<string | null>(null);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Estados para historial de semanas
  const [historialSemanas, setHistorialSemanas] = useState<RegistroSemanal[]>([]);

  // Estados para modal de historial completo
  const [modalHistorial, setModalHistorial] = useState(false);
  const [historialCompleto, setHistorialCompleto] = useState<HistorialSemana[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [semanaExpandida, setSemanaExpandida] = useState<string | null>(null);

  // Estados para modal de ganadores anuales
  const [modalGanadores, setModalGanadores] = useState(false);
  const [anioExpandido, setAnioExpandido] = useState<string | null>('2025');

  // Datos de ganadores por año (datos estáticos)
  const ganadoresAnuales: { [anio: string]: { categoria: string; emoji: string; ganador: string }[] } = {
    '2024': [
      { categoria: 'DOJO', emoji: '🏆', ganador: 'FANO' },
      { categoria: 'PENDEJO', emoji: '🧢', ganador: 'MIKEY BLANCO' },
      { categoria: 'MIMIDO', emoji: '🛏️', ganador: 'MIKEY NEGRO' },
      { categoria: 'CHESCOS', emoji: '🥤', ganador: 'CHINO' },
      { categoria: 'CAMPEÓN GENERAL', emoji: '👑', ganador: 'FANO' },
    ],
    '2025': [
      { categoria: 'DOJO', emoji: '🏆', ganador: 'FANO' },
      { categoria: 'PENDEJO', emoji: '🧢', ganador: 'MIKEY BLANCO' },
      { categoria: 'MIMIDO', emoji: '🛏️', ganador: 'CHINO' },
      { categoria: 'CASTITONTO', emoji: '🤡', ganador: 'MIKEY BLANCO' },
      { categoria: 'CHESCOS', emoji: '🥤', ganador: 'FANO' },
      { categoria: 'CAMPEÓN GENERAL', emoji: '👑', ganador: 'FANO' },
    ],
  };

  // Estados para edición de registro
  const [modalEditarRegistro, setModalEditarRegistro] = useState(false);
  const [registroEditando, setRegistroEditando] = useState<RegistroSemanal | null>(null);
  const [valoresEdicion, setValoresEdicion] = useState({
    dojos: 0,
    pendejos: 0,
    mimidos: 0,
    castitontos: 0,
    chescos: 0,
  });
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [showPasswordModalEdicion, setShowPasswordModalEdicion] = useState(false);

  // Easter egg: Tetris - Long press 5 segundos
  const [showTetris, setShowTetris] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado para modal de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handlePipeGesture = {
    onPressIn: () => {
      longPressTimerRef.current = setTimeout(() => {
        setShowTetris(true);
      }, 5000);
    },
    onPressOut: () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    },
  };

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const cargarDatosGuardados = async () => {
      try {
        const datosGuardados = await AsyncStorage.getItem(CONTEO_STORAGE_KEY);
        if (datosGuardados) {
          const parsed = JSON.parse(datosGuardados);
          // Solo cargar si es de la misma semana
          if (parsed.semana === semana && parsed.puntos) {
            setPuntosUsuarios(parsed.puntos);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos guardados:', error);
      }
    };
    cargarDatosGuardados();
  }, [semana]);

  // Cargar historial de las últimas 2 semanas
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const historial = await api.getUltimasDosSemanas();
        setHistorialSemanas(historial);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    };
    cargarHistorial();
  }, []);

  // Guardar datos cuando cambien los puntos
  const guardarDatosLocal = useCallback(async (puntos: typeof puntosUsuarios) => {
    try {
      await AsyncStorage.setItem(CONTEO_STORAGE_KEY, JSON.stringify({
        semana,
        puntos,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error al guardar datos localmente:', error);
    }
  }, [semana]);

  const handlePuntosChange = (
    usuarioId: string,
    puntos: {
      dojos: number;
      pendejos: number;
      mimidos: number;
      castitontos: number;
      chescos: number;
    }
  ) => {
    setPuntosUsuarios((prev) => ({
      ...prev,
      [usuarioId]: puntos,
    }));
  };

  const handleGuardar = () => {
    const registros = Object.entries(puntosUsuarios)
      .filter(([_, puntos]) => {
        return (
          puntos.dojos !== 0 ||
          puntos.pendejos !== 0 ||
          puntos.mimidos !== 0 ||
          puntos.castitontos !== 0 ||
          puntos.chescos !== 0
        );
      })
      .map(([usuarioId, puntos]) => ({
        usuarioId,
        ...puntos,
      }));

    if (registros.length === 0) {
      Alert.alert('Sin cambios', 'No hay puntos para registrar');
      return;
    }

    // Mostrar modal de contraseña
    setShowPasswordModal(true);
  };

  const handleGuardarConfirmado = async () => {
    const registros = Object.entries(puntosUsuarios)
      .filter(([_, puntos]) => {
        return (
          puntos.dojos !== 0 ||
          puntos.pendejos !== 0 ||
          puntos.mimidos !== 0 ||
          puntos.castitontos !== 0 ||
          puntos.chescos !== 0
        );
      })
      .map(([usuarioId, puntos]) => ({
        usuarioId,
        ...puntos,
      }));

    // Validar que los usuarios con dojos no hayan registrado ya en esta semana
    const usuariosConDojos = registros.filter(r => r.dojos && r.dojos > 0);
    if (usuariosConDojos.length > 0) {
      // Verificar si alguno ya tiene registro de dojos esta semana
      for (const registro of usuariosConDojos) {
        const yaRegistrado = historialSemanas.some(h => {
          const usuarioId = typeof h.usuario === 'string' ? h.usuario : h.usuario._id;
          return usuarioId === registro.usuarioId && 
                 h.semana === semana && 
                 h.dojos && h.dojos > 0;
        });
        
        if (yaRegistrado) {
          const usuario = usuarios.find(u => u._id === registro.usuarioId);
          Alert.alert(
            '⚠️ ATENCION',
            `${usuario?.nombre || 'El usuario'} ya tiene dojos registrados en la semana ${semana}. No se puede registrar dojos más de una vez por semana.`
          );
          return;
        }
      }
    }

    setGuardando(true);
    try {
      await api.registrarConteoBatch(semana, registros);
      await refreshUsuarios();
      setPuntosUsuarios({});
      // Limpiar datos guardados localmente después de enviar exitosamente
      await AsyncStorage.removeItem(CONTEO_STORAGE_KEY);
      // Recargar historial
      const historial = await api.getUltimasDosSemanas();
      setHistorialSemanas(historial);
      Alert.alert(
        'COMPLETE!',
        `Se registraron ${registros.length} conteos para la semana ${semana}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearUsuario = async () => {
    if (!nuevoNombre.trim()) {
      Alert.alert('Error', 'Ingresa un nombre para el usuario');
      return;
    }

    setCreandoUsuario(true);
    try {
      await api.crearUsuario({
        nombre: nuevoNombre.trim().toUpperCase(),
        dojos: 0,
        pendejos: 0,
        mimidos: 0,
        castitontos: 0,
        chescos: 0,
        deuda: 0,
        avatar: nuevoAvatar,
      });
      await refreshUsuarios();
      setNuevoNombre('');
      setNuevoAvatar('mario');
      setModalNuevoUsuario(false);
      Alert.alert('1-UP!', `Usuario ${nuevoNombre.toUpperCase()} creado exitosamente`);
    } catch (error) {
      Alert.alert('Game Over', error instanceof Error ? error.message : 'Error al crear usuario');
    } finally {
      setCreandoUsuario(false);
    }
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setAvatarSeleccionado(usuario.avatar || 'mario');
    setFotoPersonalizada(usuario.fotoUrl || null);
    setModalEditarUsuario(true);
  };

  const handleSeleccionarFoto = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galeria para seleccionar una foto');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!resultado.canceled && resultado.assets[0]) {
      setFotoPersonalizada(resultado.assets[0].uri);
    }
  };

  const handleGuardarPerfil = async () => {
    if (!usuarioEditando) return;

    setGuardandoPerfil(true);
    try {
      // Si hay foto nueva seleccionada (URI local), subirla al servidor
      if (fotoPersonalizada && fotoPersonalizada.startsWith('file://')) {
        await api.subirFotoPerfil(usuarioEditando._id, fotoPersonalizada);
      } else if (!fotoPersonalizada && usuarioEditando.fotoUrl) {
        // Si se quitó la foto, eliminarla del servidor
        await api.eliminarFotoPerfil(usuarioEditando._id);
      }

      // Actualizar avatar
      await api.actualizarUsuario(usuarioEditando._id, {
        avatar: avatarSeleccionado,
      });

      await refreshUsuarios();
      Alert.alert('1-UP!', `Perfil de ${usuarioEditando.nombre} actualizado`);
      setModalEditarUsuario(false);
      setUsuarioEditando(null);
    } catch (error) {
      Alert.alert('Game Over', error instanceof Error ? error.message : 'No se pudo actualizar el perfil');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const handleEliminarUsuario = async (usuario: Usuario) => {
    Alert.alert(
      'Eliminar Usuario',
      `¿Seguro que quieres eliminar a ${usuario.nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.eliminarUsuario(usuario._id);
              await refreshUsuarios();
              Alert.alert('Eliminado', `${usuario.nombre} fue eliminado`);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          },
        },
      ]
    );
  };

  // Funciones para historial completo
  const handleAbrirHistorial = async () => {
    setModalHistorial(true);
    setCargandoHistorial(true);
    try {
      const historial = await api.getHistorialCompleto();
      setHistorialCompleto(historial);
      if (historial.length > 0) {
        setSemanaExpandida(historial[0].semana);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setCargandoHistorial(false);
    }
  };

  const handleEditarRegistro = (registro: RegistroSemanal) => {
    // Primero cerrar el modal de historial
    setModalHistorial(false);

    // Luego configurar los datos del registro a editar
    setRegistroEditando(registro);
    setValoresEdicion({
      dojos: registro.dojos,
      pendejos: registro.pendejos,
      mimidos: registro.mimidos,
      castitontos: registro.castitontos,
      chescos: registro.chescos,
    });

    // Asegurar que el modal de password no esté abierto
    setShowPasswordModalEdicion(false);

    // Abrir el modal de edición después de que se cierre el historial
    setTimeout(() => {
      setModalEditarRegistro(true);
    }, 200);
  };

  const handleConfirmarEdicion = () => {
    setShowPasswordModalEdicion(true);
  };

  const handleGuardarEdicion = async () => {
    if (!registroEditando) return;

    setGuardandoEdicion(true);
    try {
      await api.editarRegistroSemanal(registroEditando._id, valoresEdicion);
      await refreshUsuarios();

      // Recargar historial
      const historial = await api.getHistorialCompleto();
      setHistorialCompleto(historial);
      const historialReciente = await api.getUltimasDosSemanas();
      setHistorialSemanas(historialReciente);

      // Primero cerrar el modal de edición
      setModalEditarRegistro(false);
      setRegistroEditando(null);
      setGuardandoEdicion(false);

      // Mostrar alerta y luego reabrir historial
      Alert.alert('COMPLETE!', 'Registro actualizado exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            setTimeout(() => setModalHistorial(true), 150);
          }
        }
      ]);
    } catch (error) {
      setGuardandoEdicion(false);
      Alert.alert('Error', error instanceof Error ? error.message : 'No se pudo actualizar');
    }
  };

  const handleCerrarEdicion = () => {
    // Asegurar que el modal de contraseña también se cierre
    setShowPasswordModalEdicion(false);
    setModalEditarRegistro(false);
    setRegistroEditando(null);
    // Volver a abrir el historial
    setTimeout(() => setModalHistorial(true), 200);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MarioColors.red} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header compacto con tema Mario */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>CONTEO</Text>
            <Text style={styles.subtitle}>{semana}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalNuevoUsuario(true)}
            >
              <Text style={styles.actionButtonEmoji}>➕</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.historialButton]}
              onPress={handleAbrirHistorial}
            >
              <Text style={styles.actionButtonEmoji}>📜</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.tablaButton]}
              onPress={() => router.push('/(tabs)/tabla')}
            >
              <Text style={styles.actionButtonEmoji}>📊</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.podioButton]}
              onPress={() => setModalGanadores(true)}
            >
              <Text style={styles.actionButtonEmoji}>🏅</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setModalGestionUsuarios(true)}
            >
              <Text style={styles.actionButtonEmoji}>👥</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {usuarios.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🍄</Text>
            <Text style={styles.emptyText}>No hay integrantes registrados</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setModalNuevoUsuario(true)}
            >
              <Text style={styles.emptyButtonText}>+ AGREGAR USUARIO</Text>
            </TouchableOpacity>
          </View>
        ) : (
          usuarios.map((usuario) => (
            <FormularioPuntos
              key={usuario._id}
              nombreUsuario={usuario.nombre}
              avatar={usuario.avatar}
              fotoUrl={usuario.fotoUrl}
              valoresIniciales={puntosUsuarios[usuario._id] || {
                dojos: 0,
                pendejos: 0,
                mimidos: 0,
                castitontos: 0,
                chescos: 0,
              }}
              onChange={(puntos) => handlePuntosChange(usuario._id, puntos)}
              theme="mario"
            />
          ))
        )}

        {/* Tabla de Historial de Semanas */}
        {historialSemanas.length > 0 && (
          <View style={styles.historialContainer}>
            <View style={styles.historialHeader}>
              <Text style={styles.historialTitle}>📊 HISTORIAL RECIENTE</Text>
            </View>

            {/* Agrupar por semana */}
            {(() => {
              const semanas = [...new Set(historialSemanas.map(r => r.semana))].sort().reverse();
              return semanas.map((sem) => {
                const registrosSemana = historialSemanas.filter(r => r.semana === sem);
                return (
                  <View key={sem} style={styles.semanaBlock}>
                    <View style={styles.semanaHeader}>
                      <Text style={styles.semanaTitle}>{sem}</Text>
                      <Text style={styles.semanaSubtitle}>
                        {sem === semana ? '(Actual)' : '(Anterior)'}
                      </Text>
                    </View>
                    <View style={styles.historialTable}>
                      <View style={styles.historialTableHeader}>
                        <Text style={[styles.historialCell, styles.historialCellNombre]}>Jugador</Text>
                        <Text style={styles.historialCell}>🏆</Text>
                        <Text style={styles.historialCell}>💀</Text>
                        <Text style={styles.historialCell}>😢</Text>
                        <Text style={styles.historialCell}>🤡</Text>
                        <Text style={styles.historialCell}>🥤</Text>
                      </View>
                      {registrosSemana.map((registro) => {
                        const usuarioId = typeof registro.usuario === 'string' ? registro.usuario : registro.usuario._id;
                        const usuario = usuarios.find(u => u._id === usuarioId);
                        return (
                          <View key={registro._id} style={styles.historialTableRow}>
                            <Text style={[styles.historialCell, styles.historialCellNombre]} numberOfLines={1}>
                              {usuario?.nombre || '???'}
                            </Text>
                            <Text style={[styles.historialCell, styles.historialCellValue]}>
                              {registro.dojos || 0}
                            </Text>
                            <Text style={[styles.historialCell, styles.historialCellValue]}>
                              {registro.pendejos || 0}
                            </Text>
                            <Text style={[styles.historialCell, styles.historialCellValue]}>
                              {registro.mimidos || 0}
                            </Text>
                            <Text style={[styles.historialCell, styles.historialCellValue]}>
                              {registro.castitontos || 0}
                            </Text>
                            <Text style={[styles.historialCell, styles.historialCellValue]}>
                              {registro.chescos || 0}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        )}
      </ScrollView>

      {/* Tuberia boton guardar - Easter egg: Long press + swipe up = Tetris */}
      <TouchableOpacity
        style={[styles.pipeButton, guardando && styles.pipeButtonDisabled]}
        onPress={handleGuardar}
        disabled={guardando}
        activeOpacity={0.8}
        {...handlePipeGesture}
      >
        <View style={styles.pipeTop}>
          <Text style={styles.pipeButtonText}>
            {guardando ? '...' : 'GUARDAR'}
          </Text>
        </View>
        <View style={styles.pipeBody}>
          <Text style={styles.pipeButtonEmoji}>{guardando ? '⏳' : '💾'}</Text>
        </View>
      </TouchableOpacity>

      {/* Tetris Game Easter Egg */}
      <TetrisGame visible={showTetris} onClose={() => setShowTetris(false)} />

      {/* Modal: Nuevo Usuario */}
      <Modal
        visible={modalNuevoUsuario}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalNuevoUsuario(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🍄 NUEVO JUGADOR</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalNuevoUsuario(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>NOMBRE:</Text>
              <TextInput
                style={styles.textInput}
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Ej: MARIO"
                placeholderTextColor="#888"
                autoCapitalize="characters"
              />

              <Text style={styles.inputLabel}>AVATAR 8-BIT:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.avatarGrid}>
                  {AVATARES_DISPONIBLES.map((avatar) => (
                    <TouchableOpacity
                      key={avatar.id}
                      style={[
                        styles.avatarOption,
                        nuevoAvatar === avatar.id && styles.avatarOptionSelected,
                      ]}
                      onPress={() => setNuevoAvatar(avatar.id)}
                    >
                      <Avatar8Bit avatarId={avatar.id} size="small" />
                      <Text style={styles.avatarName}>{avatar.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.createButton, creandoUsuario && styles.createButtonDisabled]}
                onPress={handleCrearUsuario}
                disabled={creandoUsuario}
              >
                <Text style={styles.createButtonText}>
                  {creandoUsuario ? 'CREANDO...' : 'CREAR JUGADOR'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Gestion de Usuarios */}
      <Modal
        visible={modalGestionUsuarios}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalGestionUsuarios(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>👥 JUGADORES</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalGestionUsuarios(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.userList}>
              {usuarios.map((usuario) => (
                <View key={usuario._id} style={styles.userListItem}>
                  <Avatar8Bit
                    avatarId={usuario.avatar || 'mario'}
                    size="medium"
                    fotoUrl={usuario.fotoUrl}
                  />
                  <Text style={styles.userListName}>{usuario.nombre}</Text>
                  <View style={styles.userListActions}>
                    <TouchableOpacity
                      style={styles.userEditButton}
                      onPress={() => {
                        setModalGestionUsuarios(false);
                        handleEditarUsuario(usuario);
                      }}
                    >
                      <Text style={styles.userEditButtonText}>📷</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.userDeleteButton}
                      onPress={() => handleEliminarUsuario(usuario)}
                    >
                      <Text style={styles.userDeleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {usuarios.length === 0 && (
                <Text style={styles.noUsersText}>No hay jugadores registrados</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.addUserButton}
              onPress={() => {
                setModalGestionUsuarios(false);
                setModalNuevoUsuario(true);
              }}
            >
              <Text style={styles.addUserButtonText}>+ AGREGAR JUGADOR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Foto de Perfil */}
      <Modal
        visible={modalEditarUsuario}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEditarUsuario(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📷 EDITAR PERFIL</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalEditarUsuario(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {usuarioEditando && (
                <>
                  <Text style={styles.editingUserName}>{usuarioEditando.nombre}</Text>

                  {/* Vista previa del avatar */}
                  <View style={styles.previewContainer}>
                    {fotoPersonalizada ? (
                      <Image
                        source={{ uri: fotoPersonalizada.startsWith('file://') ? fotoPersonalizada : api.getFotoUrl(fotoPersonalizada) || '' }}
                        style={styles.previewImage}
                      />
                    ) : (
                      <Avatar8Bit
                        avatarId={avatarSeleccionado}
                        size="large"
                      />
                    )}
                  </View>

                  {/* Boton seleccionar foto */}
                  <TouchableOpacity
                    style={styles.selectPhotoButton}
                    onPress={handleSeleccionarFoto}
                  >
                    <Text style={styles.selectPhotoButtonText}>📷 SELECCIONAR FOTO</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>O ELIGE UN AVATAR 8-BIT:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.avatarGrid}>
                      {AVATARES_DISPONIBLES.map((avatar) => (
                        <TouchableOpacity
                          key={avatar.id}
                          style={[
                            styles.avatarOption,
                            avatarSeleccionado === avatar.id && styles.avatarOptionSelected,
                          ]}
                          onPress={() => {
                            setAvatarSeleccionado(avatar.id);
                            setFotoPersonalizada(null);
                          }}
                        >
                          <Avatar8Bit avatarId={avatar.id} size="small" />
                          <Text style={styles.avatarName}>{avatar.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <TouchableOpacity
                    style={[styles.createButton, guardandoPerfil && styles.createButtonDisabled]}
                    onPress={handleGuardarPerfil}
                    disabled={guardandoPerfil}
                  >
                    <Text style={styles.createButtonText}>
                      {guardandoPerfil ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Historial Completo */}
      <Modal
        visible={modalHistorial}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalHistorial(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalHistorialOverlay}>
          <View style={[styles.modalContent, styles.modalHistorialContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📜 HISTORIAL DE GUARDADOS</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalHistorial(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {cargandoHistorial ? (
              <View style={styles.loadingHistorial}>
                <ActivityIndicator size="large" color={MarioColors.yellow} />
                <Text style={styles.loadingHistorialText}>Cargando historial...</Text>
              </View>
            ) : (
              <ScrollView style={styles.historialScroll}>
                {historialCompleto.length === 0 ? (
                  <View style={styles.emptyHistorial}>
                    <Text style={styles.emptyHistorialText}>No hay registros guardados</Text>
                  </View>
                ) : (
                  historialCompleto.map((semanaData) => (
                    <View key={semanaData.semana} style={styles.semanaSection}>
                      <TouchableOpacity
                        style={styles.semanaSectionHeader}
                        onPress={() => setSemanaExpandida(
                          semanaExpandida === semanaData.semana ? null : semanaData.semana
                        )}
                      >
                        <Text style={styles.semanaSectionTitle}>
                          {semanaExpandida === semanaData.semana ? '▼' : '▶'} {semanaData.semana}
                        </Text>
                        <Text style={styles.semanaSectionCount}>
                          {semanaData.registros.length} registro(s)
                        </Text>
                      </TouchableOpacity>

                      {semanaExpandida === semanaData.semana && (
                        <View style={styles.semanaSectionBody}>
                          {semanaData.registros.map((registro) => {
                            const usuarioData = typeof registro.usuario === 'string'
                              ? usuarios.find(u => u._id === registro.usuario)
                              : registro.usuario;
                            return (
                              <View key={registro._id} style={styles.registroItem}>
                                <View style={styles.registroHeader}>
                                  <Text style={styles.registroNombre}>
                                    {usuarioData?.nombre || '???'}
                                  </Text>
                                  <TouchableOpacity
                                    style={styles.editarRegistroBtn}
                                    onPress={() => handleEditarRegistro(registro)}
                                  >
                                    <Text style={styles.editarRegistroBtnText}>✏️</Text>
                                  </TouchableOpacity>
                                </View>
                                <View style={styles.registroValores}>
                                  <Text style={styles.registroValor}>🏆 {registro.dojos}</Text>
                                  <Text style={styles.registroValor}><Text style={styles.emojiRotado}>🧢</Text> {registro.pendejos}</Text>
                                  <Text style={styles.registroValor}>🛏️ {registro.mimidos}</Text>
                                  <Text style={styles.registroValor}>🤡 {registro.castitontos}</Text>
                                  <Text style={styles.registroValor}>🥤 {registro.chescos}</Text>
                                </View>
                                {registro.historialModificaciones && registro.historialModificaciones.length > 0 && (
                                  <Text style={styles.modificacionesCount}>
                                    📝 {registro.historialModificaciones.length} modificación(es)
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Registro */}
      <Modal
        visible={modalEditarRegistro}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCerrarEdicion}
        statusBarTranslucent={true}
      >
        <View style={styles.modalEditarOverlay}>
          <View style={[styles.modalContent, styles.modalEditarContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ EDITAR REGISTRO</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={handleCerrarEdicion}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {registroEditando && (
                <>
                  <Text style={styles.editingUserName}>
                    {typeof registroEditando.usuario === 'string'
                      ? usuarios.find(u => u._id === registroEditando.usuario)?.nombre
                      : registroEditando.usuario.nombre}
                  </Text>
                  <Text style={styles.editingSemana}>{registroEditando.semana}</Text>

                  {/* Modal de contraseña para edición - DENTRO del modal de edición */}
                  <PasswordModal
                    visible={showPasswordModalEdicion}
                    onCancel={() => {
                      setShowPasswordModalEdicion(false);
                    }}
                    onSuccess={() => {
                      setShowPasswordModalEdicion(false);
                      setTimeout(() => {
                        handleGuardarEdicion();
                      }, 100);
                    }}
                    title="🔐 CONFIRMAR EDICIÓN"
                  />

                  <View style={styles.edicionCampos}>
                    {/* DOJOS */}
                    <View style={styles.edicionCampo}>
                      <Text style={styles.edicionLabel}>🏆 DOJOS</Text>
                      <View style={styles.edicionInputRow}>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            dojos: Math.max(0, prev.dojos - 0.5)
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>-.5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            dojos: Math.max(0, prev.dojos - 1)
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.edicionInput}
                          value={valoresEdicion.dojos.toString()}
                          onChangeText={(text) => setValoresEdicion(prev => ({
                            ...prev,
                            dojos: parseFloat(text) || 0
                          }))}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            dojos: prev.dojos + 1
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            dojos: prev.dojos + 0.5
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>+.5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* PENDEJOS */}
                    <View style={styles.edicionCampo}>
                      <Text style={styles.edicionLabel}>🧢 PENDEJOS</Text>
                      <View style={styles.edicionInputRow}>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            pendejos: Math.max(0, prev.pendejos - 0.5)
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>-.5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            pendejos: Math.max(0, prev.pendejos - 1)
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.edicionInput}
                          value={valoresEdicion.pendejos.toString()}
                          onChangeText={(text) => setValoresEdicion(prev => ({
                            ...prev,
                            pendejos: parseFloat(text) || 0
                          }))}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            pendejos: prev.pendejos + 1
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            pendejos: prev.pendejos + 0.5
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>+.5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* MIMIDOS */}
                    <View style={styles.edicionCampo}>
                      <Text style={styles.edicionLabel}>🛏️ MIMIDOS</Text>
                      <View style={styles.edicionInputRow}>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            mimidos: Math.max(0, prev.mimidos - 0.5)
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>-.5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            mimidos: Math.max(0, prev.mimidos - 1)
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.edicionInput}
                          value={valoresEdicion.mimidos.toString()}
                          onChangeText={(text) => setValoresEdicion(prev => ({
                            ...prev,
                            mimidos: parseFloat(text) || 0
                          }))}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            mimidos: prev.mimidos + 1
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            mimidos: prev.mimidos + 0.5
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>+.5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* CASTITONTOS */}
                    <View style={styles.edicionCampo}>
                      <Text style={styles.edicionLabel}>🤡 CASTITONTOS</Text>
                      <View style={styles.edicionInputRow}>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            castitontos: Math.max(0, prev.castitontos - 0.5)
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>-.5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            castitontos: Math.max(0, prev.castitontos - 1)
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.edicionInput}
                          value={valoresEdicion.castitontos.toString()}
                          onChangeText={(text) => setValoresEdicion(prev => ({
                            ...prev,
                            castitontos: parseFloat(text) || 0
                          }))}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            castitontos: prev.castitontos + 1
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            castitontos: prev.castitontos + 0.5
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>+.5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* CHESCOS */}
                    <View style={styles.edicionCampo}>
                      <Text style={styles.edicionLabel}>🥤 CHESCOS</Text>
                      <View style={styles.edicionInputRow}>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            chescos: Math.max(0, prev.chescos - 0.5)
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>-.5</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            chescos: Math.max(0, prev.chescos - 1)
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>-</Text>
                        </TouchableOpacity>
                        <TextInput
                          style={styles.edicionInput}
                          value={valoresEdicion.chescos.toString()}
                          onChangeText={(text) => setValoresEdicion(prev => ({
                            ...prev,
                            chescos: parseFloat(text) || 0
                          }))}
                          keyboardType="decimal-pad"
                        />
                        <TouchableOpacity
                          style={styles.edicionBtn}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            chescos: prev.chescos + 1
                          }))}
                        >
                          <Text style={styles.edicionBtnText}>+</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.edicionBtn, styles.edicionBtnSmall]}
                          onPress={() => setValoresEdicion(prev => ({
                            ...prev,
                            chescos: prev.chescos + 0.5
                          }))}
                        >
                          <Text style={styles.edicionBtnTextSmall}>+.5</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.createButton, guardandoEdicion && styles.createButtonDisabled]}
                    onPress={handleConfirmarEdicion}
                    disabled={guardandoEdicion}
                  >
                    <Text style={styles.createButtonText}>
                      {guardandoEdicion ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Ganadores Anuales */}
      <Modal
        visible={modalGanadores}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalGanadores(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modalGanadoresOverlay}>
          <View style={[styles.modalContent, styles.modalGanadoresContent]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏅 HALL DE LA FAMA</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setModalGanadores(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.ganadoresScroll}>
              {Object.keys(ganadoresAnuales).sort().reverse().map((anio) => (
                <View key={anio} style={styles.anioSection}>
                  <TouchableOpacity
                    style={styles.anioSectionHeader}
                    onPress={() => setAnioExpandido(
                      anioExpandido === anio ? null : anio
                    )}
                  >
                    <Text style={styles.anioSectionTitle}>
                      {anioExpandido === anio ? '▼' : '▶'} {anio}
                    </Text>
                    <Text style={styles.anioSectionIcon}>🏆</Text>
                  </TouchableOpacity>

                  {anioExpandido === anio && (
                    <View style={styles.anioSectionBody}>
                      <View style={styles.ganadoresTable}>
                        <View style={styles.ganadoresTableHeader}>
                          <Text style={[styles.ganadoresCell, styles.ganadoresCellCategoria]}>CATEGORÍA</Text>
                          <Text style={[styles.ganadoresCell, styles.ganadoresCellGanador]}>GANADOR</Text>
                        </View>
                        {ganadoresAnuales[anio].map((item, index) => (
                          <View
                            key={index}
                            style={[
                              styles.ganadoresTableRow,
                              item.categoria === 'CAMPEÓN GENERAL' && styles.ganadoresRowCampeon
                            ]}
                          >
                            <Text style={[styles.ganadoresCell, styles.ganadoresCellCategoria]}>
                              {item.emoji} {item.categoria}
                            </Text>
                            <Text style={[
                              styles.ganadoresCell,
                              styles.ganadoresCellGanador,
                              item.categoria === 'CAMPEÓN GENERAL' && styles.ganadoresCellCampeon
                            ]}>
                              {item.ganador}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Contraseña para guardar */}
      <PasswordModal
        visible={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          handleGuardarConfirmado();
        }}
        title="🔐 AUTORIZACIÓN REQUERIDA"
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MarioColors.blue,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: MarioColors.blue,
  },
  loadingText: {
    color: MarioColors.white,
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    backgroundColor: MarioColors.red,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 3,
    borderBottomColor: MarioColors.brown,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MarioColors.yellow,
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 12,
    color: MarioColors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MarioColors.yellow,
    borderWidth: 2,
    borderColor: MarioColors.brown,
  },
  actionButtonEmoji: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
  },
  emptyText: {
    color: MarioColors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyButton: {
    backgroundColor: MarioColors.green,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 3,
    borderColor: MarioColors.white,
    marginTop: 20,
  },
  emptyButtonText: {
    color: MarioColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  pipeButton: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  pipeButtonDisabled: {
    opacity: 0.6,
  },
  pipeTop: {
    width: 90,
    height: 36,
    backgroundColor: MarioColors.green,
    borderWidth: 4,
    borderColor: '#2d5a2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 0,
    elevation: 8,
  },
  pipeBody: {
    width: 70,
    height: 80,
    backgroundColor: MarioColors.green,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 0,
    borderColor: '#2d5a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pipeButtonText: {
    color: MarioColors.white,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  pipeButtonEmoji: {
    fontSize: 32,
  },
  // Estilos de Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: MarioColors.blue,
    borderWidth: 4,
    borderColor: MarioColors.yellow,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    backgroundColor: MarioColors.red,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: MarioColors.brown,
  },
  modalTitle: {
    color: MarioColors.yellow,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalClose: {
    width: 36,
    height: 36,
    backgroundColor: MarioColors.brown,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MarioColors.yellow,
  },
  modalCloseText: {
    color: MarioColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
  },
  inputLabel: {
    color: MarioColors.yellow,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  textInput: {
    backgroundColor: MarioColors.white,
    borderWidth: 3,
    borderColor: MarioColors.brown,
    padding: 12,
    fontSize: 18,
    fontWeight: 'bold',
    color: MarioColors.brown,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },
  avatarOption: {
    width: 70,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    borderColor: MarioColors.brown,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatarOptionSelected: {
    borderColor: MarioColors.yellow,
    backgroundColor: 'rgba(251,208,0,0.3)',
    borderWidth: 4,
  },
  avatarName: {
    color: MarioColors.white,
    fontSize: 8,
    marginTop: 2,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  createButton: {
    backgroundColor: MarioColors.green,
    padding: 16,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: MarioColors.white,
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#666',
  },
  createButtonText: {
    color: MarioColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  // Lista de usuarios
  userList: {
    maxHeight: 300,
    padding: 16,
  },
  userListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: MarioColors.yellow,
    gap: 12,
  },
  userListName: {
    flex: 1,
    color: MarioColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  userListActions: {
    flexDirection: 'row',
    gap: 8,
  },
  userEditButton: {
    width: 40,
    height: 40,
    backgroundColor: MarioColors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MarioColors.brown,
  },
  userEditButtonText: {
    fontSize: 18,
  },
  userDeleteButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#aa0000',
  },
  userDeleteButtonText: {
    fontSize: 18,
  },
  noUsersText: {
    color: MarioColors.white,
    textAlign: 'center',
    padding: 20,
    opacity: 0.7,
  },
  addUserButton: {
    backgroundColor: MarioColors.green,
    padding: 14,
    alignItems: 'center',
    margin: 16,
    borderWidth: 3,
    borderColor: MarioColors.white,
  },
  addUserButtonText: {
    color: MarioColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Editar perfil
  editingUserName: {
    color: MarioColors.yellow,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: MarioColors.yellow,
  },
  selectPhotoButton: {
    backgroundColor: MarioColors.yellow,
    padding: 14,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: MarioColors.brown,
  },
  selectPhotoButtonText: {
    color: MarioColors.brown,
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Estilos Historial
  historialContainer: {
    marginHorizontal: 12,
    marginTop: 24,
    marginBottom: 80,
  },
  historialHeader: {
    backgroundColor: MarioColors.brown,
    padding: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: MarioColors.yellow,
    borderBottomWidth: 0,
  },
  historialTitle: {
    color: MarioColors.yellow,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  semanaBlock: {
    marginBottom: 12,
  },
  semanaHeader: {
    backgroundColor: MarioColors.red,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: MarioColors.brown,
    borderBottomWidth: 0,
  },
  semanaTitle: {
    color: MarioColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  semanaSubtitle: {
    color: MarioColors.yellow,
    fontSize: 10,
  },
  historialTable: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    borderColor: MarioColors.brown,
  },
  historialTableHeader: {
    flexDirection: 'row',
    backgroundColor: MarioColors.green,
    borderBottomWidth: 2,
    borderBottomColor: MarioColors.brown,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  historialTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  historialCell: {
    flex: 1,
    color: MarioColors.white,
    fontSize: 11,
    textAlign: 'center',
  },
  historialCellNombre: {
    flex: 2,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  historialCellValue: {
    color: MarioColors.yellow,
    fontWeight: 'bold',
  },
  // Estilos del botón de historial
  historialButton: {
    backgroundColor: MarioColors.green,
  },
  tablaButton: {
    backgroundColor: '#2d2d2d',
  },
  // Estilos del modal de historial completo
  modalHistorialContent: {
    flex: 1,
    maxHeight: '100%',
    width: '100%',
    margin: 0,
  },
  modalHistorialOverlay: {
    flex: 1,
    backgroundColor: MarioColors.blue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
  loadingHistorial: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingHistorialText: {
    color: MarioColors.white,
    fontSize: 14,
    marginTop: 12,
  },
  historialScroll: {
    flex: 1,
    padding: 12,
  },
  emptyHistorial: {
    padding: 40,
    alignItems: 'center',
  },
  emptyHistorialText: {
    color: MarioColors.white,
    fontSize: 16,
    opacity: 0.7,
  },
  semanaSection: {
    marginBottom: 12,
  },
  semanaSectionHeader: {
    backgroundColor: MarioColors.red,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: MarioColors.brown,
  },
  semanaSectionTitle: {
    color: MarioColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  semanaSectionCount: {
    color: MarioColors.yellow,
    fontSize: 12,
  },
  semanaSectionBody: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: MarioColors.brown,
    padding: 8,
  },
  registroItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 10,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: MarioColors.yellow,
  },
  registroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  registroNombre: {
    color: MarioColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editarRegistroBtn: {
    width: 36,
    height: 36,
    backgroundColor: MarioColors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MarioColors.brown,
  },
  editarRegistroBtnText: {
    fontSize: 16,
  },
  registroValores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  registroValor: {
    color: MarioColors.white,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emojiRotado: {
    transform: [{ rotate: '180deg' }],
  },
  modificacionesCount: {
    color: MarioColors.yellow,
    fontSize: 10,
    marginTop: 8,
    opacity: 0.8,
  },
  // Estilos del modal de edición
  editingSemana: {
    color: MarioColors.white,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.8,
  },
  edicionCampos: {
    gap: 12,
  },
  edicionCampo: {
    marginBottom: 8,
  },
  edicionLabel: {
    color: MarioColors.yellow,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  edicionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  edicionBtn: {
    width: 40,
    height: 40,
    backgroundColor: MarioColors.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: MarioColors.brown,
  },
  edicionBtnText: {
    color: MarioColors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  edicionInput: {
    flex: 1,
    backgroundColor: MarioColors.white,
    borderWidth: 3,
    borderColor: MarioColors.brown,
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: MarioColors.brown,
    textAlign: 'center',
  },
  edicionBtnSmall: {
    width: 32,
    height: 40,
    backgroundColor: MarioColors.green,
  },
  edicionBtnTextSmall: {
    color: MarioColors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Estilos del modal de editar registro
  modalEditarOverlay: {
    flex: 1,
    backgroundColor: MarioColors.blue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
  modalEditarContent: {
    flex: 1,
    maxHeight: '100%',
    width: '100%',
    margin: 0,
  },
  // Estilos del botón de podio
  podioButton: {
    backgroundColor: '#ffd700',
  },
  // Estilos del modal de ganadores anuales
  modalGanadoresOverlay: {
    flex: 1,
    backgroundColor: MarioColors.blue,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50,
  },
  modalGanadoresContent: {
    flex: 1,
    maxHeight: '100%',
    width: '100%',
    margin: 0,
  },
  ganadoresScroll: {
    flex: 1,
    padding: 12,
  },
  anioSection: {
    marginBottom: 16,
  },
  anioSectionHeader: {
    backgroundColor: '#ffd700',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: MarioColors.brown,
  },
  anioSectionTitle: {
    color: MarioColors.brown,
    fontSize: 20,
    fontWeight: 'bold',
  },
  anioSectionIcon: {
    fontSize: 24,
  },
  anioSectionBody: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 3,
    borderTopWidth: 0,
    borderColor: MarioColors.brown,
    padding: 12,
  },
  ganadoresTable: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: MarioColors.yellow,
  },
  ganadoresTableHeader: {
    flexDirection: 'row',
    backgroundColor: MarioColors.red,
    borderBottomWidth: 2,
    borderBottomColor: MarioColors.brown,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  ganadoresTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  ganadoresRowCampeon: {
    backgroundColor: 'rgba(255,215,0,0.3)',
    borderBottomWidth: 0,
  },
  ganadoresCell: {
    color: MarioColors.white,
    fontSize: 14,
  },
  ganadoresCellCategoria: {
    flex: 1.5,
    fontWeight: 'bold',
  },
  ganadoresCellGanador: {
    flex: 1,
    textAlign: 'right',
    color: MarioColors.yellow,
  },
  ganadoresCellCampeon: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
  },
});
