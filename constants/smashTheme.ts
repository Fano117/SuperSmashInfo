/**
 * Super Smash Bros 8-Bit Theme
 * Colores, estilos y constantes para la tematica retro
 */

export const SmashColors = {
  // Fondos
  primary: '#1a1a2e',      // Azul oscuro profundo
  secondary: '#16213e',    // Azul marino
  tertiary: '#0f3460',     // Azul intenso
  
  // Acentos
  accent: '#e94560',       // Rojo smash
  accentDark: '#c13852',   // Rojo oscuro
  fire: '#ff6b35',         // Naranja fuego
  
  // Texto
  text: '#eee',
  textLight: '#fff',
  textDark: '#888',
  
  // Categorias de puntos
  dojos: '#ffd700',        // Dorado
  pendejos: '#e94560',     // Rojo
  chescos: '#00d4ff',      // Cyan
  mimidos: '#ff6ec7',      // Rosa
  castitontos: '#ffa500',  // Naranja
  
  // Estados
  victory: '#00ff00',      // Verde victoria
  defeat: '#ff0000',       // Rojo derrota
  neutral: '#888',         // Gris neutral
  
  // UI
  border: '#fff',
  shadow: '#000',
  
  // Gradientes
  gradientStart: '#0f3460',
  gradientEnd: '#1a1a2e',
};

export const SmashFonts = {
  pixel: 'PressStart2P_400Regular',
  mono: 'VT323_400Regular',
};

export const SmashSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SmashSizes = {
  borderWidth: 3,
  borderRadius: 0, // No rounded corners for 8-bit style
  iconSize: 24,
  avatarSize: 48,
  buttonHeight: 48,
  inputHeight: 40,
};

export const SmashShadow = {
  offset: 4,
  color: SmashColors.shadow,
  opacity: 0.5,
};

// Iconos de categorias (emojis 8-bit style)
export const CategoryIcons = {
  dojos: '🏛️',
  pendejos: '💀',
  mimidos: '💔',
  castitontos: '❓',
  chescos: '🥤',
};

export const CategoryLabels = {
  dojos: 'Dojos',
  pendejos: 'Pendejos',
  mimidos: 'Mimidos',
  castitontos: 'Castitontos',
  chescos: 'Chescos',
};
