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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TetrisGame } from '@/components/games';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '@/context/AppContext';
import FormularioPuntos from '@/components/FormularioPuntos';
import Avatar8Bit, { AVATARES_DISPONIBLES } from '@/components/Avatar8Bit';
import { SmashColors } from '@/constants/theme';
import * as api from '@/services/api';
import { Usuario, AvatarId, RegistroSemanal } from '@/types';

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

  // Easter egg: Tetris - Long press 5 segundos
  const [showTetris, setShowTetris] = useState(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePipeGesture = {
    onTouchStart: () => {
      longPressTimerRef.current = setTimeout(() => {
        setShowTetris(true);
      }, 5000);
    },
    onTouchEnd: () => {
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

  const handleGuardar = async () => {
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
      await api.actualizarUsuario(usuarioEditando._id, {
        avatar: avatarSeleccionado,
        fotoUrl: fotoPersonalizada,
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
                        source={{ uri: fotoPersonalizada }}
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
});
