import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { FlappyYoshi } from '@/components/games';
import PasswordModal from '@/components/PasswordModal';
import { Transaccion } from '@/types';
import * as api from '@/services/api';
import Avatar8Bit from '@/components/Avatar8Bit';

// Colores auténticos de Yoshi's House - Super Mario World SNES
const YoshiHouseColors = {
  // Cielo
  skyTop: '#5890F8',
  skyBottom: '#98D8F8',
  // Vegetación
  grassDark: '#187818',
  grassLight: '#30A830',
  grassHighlight: '#58C058',
  leafGreen: '#28A028',
  // Casa de Yoshi
  houseBrown: '#B86820',
  houseRoof: '#E85820',
  houseDoor: '#582000',
  // Tierra
  dirtBrown: '#C08040',
  dirtDark: '#985820',
  // Huevo de Yoshi
  eggWhite: '#F8F8F8',
  eggGreen: '#58B858',
  eggOutline: '#285828',
  // UI
  coinYellow: '#F8D830',
  coinOrange: '#E89820',
  textWhite: '#FFFFFF',
  textShadow: '#282828',
  // Efectos
  red: '#E82020',
  pink: '#F898B8',
};

// Componente de huevo de Yoshi estilizado con CSS puro
function YoshiEgg({ size = 60, spots = true, animated = false, style }: {
  size?: number;
  spots?: boolean;
  animated?: boolean;
  style?: any;
}) {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -8,
            duration: 400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, bounceAnim]);

  const Container = animated ? Animated.View : View;
  const containerStyle = animated ? { transform: [{ translateY: bounceAnim }] } : {};

  return (
    <Container style={[containerStyle, style]}>
      <View style={[styles.yoshiEgg, { width: size, height: size * 1.2 }]}>
        {/* Cuerpo del huevo */}
        <View style={[styles.eggBody, {
          width: size,
          height: size * 1.2,
          borderRadius: size / 2,
        }]}>
          {/* Brillo */}
          <View style={[styles.eggShine, {
            width: size * 0.25,
            height: size * 0.4,
            top: size * 0.15,
            left: size * 0.15,
            borderRadius: size * 0.15,
          }]} />
          {/* Manchas verdes */}
          {spots && (
            <>
              <View style={[styles.eggSpot, {
                width: size * 0.22,
                height: size * 0.22,
                top: size * 0.2,
                right: size * 0.18,
                borderRadius: size * 0.11,
              }]} />
              <View style={[styles.eggSpot, {
                width: size * 0.18,
                height: size * 0.18,
                top: size * 0.55,
                left: size * 0.2,
                borderRadius: size * 0.09,
              }]} />
              <View style={[styles.eggSpot, {
                width: size * 0.15,
                height: size * 0.15,
                bottom: size * 0.2,
                right: size * 0.25,
                borderRadius: size * 0.075,
              }]} />
            </>
          )}
        </View>
      </View>
    </Container>
  );
}

// Componente de moneda estilo SMW
function SMWCoin({ size = 24 }: { size?: number }) {
  return (
    <View style={[styles.coin, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.coinSymbol, { fontSize: size * 0.6 }]}>$</Text>
    </View>
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

  // Easter egg: FlappyYoshi - Long press en los huevos del header
  const [showFlappyYoshi, setShowFlappyYoshi] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estado para modal de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);

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

  const handlePago = () => {
    if (!usuarioSeleccionado || !monto) {
      Alert.alert('Yoshi!', 'Selecciona un jugador y monto');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Yoshi?', 'Monto invalido');
      return;
    }

    // Mostrar modal de contraseña
    setShowPasswordModal(true);
  };

  const handlePagoConfirmado = async () => {
    if (!usuarioSeleccionado || !monto) return;

    const montoNum = parseFloat(monto);

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
        <YoshiEgg size={80} animated />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fondo estilo Yoshi's House */}
      <View style={styles.background}>
        {/* Cielo con gradiente */}
        <View style={styles.sky} />

        {/* Nubes estilo SMW */}
        <View style={[styles.cloudSMW, { top: 30, left: 20 }]}>
          <View style={styles.cloudPart} />
          <View style={[styles.cloudPart, styles.cloudPartMid]} />
          <View style={styles.cloudPart} />
        </View>
        <View style={[styles.cloudSMW, { top: 60, right: 30 }]}>
          <View style={styles.cloudPart} />
          <View style={[styles.cloudPart, styles.cloudPartMid]} />
          <View style={styles.cloudPart} />
        </View>
        <View style={[styles.cloudSMW, { top: 20, right: 120 }]}>
          <View style={[styles.cloudPart, { width: 25, height: 25 }]} />
          <View style={[styles.cloudPart, styles.cloudPartMid, { width: 30, height: 30 }]} />
          <View style={[styles.cloudPart, { width: 25, height: 25 }]} />
        </View>

        {/* Colinas de fondo */}
        <View style={styles.hillsBack}>
          <View style={[styles.hillBack, { left: -50 }]} />
          <View style={[styles.hillBack, { left: 100, height: 100 }]} />
          <View style={[styles.hillBack, { right: -30, height: 80 }]} />
        </View>

        {/* Pasto base */}
        <View style={styles.grassBase}>
          <View style={styles.grassStripe} />
          <View style={[styles.grassStripe, styles.grassStripe2]} />
        </View>
      </View>

      {/* Header estilo cartel de madera - Easter egg: Long press en huevos abre FlappyYoshi */}
      <View style={styles.header}>
        <View style={styles.woodSign}>
          <View style={styles.woodSignTop}>
            <TouchableOpacity
              onPressIn={() => {
                longPressTimer.current = setTimeout(() => {
                  setShowFlappyYoshi(true);
                }, 2000);
              }}
              onPressOut={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
            >
              <YoshiEgg size={28} animated style={styles.headerEgg} />
            </TouchableOpacity>
            <Text style={styles.title}>BANCO SMASH</Text>
            <TouchableOpacity
              onPressIn={() => {
                longPressTimer.current = setTimeout(() => {
                  setShowFlappyYoshi(true);
                }, 2000);
              }}
              onPressOut={() => {
                if (longPressTimer.current) {
                  clearTimeout(longPressTimer.current);
                  longPressTimer.current = null;
                }
              }}
            >
              <YoshiEgg size={28} animated style={styles.headerEgg} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Yoshi's House</Text>
        </View>
      </View>

      {/* FlappyYoshi Game Easter Egg */}
      <FlappyYoshi visible={showFlappyYoshi} onClose={() => setShowFlappyYoshi(false)} />

      {/* Total en huevo gigante */}
      <View style={styles.totalContainer}>
        <View style={styles.totalEggWrapper}>
          <YoshiEgg size={100} spots={true} />
          <View style={styles.totalOverlay}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalAmount}>${banco?.total?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
        <View style={styles.coinsDecor}>
          <SMWCoin size={20} />
          <SMWCoin size={24} />
          <SMWCoin size={20} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Seccion de registro de pago */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SMWCoin size={22} />
            <Text style={styles.sectionTitle}>REGISTRAR PAGO</Text>
          </View>

          {/* Selector de usuario */}
          <View style={styles.userSelector}>
            {usuarios.map((usuario) => (
              <TouchableOpacity
                key={usuario._id}
                style={[
                  styles.userCard,
                  usuarioSeleccionado === usuario._id && styles.userCardSelected,
                ]}
                onPress={() => setUsuarioSeleccionado(usuario._id)}
              >
                <View style={styles.userEggContainer}>
                  <YoshiEgg size={32} spots={false} />
                  <View style={styles.userAvatarOverlay}>
                    <Avatar8Bit
                      avatarId={usuario.avatar || 'yoshi'}
                      size="small"
                      fotoUrl={usuario.fotoUrl}
                    />
                  </View>
                </View>
                <Text style={styles.userName}>{usuario.nombre}</Text>
                {usuarioSeleccionado === usuario._id && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedText}>OK!</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Inputs */}
          <View style={styles.inputSection}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Monto:</Text>
              <View style={styles.inputContainer}>
                <SMWCoin size={18} />
                <TextInput
                  style={styles.input}
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={YoshiHouseColors.grassDark}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Nota:</Text>
              <TextInput
                style={[styles.input, styles.inputWide]}
                value={descripcion}
                onChangeText={setDescripcion}
                placeholder="Opcional"
                placeholderTextColor={YoshiHouseColors.grassDark}
              />
            </View>
          </View>

          {/* Boton de pago */}
          <TouchableOpacity
            style={[styles.payButton, procesando && styles.payButtonDisabled]}
            onPress={handlePago}
            disabled={procesando}
          >
            <YoshiEgg size={24} spots={false} />
            <Text style={styles.payButtonText}>
              {procesando ? 'PROCESANDO...' : 'GUARDAR PAGO'}
            </Text>
            <YoshiEgg size={24} spots={false} />
          </TouchableOpacity>
        </View>

        {/* Seccion de deudas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <YoshiEgg size={20} spots={false} />
            <Text style={styles.sectionTitle}>DEUDAS</Text>
          </View>
          <View style={styles.listContainer}>
            {usuarios.map((usuario, index) => (
              <View
                key={usuario._id}
                style={[
                  styles.deudaRow,
                  index === usuarios.length - 1 && styles.lastRow
                ]}
              >
                <View style={styles.deudaInfo}>
                  <Avatar8Bit
                    avatarId={usuario.avatar || 'yoshi'}
                    size="small"
                    fotoUrl={usuario.fotoUrl}
                  />
                  <Text style={styles.deudaNombre}>{usuario.nombre}</Text>
                </View>
                <View style={[
                  styles.deudaMontoContainer,
                  usuario.deuda > 0 ? styles.deudaPendienteContainer : styles.deudaPagadaContainer
                ]}>
                  <Text style={[
                    styles.deudaMonto,
                    usuario.deuda > 0 ? styles.deudaPendiente : styles.deudaPagada,
                  ]}>
                    ${usuario.deuda.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Historial de transacciones */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <YoshiEgg size={20} spots={false} />
            <Text style={styles.sectionTitle}>HISTORIAL</Text>
          </View>
          <View style={styles.listContainer}>
            {historial.length === 0 ? (
              <View style={styles.emptyState}>
                <YoshiEgg size={50} animated />
                <Text style={styles.emptyText}>Sin transacciones</Text>
              </View>
            ) : (
              historial.slice(0, 10).map((trans, index) => {
                const usuarioObj = typeof trans.usuario === 'object' ? trans.usuario : null;
                const usuarioNombre = usuarioObj ? usuarioObj.nombre : 'Usuario';
                const fecha = trans.createdAt
                  ? new Date(trans.createdAt).toLocaleDateString()
                  : '';
                return (
                  <View
                    key={trans._id}
                    style={[
                      styles.historialRow,
                      index === Math.min(historial.length - 1, 9) && styles.lastRow
                    ]}
                  >
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
                    <View style={[
                      styles.historialMontoContainer,
                      trans.tipo === 'pago' ? styles.montoPagoContainer : styles.montoRetiroContainer
                    ]}>
                      <Text style={[
                        styles.historialMonto,
                        trans.tipo === 'pago' ? styles.montoPago : styles.montoRetiro,
                      ]}>
                        {trans.tipo === 'pago' ? '+' : '-'}${trans.monto.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Decoración inferior - Tubería estilo SMW */}
      <View style={styles.bottomDecor}>
        <View style={styles.pipeLeft}>
          <View style={styles.pipeTop} />
          <View style={styles.pipeBody} />
        </View>
        <View style={styles.groundStripe} />
        <View style={styles.pipeRight}>
          <View style={styles.pipeTop} />
          <View style={styles.pipeBody} />
        </View>
      </View>

      {/* Modal: Contraseña para guardar pago */}
      <PasswordModal
        visible={showPasswordModal}
        onCancel={() => setShowPasswordModal(false)}
        onSuccess={() => {
          setShowPasswordModal(false);
          handlePagoConfirmado();
        }}
        title="🔐 AUTORIZACIÓN REQUERIDA"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YoshiHouseColors.skyBottom,
  },
  // Fondo
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  sky: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: YoshiHouseColors.skyTop,
  },
  // Nubes SMW
  cloudSMW: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cloudPart: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  cloudPartMid: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: -10,
    marginBottom: 5,
  },
  // Colinas
  hillsBack: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    height: 150,
    flexDirection: 'row',
  },
  hillBack: {
    position: 'absolute',
    bottom: 0,
    width: 200,
    height: 120,
    backgroundColor: YoshiHouseColors.grassLight,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  // Pasto
  grassBase: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: YoshiHouseColors.grassDark,
  },
  grassStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: YoshiHouseColors.grassHighlight,
  },
  grassStripe2: {
    top: 20,
    height: 4,
    backgroundColor: YoshiHouseColors.grassLight,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: YoshiHouseColors.skyBottom,
  },
  loadingText: {
    color: YoshiHouseColors.grassDark,
    fontSize: 18,
    marginTop: 16,
    fontWeight: 'bold',
    textShadowColor: YoshiHouseColors.textWhite,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Header
  header: {
    zIndex: 10,
    alignItems: 'center',
    paddingTop: 8,
  },
  woodSign: {
    backgroundColor: YoshiHouseColors.houseBrown,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 4,
    borderColor: YoshiHouseColors.dirtDark,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 5,
  },
  woodSignTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerEgg: {
    marginHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: YoshiHouseColors.textWhite,
    letterSpacing: 2,
    textShadowColor: YoshiHouseColors.textShadow,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontSize: 11,
    color: YoshiHouseColors.coinYellow,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 1,
  },
  // Total
  totalContainer: {
    alignItems: 'center',
    marginVertical: 12,
    zIndex: 10,
  },
  totalEggWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalOverlay: {
    position: 'absolute',
    alignItems: 'center',
    top: 30,
  },
  totalLabel: {
    color: YoshiHouseColors.grassDark,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  totalAmount: {
    color: YoshiHouseColors.grassDark,
    fontSize: 22,
    fontWeight: 'bold',
  },
  coinsDecor: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  // Huevo de Yoshi
  yoshiEgg: {
    position: 'relative',
  },
  eggBody: {
    backgroundColor: YoshiHouseColors.eggWhite,
    borderWidth: 3,
    borderColor: YoshiHouseColors.eggOutline,
    overflow: 'hidden',
  },
  eggShine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  eggSpot: {
    position: 'absolute',
    backgroundColor: YoshiHouseColors.eggGreen,
    borderWidth: 1,
    borderColor: YoshiHouseColors.eggOutline,
  },
  // Moneda
  coin: {
    backgroundColor: YoshiHouseColors.coinYellow,
    borderWidth: 2,
    borderColor: YoshiHouseColors.coinOrange,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coinSymbol: {
    color: YoshiHouseColors.coinOrange,
    fontWeight: 'bold',
  },
  // Scroll
  scrollView: {
    flex: 1,
    zIndex: 5,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 140,
  },
  // Secciones
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: YoshiHouseColors.grassDark,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: YoshiHouseColors.grassLight,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: YoshiHouseColors.grassDark,
  },
  sectionTitle: {
    color: YoshiHouseColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: YoshiHouseColors.grassDark,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Selector de usuario
  userSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    justifyContent: 'center',
    backgroundColor: YoshiHouseColors.skyBottom,
  },
  userCard: {
    alignItems: 'center',
    padding: 8,
    backgroundColor: YoshiHouseColors.eggWhite,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: YoshiHouseColors.grassLight,
    minWidth: 70,
  },
  userCardSelected: {
    backgroundColor: YoshiHouseColors.coinYellow,
    borderColor: YoshiHouseColors.coinOrange,
    borderWidth: 3,
  },
  userEggContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarOverlay: {
    position: 'absolute',
    top: 2,
  },
  userName: {
    fontSize: 9,
    color: YoshiHouseColors.grassDark,
    marginTop: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: YoshiHouseColors.grassLight,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectedText: {
    color: YoshiHouseColors.textWhite,
    fontSize: 8,
    fontWeight: 'bold',
  },
  // Inputs
  inputSection: {
    backgroundColor: YoshiHouseColors.skyBottom,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 10,
  },
  inputLabel: {
    color: YoshiHouseColors.grassDark,
    fontSize: 13,
    fontWeight: 'bold',
    width: 60,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  input: {
    flex: 1,
    backgroundColor: YoshiHouseColors.textWhite,
    borderWidth: 2,
    borderColor: YoshiHouseColors.grassLight,
    borderRadius: 8,
    color: YoshiHouseColors.grassDark,
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputWide: {
    flex: 1,
  },
  // Botón de pago
  payButton: {
    flexDirection: 'row',
    backgroundColor: YoshiHouseColors.houseRoof,
    padding: 12,
    margin: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: YoshiHouseColors.houseBrown,
  },
  payButtonDisabled: {
    backgroundColor: YoshiHouseColors.dirtBrown,
    opacity: 0.7,
  },
  payButtonText: {
    color: YoshiHouseColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: YoshiHouseColors.textShadow,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  // Listas
  listContainer: {
    backgroundColor: YoshiHouseColors.skyBottom,
  },
  deudaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: YoshiHouseColors.grassLight,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  deudaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deudaNombre: {
    color: YoshiHouseColors.grassDark,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deudaMontoContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
  },
  deudaPendienteContainer: {
    backgroundColor: '#FFE0E0',
    borderColor: YoshiHouseColors.red,
  },
  deudaPagadaContainer: {
    backgroundColor: '#E0FFE0',
    borderColor: YoshiHouseColors.grassLight,
  },
  deudaMonto: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deudaPendiente: {
    color: YoshiHouseColors.red,
  },
  deudaPagada: {
    color: YoshiHouseColors.grassDark,
  },
  // Historial
  historialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: YoshiHouseColors.grassLight,
  },
  historialAvatar: {
    marginRight: 10,
  },
  historialInfo: {
    flex: 1,
  },
  historialNombre: {
    color: YoshiHouseColors.grassDark,
    fontSize: 13,
    fontWeight: 'bold',
  },
  historialFecha: {
    color: YoshiHouseColors.grassDark,
    fontSize: 10,
    opacity: 0.7,
  },
  historialDesc: {
    color: YoshiHouseColors.grassDark,
    fontSize: 10,
    fontStyle: 'italic',
  },
  historialMontoContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
  },
  montoPagoContainer: {
    backgroundColor: '#E0FFE0',
    borderColor: YoshiHouseColors.grassLight,
  },
  montoRetiroContainer: {
    backgroundColor: '#FFE0E0',
    borderColor: YoshiHouseColors.red,
  },
  historialMonto: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  montoPago: {
    color: YoshiHouseColors.grassDark,
  },
  montoRetiro: {
    color: YoshiHouseColors.red,
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: YoshiHouseColors.grassDark,
    fontSize: 14,
    marginTop: 12,
    fontWeight: 'bold',
  },
  // Decoración inferior
  bottomDecor: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  groundStripe: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: YoshiHouseColors.dirtBrown,
    borderTopWidth: 3,
    borderTopColor: YoshiHouseColors.grassDark,
  },
  pipeLeft: {
    alignItems: 'center',
    zIndex: 2,
  },
  pipeRight: {
    alignItems: 'center',
    zIndex: 2,
  },
  pipeTop: {
    width: 50,
    height: 15,
    backgroundColor: YoshiHouseColors.grassLight,
    borderWidth: 2,
    borderColor: YoshiHouseColors.grassDark,
    borderRadius: 3,
  },
  pipeBody: {
    width: 40,
    height: 40,
    backgroundColor: YoshiHouseColors.grassLight,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: YoshiHouseColors.grassDark,
  },
  // Estilos adicionales para payButtonEgg
  payButtonEgg: {
    width: 24,
    height: 24,
  },
  sectionEgg: {
    width: 20,
    height: 20,
  },
});
