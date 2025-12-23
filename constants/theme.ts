/**
 * Super Smash Bros 8-Bit Theme
 * Paleta de colores y estilos retro para la app DOJO SMASH 2025
 */

import { Platform } from 'react-native';

// Paleta de colores 8-bit Smash Bros
export const SmashColors = {
  // Fondos
  backgroundPrimary: '#1a1a2e',    // Azul oscuro profundo
  backgroundSecondary: '#16213e',   // Azul marino
  backgroundCard: '#0f3460',        // Azul intenso

  // Acentos
  accentPrimary: '#e94560',         // Rojo smash
  accentSecondary: '#0f3460',       // Azul intenso

  // Texto
  textPrimary: '#eeeeee',           // Blanco/Claro
  textSecondary: '#888888',         // Gris
  textWhite: '#ffffff',

  // Especiales
  gold: '#ffd700',                  // Dorado/Puntos
  greenVictory: '#00ff00',          // Verde victoria
  orangeFire: '#ff6b35',            // Naranja fuego

  // Categorias de puntos
  dojos: '#ffd700',                 // Dorado
  pendejos: '#e94560',              // Rojo
  mimidos: '#ff6b9d',               // Rosa
  castitontos: '#9b59b6',           // Morado
  chescos: '#3498db',               // Azul

  // Estados
  success: '#00ff00',
  error: '#ff4444',
  warning: '#ffaa00',

  // Medallas
  medalGold: '#ffd700',
  medalSilver: '#c0c0c0',
  medalBronze: '#cd7f32',
};

// Colores por modo (mantenemos compatibilidad)
export const Colors = {
  light: {
    text: SmashColors.textPrimary,
    background: SmashColors.backgroundPrimary,
    tint: SmashColors.accentPrimary,
    icon: SmashColors.textSecondary,
    tabIconDefault: SmashColors.textSecondary,
    tabIconSelected: SmashColors.accentPrimary,
  },
  dark: {
    text: SmashColors.textPrimary,
    background: SmashColors.backgroundPrimary,
    tint: SmashColors.accentPrimary,
    icon: SmashColors.textSecondary,
    tabIconDefault: SmashColors.textSecondary,
    tabIconSelected: SmashColors.accentPrimary,
  },
};

// Fuentes 8-bit
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
    pixel: 'Courier',
  },
  android: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    pixel: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    pixel: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    pixel: "'Press Start 2P', 'VT323', 'Silkscreen', monospace",
  },
});

// Iconos por categoria (emojis como fallback)
export const CategoryIcons = {
  dojos: '🏯',
  pendejos: '💀',
  mimidos: '💔',
  castitontos: '❓',
  chescos: '🥤',
};

// Colores de la ruleta
export const WheelColors = [
  '#e94560', // Rojo
  '#ffd700', // Dorado
  '#3498db', // Azul
  '#00ff00', // Verde
  '#ff6b35', // Naranja
  '#9b59b6', // Morado
  '#ff6b9d', // Rosa
  '#00d4ff', // Cyan
  '#ff4444', // Rojo oscuro
  '#44ff44', // Verde claro
];
