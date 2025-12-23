import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { SmashColors, SmashSpacing, SmashSizes } from '@/constants/smashTheme';
import SmashCard from '@/components/SmashCard';
import SmashButton from '@/components/SmashButton';
import { registrarPago, getHistorialBanco, getDeudasUsuarios } from '@/services/api';
import { Transaccion } from '@/types';

interface DeudaUsuario {
  _id: string;
  nombre: string;
  deuda: number;
}

export default function BancoScreen() {
  const { usuarios, banco, loading: contextLoading, refreshBanco, refreshUsuarios } = useApp();
  const [historial, setHistorial] = useState<Transaccion[]>([]);
  const [deudas, setDeudas] = useState<DeudaUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [registrando, setRegistrando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [historialData, deudasData] = await Promise.all([
        getHistorialBanco(),
        getDeudasUsuarios(),
      ]);
      setHistorial(historialData.slice(0, 10)); // Last 10 transactions
      setDeudas(deudasData);
    } catch (error) {
      Alert.alert('❌ ERROR', 'Error al cargar datos del banco');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarPago = async () => {
    if (!usuarioSeleccionado) {
      Alert.alert('⚠️ ATENCION', 'Selecciona un usuario');
      return;
    }
    if (!monto || parseFloat(monto) <= 0) {
      Alert.alert('⚠️ ATENCION', 'Ingresa un monto valido');
      return;
    }

    try {
      setRegistrando(true);
      await registrarPago(usuarioSeleccionado, parseFloat(monto), descripcion || undefined);
      await Promise.all([refreshBanco(), refreshUsuarios(), cargarDatos()]);
      
      // Reset form
      setMonto('');
      setDescripcion('');
      setUsuarioSeleccionado('');
      
      Alert.alert('✅ COMPLETE!', 'Pago registrado exitosamente');
    } catch (error) {
      Alert.alert('❌ ERROR', error instanceof Error ? error.message : 'Error al registrar pago');
    } finally {
      setRegistrando(false);
    }
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
        <Text style={styles.title}>💰 BANCO SMASH 💰</Text>
        
        {/* Total del Banco */}
        <SmashCard style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL EN BANCO</Text>
          <Text style={styles.totalAmount}>${banco?.total?.toFixed(2) || '0.00'}</Text>
        </SmashCard>

        {/* Formulario de Pago */}
        <SmashCard style={styles.formCard}>
          <Text style={styles.sectionTitle}>📝 REGISTRAR PAGO</Text>
          
          <Text style={styles.label}>USUARIO:</Text>
          <View style={styles.userButtonsContainer}>
            {usuarios.map(usuario => (
              <SmashButton
                key={usuario._id}
                title={usuario.nombre}
                onPress={() => setUsuarioSeleccionado(usuario._id)}
                variant={usuarioSeleccionado === usuario._id ? 'accent' : 'secondary'}
                style={styles.userButton}
              />
            ))}
          </View>

          <Text style={styles.label}>MONTO ($):</Text>
          <TextInput
            style={styles.input}
            value={monto}
            onChangeText={setMonto}
            placeholder="0.00"
            placeholderTextColor={SmashColors.textDark}
            keyboardType="numeric"
          />

          <Text style={styles.label}>DESCRIPCION (opcional):</Text>
          <TextInput
            style={styles.input}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Ej: Pago semanal"
            placeholderTextColor={SmashColors.textDark}
          />

          <SmashButton
            title={registrando ? "REGISTRANDO..." : "💵 REGISTRAR PAGO"}
            onPress={handleRegistrarPago}
            variant="fire"
            fullWidth
            disabled={registrando}
          />
        </SmashCard>

        {/* Deudas */}
        <SmashCard style={styles.deudasCard}>
          <Text style={styles.sectionTitle}>📊 DEUDAS</Text>
          {deudas.map(deuda => (
            <View key={deuda._id} style={styles.deudaItem}>
              <Text style={styles.deudaNombre}>{deuda.nombre}</Text>
              <Text style={[
                styles.deudaMonto,
                { color: deuda.deuda > 0 ? SmashColors.accent : SmashColors.victory }
              ]}>
                ${deuda.deuda.toFixed(2)}
              </Text>
            </View>
          ))}
        </SmashCard>

        {/* Historial */}
        {historial.length > 0 && (
          <SmashCard style={styles.historialCard}>
            <Text style={styles.sectionTitle}>📜 ULTIMOS PAGOS</Text>
            {historial.map((trans) => {
              const usuario = usuarios.find(u => u._id === trans.usuario);
              return (
                <View key={trans._id} style={styles.transaccionItem}>
                  <View style={styles.transaccionHeader}>
                    <Text style={styles.transaccionUsuario}>
                      {typeof trans.usuario === 'string' ? trans.usuario : usuario?.nombre || 'Desconocido'}
                    </Text>
                    <Text style={styles.transaccionMonto}>${trans.monto.toFixed(2)}</Text>
                  </View>
                  {trans.descripcion && (
                    <Text style={styles.transaccionDesc}>{trans.descripcion}</Text>
                  )}
                  <Text style={styles.transaccionFecha}>
                    {trans.createdAt ? new Date(trans.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              );
            })}
          </SmashCard>
        )}

        <SmashButton
          title="🔄 ACTUALIZAR"
          onPress={cargarDatos}
          variant="secondary"
          fullWidth
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
    color: SmashColors.dojos,
    textAlign: 'center',
    marginBottom: SmashSpacing.lg,
    letterSpacing: 1,
  },
  totalCard: {
    marginBottom: SmashSpacing.lg,
    alignItems: 'center',
    padding: SmashSpacing.xl,
  },
  totalLabel: {
    fontSize: 12,
    color: SmashColors.textDark,
    marginBottom: SmashSpacing.sm,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: SmashColors.dojos,
  },
  formCard: {
    marginBottom: SmashSpacing.lg,
  },
  deudasCard: {
    marginBottom: SmashSpacing.lg,
  },
  historialCard: {
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
  userButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SmashSpacing.sm,
    marginBottom: SmashSpacing.sm,
  },
  userButton: {
    paddingVertical: SmashSpacing.sm,
    paddingHorizontal: SmashSpacing.md,
    minHeight: 0,
  },
  input: {
    height: SmashSizes.inputHeight,
    backgroundColor: SmashColors.primary,
    borderWidth: SmashSizes.borderWidth,
    borderColor: SmashColors.border,
    color: SmashColors.text,
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: SmashSpacing.md,
    marginBottom: SmashSpacing.md,
  },
  deudaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SmashSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: SmashColors.textDark,
  },
  deudaNombre: {
    fontSize: 14,
    fontWeight: 'bold',
    color: SmashColors.text,
  },
  deudaMonto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transaccionItem: {
    paddingVertical: SmashSpacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: SmashColors.textDark,
  },
  transaccionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transaccionUsuario: {
    fontSize: 12,
    fontWeight: 'bold',
    color: SmashColors.text,
  },
  transaccionMonto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: SmashColors.dojos,
  },
  transaccionDesc: {
    fontSize: 10,
    color: SmashColors.textDark,
    marginTop: SmashSpacing.xs,
  },
  transaccionFecha: {
    fontSize: 9,
    color: SmashColors.textDark,
    marginTop: SmashSpacing.xs,
  },
});
