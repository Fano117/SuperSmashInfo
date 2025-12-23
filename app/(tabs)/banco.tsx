import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { SmashColors } from '@/constants/theme';
const YOSHI_BG = require('@/assets/images/yoshi-bg-8bit.png'); // Debes agregar este asset real
import { Transaccion } from '@/types';
import * as api from '@/services/api';
import Avatar8Bit from '@/components/Avatar8Bit';

// Colores tema Yoshi's Island
const YoshiColors = {
  green: '#7cb342',
  lightGreen: '#9ccc65',
  darkGreen: '#558b2f',
  sky: '#81d4fa',
  lightSky: '#b3e5fc',
  white: '#ffffff',
  red: '#ef5350',
  orange: '#ffa726',
  yellow: '#ffee58',
  pink: '#f48fb1',
  brown: '#8d6e63',
  eggWhite: '#fafafa',
  eggSpot: '#66bb6a',
};

const YOSHI_EGG = require('@/assets/images/yoshi-egg-8bit.png');

function YoshiEggJump({ style }: { style?: any }) {
  const jumpAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(jumpAnim, {
          toValue: -30,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [jumpAnim]);

  return (
    <Animated.View style={[{ transform: [{ translateY: jumpAnim }] }, style]}>
      <Image source={YOSHI_EGG} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
    </Animated.View>
  );
}

export default function BancoScreen() {
  const { usuarios, banco, refreshBanco, refreshUsuarios, loading } = useApp();
  const [historial, setHistorial] = useState<Transaccion[]>([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string | null>(null);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const historialData = await api.getHistorialBanco();
      setHistorial(historialData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const handlePago = async () => {
    if (!usuarioSeleccionado || !monto) {
      Alert.alert('Yoshi!', 'Selecciona un jugador y monto');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Yoshi?', 'Monto invalido');
      return;
    }

    setProcesando(true);
    try {
      await api.registrarPago(usuarioSeleccionado, montoNum, descripcion || undefined);
      await Promise.all([refreshBanco(), refreshUsuarios(), cargarDatos()]);
      setMonto('');
      setDescripcion('');
      setUsuarioSeleccionado(null);
      Alert.alert('Yoshi!', 'Pago registrado correctamente');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al registrar pago');
    } finally {
      setProcesando(false);
    }
  };

  if (loading || cargandoDatos) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={YOSHI_EGG} style={styles.loadingEgg} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Patrón de fondo Yoshi */}
      <Image source={require('@/assets/images/yoshi-bg-8bit.png')} style={styles.bgPattern} resizeMode="repeat" />
      {/* Nubes decorativas */}
      <View style={styles.cloudsContainer}>
        <View style={[styles.cloud, styles.cloud1]} />
        <View style={[styles.cloud, styles.cloud2]} />
        <View style={[styles.cloud, styles.cloud3]} />
      </View>

      {/* Header Yoshi */}
      <View style={styles.header}>
        <View style={styles.headerDecor}>
          <YoshiEggJump style={styles.headerEgg} />
          <YoshiEggJump style={styles.headerEgg} />
          <YoshiEggJump style={styles.headerEgg} />
        </View>
        <Text style={styles.title}>BANCO SMASH</Text>
        <Text style={styles.subtitle}>Yoshi's Coin Island</Text>
      </View>

      {/* Huevo gigante - Total del banco */}
      <View style={styles.eggContainer}>
        <Image source={YOSHI_EGG} style={styles.eggImage} />
        <View style={styles.eggContentOverlay}>
          <Text style={styles.eggLabel}>TOTAL</Text>
          <Text style={styles.eggAmount}>${banco?.total?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Seccion de registro de pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🪙</Text>
            <Text style={styles.sectionTitle}>REGISTRAR PAGO</Text>
          </View>

          {/* Selector de usuario estilo huevos */}
          <View style={styles.userSelector}>
            {usuarios.map((usuario) => (
              <TouchableOpacity
                key={usuario._id}
                style={[
                  styles.userEgg,
                  usuarioSeleccionado === usuario._id && styles.userEggSelected,
                ]}
                onPress={() => setUsuarioSeleccionado(usuario._id)}
              >
                <Avatar8Bit
                  avatarId={usuario.avatar || 'yoshi'}
                  size="small"
                  fotoUrl={usuario.fotoUrl}
                />
                <Text style={styles.userEggName}>{usuario.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input de monto */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Monto:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputPrefix}>$</Text>
              <TextInput
                style={styles.input}
                value={monto}
                onChangeText={setMonto}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={YoshiColors.darkGreen}
              />
            </View>
          </View>

          {/* Input de descripcion */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nota:</Text>
            <TextInput
              style={[styles.input, styles.inputWide]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Opcional"
              placeholderTextColor={YoshiColors.darkGreen}
            />
          </View>

          {/* Boton de pago */}
          <TouchableOpacity
            style={[styles.payButton, procesando && styles.payButtonDisabled]}
            onPress={handlePago}
            disabled={procesando}
          >
            <Image source={YOSHI_EGG} style={styles.payButtonEgg} />
            <Text style={styles.payButtonText}>
              {procesando ? 'PROCESANDO...' : 'GUARDAR PAGO'}
            </Text>
            <Image source={YOSHI_EGG} style={styles.payButtonEgg} />
          </TouchableOpacity>
        </View>

        {/* Seccion de deudas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={YOSHI_EGG} style={styles.sectionEgg} />
            <Text style={styles.sectionTitle}>DEUDAS</Text>
          </View>
          <View style={styles.deudasList}>
            {usuarios.map((usuario) => (
              <View key={usuario._id} style={styles.deudaRow}>
                <View style={styles.deudaInfo}>
                  <Avatar8Bit
                    avatarId={usuario.avatar || 'yoshi'}
                    size="small"
                    fotoUrl={usuario.fotoUrl}
                  />
                  <Text style={styles.deudaNombre}>{usuario.nombre}</Text>
                </View>
                <Text
                  style={[
                    styles.deudaMonto,
                    usuario.deuda > 0 && styles.deudaPendiente,
                    usuario.deuda === 0 && styles.deudaPagada,
                  ]}
                >
                  ${usuario.deuda.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Historial de transacciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Image source={YOSHI_EGG} style={styles.sectionEgg} />
            <Text style={styles.sectionTitle}>HISTORIAL</Text>
          </View>
          <View style={styles.historialList}>
            {historial.length === 0 ? (
              <View style={styles.emptyState}>
                <Image source={YOSHI_EGG} style={styles.emptyEgg} />
                <Text style={styles.emptyText}>Sin transacciones</Text>
              </View>
            ) : (
              historial.slice(0, 10).map((trans) => {
                const usuarioObj = typeof trans.usuario === 'object' ? trans.usuario : null;
                const usuarioNombre = usuarioObj ? usuarioObj.nombre : 'Usuario';
                const fecha = trans.createdAt
                  ? new Date(trans.createdAt).toLocaleDateString()
                  : '';
                return (
                  <View key={trans._id} style={styles.historialRow}>
                    <View style={styles.historialAvatar}>
                      <Avatar8Bit
                        avatarId={usuarioObj?.avatar || 'yoshi'}
                        size="small"
                        fotoUrl={usuarioObj?.fotoUrl}
                      />
                    </View>
                    <View style={styles.historialInfo}>
                      <Text style={styles.historialNombre}>{usuarioNombre}</Text>
                      <Text style={styles.historialFecha}>{fecha}</Text>
                      {trans.descripcion && (
                        <Text style={styles.historialDesc}>{trans.descripcion}</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.historialMonto,
                        trans.tipo === 'pago' && styles.montoPago,
                        trans.tipo === 'retiro' && styles.montoRetiro,
                      ]}
                    >
                      {trans.tipo === 'pago' ? '+' : '-'}${trans.monto.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Colinas decorativas */}
      <View style={styles.hillsContainer}>
        <View style={[styles.hill, styles.hill1]} />
        <View style={[styles.hill, styles.hill2]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    loadingEgg: {
      width: 60,
      height: 60,
      marginBottom: 8,
      resizeMode: 'contain',
    },
    headerEgg: {
      width: 32,
      height: 32,
      marginHorizontal: 4,
      resizeMode: 'contain',
    },
    eggImage: {
      width: 120,
      height: 120,
      alignSelf: 'center',
      resizeMode: 'contain',
    },
    eggContentOverlay: {
      position: 'absolute',
      top: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    bgPattern: {
      ...StyleSheet.absoluteFillObject,
      zIndex: -1,
      opacity: 0.18,
    },
    deudaEgg: {
      width: 24,
      height: 24,
      marginRight: 6,
      resizeMode: 'contain',
    },
    emptyEgg: {
      width: 40,
      height: 40,
      marginBottom: 8,
      resizeMode: 'contain',
    },
  container: {
    flex: 1,
    backgroundColor: YoshiColors.sky,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: YoshiColors.sky,
  },
  loadingEmoji: {
    fontSize: 60,
  },
  loadingText: {
    color: YoshiColors.darkGreen,
    fontSize: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  cloudsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  cloud: {
    position: 'absolute',
    backgroundColor: YoshiColors.white,
    borderRadius: 50,
    opacity: 0.8,
  },
  cloud1: {
    width: 80,
    height: 40,
    top: 20,
    left: 20,
  },
  cloud2: {
    width: 60,
    height: 30,
    top: 40,
    right: 40,
  },
  cloud3: {
    width: 50,
    height: 25,
    top: 10,
    right: 120,
  },
  header: {
    backgroundColor: YoshiColors.green,
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: YoshiColors.darkGreen,
    zIndex: 1,
  },
  headerDecor: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 8,
  },
  decorEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: YoshiColors.white,
    letterSpacing: 3,
    textShadowColor: YoshiColors.darkGreen,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 12,
    color: YoshiColors.lightGreen,
    marginTop: 4,
  },
  eggContainer: {
    alignItems: 'center',
    marginVertical: 16,
    zIndex: 1,
  },
  egg: {
    width: 140,
    height: 160,
    backgroundColor: YoshiColors.eggWhite,
    borderRadius: 70,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: YoshiColors.darkGreen,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    position: 'relative',
  },
  eggSpot1: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: YoshiColors.eggSpot,
    borderRadius: 10,
    top: 30,
    left: 25,
  },
  eggSpot2: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: YoshiColors.eggSpot,
    borderRadius: 8,
    top: 50,
    right: 20,
  },
  eggSpot3: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: YoshiColors.eggSpot,
    borderRadius: 6,
    bottom: 40,
    left: 35,
  },
  eggContent: {
    alignItems: 'center',
  },
  eggLabel: {
    color: YoshiColors.darkGreen,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  eggAmount: {
    color: YoshiColors.darkGreen,
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 120,
  },
  section: {
    backgroundColor: YoshiColors.lightGreen,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: YoshiColors.darkGreen,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: YoshiColors.green,
    padding: 10,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    color: YoshiColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  userSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    justifyContent: 'center',
    backgroundColor: YoshiColors.lightSky,
  },
  userEgg: {
    width: 70,
    height: 80,
    backgroundColor: YoshiColors.eggWhite,
    borderRadius: 35,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: YoshiColors.darkGreen,
  },
  userEggSelected: {
    backgroundColor: YoshiColors.yellow,
    borderColor: YoshiColors.orange,
  },
  userEggText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: YoshiColors.darkGreen,
  },
  userEggName: {
    fontSize: 10,
    color: YoshiColors.darkGreen,
    marginTop: 4,
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: YoshiColors.lightSky,
    gap: 12,
  },
  inputLabel: {
    color: YoshiColors.darkGreen,
    fontSize: 14,
    fontWeight: 'bold',
    width: 80,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inputPrefix: {
    color: YoshiColors.darkGreen,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 4,
  },
  input: {
    flex: 1,
    backgroundColor: YoshiColors.white,
    borderWidth: 3,
    borderColor: YoshiColors.green,
    borderRadius: 12,
    color: YoshiColors.darkGreen,
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputWide: {
    flex: 1,
  },
  payButton: {
    flexDirection: 'row',
    backgroundColor: YoshiColors.orange,
    padding: 14,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: YoshiColors.brown,
  },
  payButtonDisabled: {
    backgroundColor: YoshiColors.brown,
  },
  payButtonEmoji: {
    fontSize: 20,
  },
  payButtonText: {
    color: YoshiColors.white,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: YoshiColors.brown,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  deudasList: {
    backgroundColor: YoshiColors.lightSky,
  },
  deudaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: YoshiColors.green,
  },
  deudaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deudaEmoji: {
    fontSize: 20,
  },
  deudaNombre: {
    color: YoshiColors.darkGreen,
    fontSize: 16,
    fontWeight: 'bold',
  },
  deudaMonto: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deudaPendiente: {
    color: YoshiColors.red,
  },
  deudaPagada: {
    color: YoshiColors.darkGreen,
  },
  historialList: {
    backgroundColor: YoshiColors.lightSky,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    color: YoshiColors.darkGreen,
    fontSize: 14,
    marginTop: 8,
  },
  historialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: YoshiColors.green,
  },
  historialAvatar: {
    marginRight: 10,
  },
  historialInfo: {
    flex: 1,
  },
  historialNombre: {
    color: YoshiColors.darkGreen,
    fontSize: 14,
    fontWeight: 'bold',
  },
  historialFecha: {
    color: YoshiColors.darkGreen,
    fontSize: 10,
    opacity: 0.7,
  },
  historialDesc: {
    color: YoshiColors.darkGreen,
    fontSize: 10,
    fontStyle: 'italic',
  },
  historialMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  montoPago: {
    color: YoshiColors.darkGreen,
  },
  montoRetiro: {
    color: YoshiColors.red,
  },
  hillsContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 80,
  },
  hill: {
    position: 'absolute',
    backgroundColor: YoshiColors.lightGreen,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    bottom: 0,
  },
  hill1: {
    width: 200,
    height: 60,
    left: -30,
  },
  hill2: {
    width: 180,
    height: 50,
    right: -20,
  },
});
