import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SmashColors, CategoryIcons } from '@/constants/theme';
import { TipoPunto, AvatarId } from '@/types';
import Avatar8Bit from './Avatar8Bit';

interface FormularioPuntosProps {
  nombreUsuario: string;
  avatar?: AvatarId;
  fotoUrl?: string | null;
  valoresIniciales?: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
  };
  onChange: (puntos: {
    dojos: number;
    pendejos: number;
    mimidos: number;
    castitontos: number;
    chescos: number;
  }) => void;
  theme?: 'mario' | 'metroid' | 'banjo' | 'gamewatch' | 'smash';
}

const themeColors = {
  mario: {
    border: '#e52521',
    bg: '#049cd8',
    button: '#fbd000',
  },
  metroid: {
    border: '#ff6600',
    bg: '#1a1a2e',
    button: '#00ff00',
  },
  banjo: {
    border: '#f4a460',
    bg: '#228b22',
    button: '#ff69b4',
  },
  gamewatch: {
    border: '#333333',
    bg: '#b8c4a8',
    button: '#333333',
  },
  smash: {
    border: SmashColors.accentPrimary,
    bg: SmashColors.backgroundSecondary,
    button: SmashColors.gold,
  },
};

const categorias: { key: TipoPunto; label: string; icon: string; color: string }[] = [
  { key: 'dojos', label: 'Dojos', icon: CategoryIcons.dojos, color: SmashColors.dojos },
  { key: 'pendejos', label: 'Pendejos', icon: CategoryIcons.pendejos, color: SmashColors.pendejos },
  { key: 'mimidos', label: 'Mimidos', icon: CategoryIcons.mimidos, color: SmashColors.mimidos },
  { key: 'castitontos', label: 'Castitontos', icon: CategoryIcons.castitontos, color: SmashColors.castitontos },
  { key: 'chescos', label: 'Chescos', icon: CategoryIcons.chescos, color: SmashColors.chescos },
];

export default function FormularioPuntos({
  nombreUsuario,
  avatar,
  fotoUrl,
  valoresIniciales = { dojos: 0, pendejos: 0, mimidos: 0, castitontos: 0, chescos: 0 },
  onChange,
  theme = 'mario',
}: FormularioPuntosProps) {
  const [puntos, setPuntos] = useState(valoresIniciales);
  const [editando, setEditando] = useState<TipoPunto | null>(null);
  const [valorTemporal, setValorTemporal] = useState('');
  const colors = themeColors[theme];

  useEffect(() => {
    setPuntos(valoresIniciales);
  }, [valoresIniciales.dojos, valoresIniciales.pendejos, valoresIniciales.mimidos, valoresIniciales.castitontos, valoresIniciales.chescos]);

  const handleChange = (key: TipoPunto, delta: number) => {
    const nuevoValor = Math.max(0, Math.round((puntos[key] + delta) * 100) / 100);
    const nuevosPuntos = { ...puntos, [key]: nuevoValor };
    setPuntos(nuevosPuntos);
    onChange(nuevosPuntos);
  };

  const abrirEditor = (key: TipoPunto) => {
    setEditando(key);
    setValorTemporal(puntos[key].toString());
  };

  const confirmarEdicion = () => {
    if (editando) {
      const numValue = parseFloat(valorTemporal) || 0;
      const nuevosPuntos = { ...puntos, [editando]: Math.max(0, numValue) };
      setPuntos(nuevosPuntos);
      onChange(nuevosPuntos);
    }
    setEditando(null);
    setValorTemporal('');
  };

  const formatearNumero = (num: number) => {
    if (num === 0) return '0';
    if (Number.isInteger(num)) return num.toString();
    return num.toFixed(1);
  };

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <View style={[styles.header, { backgroundColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Avatar8Bit
            avatarId={avatar || 'mario'}
            size="small"
            fotoUrl={fotoUrl}
          />
          <Text style={styles.headerText}>{nombreUsuario}</Text>
        </View>
      </View>

      {categorias.map((cat) => (
        <View key={cat.key} style={styles.row}>
          <View style={styles.categoryInfo}>
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={[styles.label, { color: cat.color }]}>{cat.label}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.buttonMinus]}
              onPress={() => handleChange(cat.key, -1)}
            >
              <Text style={styles.buttonText}>-1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonMinus, styles.buttonSmall]}
              onPress={() => handleChange(cat.key, -0.5)}
            >
              <Text style={styles.buttonTextSmall}>-.5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.valueContainer}
              onPress={() => abrirEditor(cat.key)}
            >
              <Text style={styles.valueText}>
                {formatearNumero(puntos[cat.key])}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPlus, styles.buttonSmall]}
              onPress={() => handleChange(cat.key, 0.5)}
            >
              <Text style={styles.buttonTextSmall}>+.5</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPlus]}
              onPress={() => handleChange(cat.key, 1)}
            >
              <Text style={styles.buttonText}>+1</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>
          {(puntos.dojos - puntos.pendejos - puntos.mimidos - puntos.castitontos).toFixed(1)}
        </Text>
      </View>

      {/* Modal para editar valor manualmente */}
      <Modal
        visible={editando !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEditando(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editando && categorias.find(c => c.key === editando)?.icon}{' '}
              {editando && categorias.find(c => c.key === editando)?.label}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={valorTemporal}
              onChangeText={setValorTemporal}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditando(null)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmarEdicion}
              >
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: SmashColors.backgroundSecondary,
    borderWidth: 3,
    marginVertical: 8,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    color: SmashColors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: SmashColors.backgroundPrimary,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  button: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
    borderRadius: 4,
  },
  buttonSmall: {
    width: 32,
    height: 32,
  },
  buttonMinus: {
    backgroundColor: SmashColors.accentPrimary,
  },
  buttonPlus: {
    backgroundColor: SmashColors.greenVictory,
  },
  buttonText: {
    color: SmashColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  buttonTextSmall: {
    color: SmashColors.textWhite,
    fontSize: 11,
    fontWeight: 'bold',
  },
  valueContainer: {
    minWidth: 48,
    height: 36,
    backgroundColor: SmashColors.backgroundPrimary,
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  valueText: {
    color: SmashColors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 3,
    backgroundColor: SmashColors.backgroundPrimary,
  },
  totalLabel: {
    color: SmashColors.gold,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  totalValue: {
    color: SmashColors.gold,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: SmashColors.accentPrimary,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: SmashColors.backgroundSecondary,
    borderWidth: 4,
    borderColor: SmashColors.gold,
    padding: 20,
    width: '80%',
    maxWidth: 300,
    borderRadius: 8,
  },
  modalTitle: {
    color: SmashColors.textWhite,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: SmashColors.backgroundPrimary,
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
    color: SmashColors.textWhite,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    borderWidth: 2,
  },
  modalButtonCancel: {
    backgroundColor: SmashColors.accentPrimary,
    borderColor: '#aa0000',
  },
  modalButtonConfirm: {
    backgroundColor: SmashColors.greenVictory,
    borderColor: '#006600',
  },
  modalButtonText: {
    color: SmashColors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
