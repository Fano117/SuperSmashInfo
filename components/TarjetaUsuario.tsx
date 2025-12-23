import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SmashColors, CategoryIcons } from '@/constants/theme';
import { Usuario } from '@/types';
import Avatar8Bit from './Avatar8Bit';

interface TarjetaUsuarioProps {
  usuario: Usuario;
  posicion?: number;
  onPress?: () => void;
  showDetails?: boolean;
  selected?: boolean;
  theme?: 'smash' | 'mario' | 'metroid' | 'banjo' | 'gamewatch';
}

const themeColors = {
  smash: {
    border: SmashColors.accentPrimary,
    accent: SmashColors.gold,
    bg: SmashColors.backgroundSecondary,
  },
  mario: {
    border: '#e52521', // Rojo Mario
    accent: '#fbd000', // Amarillo Mario
    bg: '#049cd8', // Azul Mario
  },
  metroid: {
    border: '#ff6600', // Naranja Samus
    accent: '#00ff00', // Verde energia
    bg: '#1a1a2e', // Oscuro espacial
  },
  banjo: {
    border: '#f4a460', // Marron Banjo
    accent: '#ff69b4', // Rosa Kazooie
    bg: '#228b22', // Verde selva
  },
  gamewatch: {
    border: '#333333', // Negro LCD
    accent: '#c0c0c0', // Gris LCD
    bg: '#b8c4a8', // Verde LCD clasico
  },
};

export default function TarjetaUsuario({
  usuario,
  posicion,
  onPress,
  showDetails = false,
  selected = false,
  theme = 'smash',
}: TarjetaUsuarioProps) {
  const colors = themeColors[theme];
  // Dojos suman, pendejos/mimidos/castitontos restan, chescos son neutrales
  const total = usuario.dojos - usuario.pendejos - usuario.mimidos - usuario.castitontos;

  const getMedalColor = (pos: number) => {
    if (pos === 1) return SmashColors.medalGold;
    if (pos === 2) return SmashColors.medalSilver;
    if (pos === 3) return SmashColors.medalBronze;
    return SmashColors.textSecondary;
  };

  const getMedalEmoji = (pos: number) => {
    if (pos === 1) return '🥇';
    if (pos === 2) return '🥈';
    if (pos === 3) return '🥉';
    return `#${pos}`;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: selected ? colors.accent : colors.border,
          borderWidth: selected ? 4 : 3,
        },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        {posicion && (
          <View style={[styles.posicion, { backgroundColor: getMedalColor(posicion) }]}>
            <Text style={styles.posicionText}>{getMedalEmoji(posicion)}</Text>
          </View>
        )}
        <View style={styles.avatarContainer}>
          <Avatar8Bit
            avatarId={usuario.avatar || 'mario'}
            size="small"
            fotoUrl={usuario.fotoUrl}
          />
        </View>
        <View style={styles.nameContainer}>
          <Text style={[styles.nombre, { color: colors.accent }]}>{usuario.nombre}</Text>
          <Text style={styles.total}>Total: {total.toFixed(1)}</Text>
        </View>
        {selected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>READY!</Text>
          </View>
        )}
      </View>

      {showDetails && (
        <View style={styles.detalles}>
          <View style={styles.puntoRow}>
            <Text style={styles.puntoIcon}>{CategoryIcons.dojos}</Text>
            <Text style={styles.puntoLabel}>Dojos</Text>
            <Text style={[styles.puntoValue, { color: SmashColors.dojos }]}>
              {usuario.dojos.toFixed(1)}
            </Text>
          </View>
          <View style={styles.puntoRow}>
            <Text style={styles.puntoIcon}>{CategoryIcons.pendejos}</Text>
            <Text style={styles.puntoLabel}>Pendejos</Text>
            <Text style={[styles.puntoValue, { color: SmashColors.pendejos }]}>
              {usuario.pendejos.toFixed(1)}
            </Text>
          </View>
          <View style={styles.puntoRow}>
            <Text style={styles.puntoIcon}>{CategoryIcons.mimidos}</Text>
            <Text style={styles.puntoLabel}>Mimidos</Text>
            <Text style={[styles.puntoValue, { color: SmashColors.mimidos }]}>
              {usuario.mimidos.toFixed(1)}
            </Text>
          </View>
          <View style={styles.puntoRow}>
            <Text style={styles.puntoIcon}>{CategoryIcons.castitontos}</Text>
            <Text style={styles.puntoLabel}>Castitontos</Text>
            <Text style={[styles.puntoValue, { color: SmashColors.castitontos }]}>
              {usuario.castitontos.toFixed(1)}
            </Text>
          </View>
          <View style={styles.puntoRow}>
            <Text style={styles.puntoIcon}>{CategoryIcons.chescos}</Text>
            <Text style={styles.puntoLabel}>Chescos</Text>
            <Text style={[styles.puntoValue, { color: SmashColors.chescos }]}>
              {usuario.chescos.toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 0,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  posicion: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
  },
  posicionText: {
    fontSize: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  total: {
    color: SmashColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  selectedBadge: {
    backgroundColor: SmashColors.greenVictory,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: SmashColors.textWhite,
  },
  selectedText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  detalles: {
    marginTop: 12,
    borderTopWidth: 2,
    borderTopColor: SmashColors.backgroundPrimary,
    paddingTop: 12,
  },
  puntoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  puntoIcon: {
    fontSize: 16,
    width: 28,
  },
  puntoLabel: {
    flex: 1,
    color: SmashColors.textPrimary,
    fontSize: 14,
  },
  puntoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
});
