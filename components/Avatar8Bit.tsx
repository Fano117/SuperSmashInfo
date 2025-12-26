import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AvatarId } from '@/types';
import { getFotoUrl } from '@/services/api';

interface Avatar8BitProps {
  avatarId: AvatarId;
  size?: 'small' | 'medium' | 'large';
  fotoUrl?: string | null;
}

// Colores 8-bit para cada personaje
const avatarColors: Record<AvatarId, { primary: string; secondary: string; accent: string }> = {
  mario: { primary: '#e52521', secondary: '#fbd000', accent: '#5c3c0d' },
  luigi: { primary: '#43b047', secondary: '#fbd000', accent: '#5c3c0d' },
  peach: { primary: '#ffb6c1', secondary: '#ffd700', accent: '#ff69b4' },
  yoshi: { primary: '#43b047', secondary: '#ffffff', accent: '#ff6347' },
  toad: { primary: '#ff0000', secondary: '#ffffff', accent: '#e8c39e' },
  bowser: { primary: '#ffa500', secondary: '#43b047', accent: '#8b0000' },
  link: { primary: '#43b047', secondary: '#ffd700', accent: '#8b4513' },
  zelda: { primary: '#9370db', secondary: '#ffd700', accent: '#ffb6c1' },
  samus: { primary: '#ff6600', secondary: '#ffcc00', accent: '#00ff00' },
  kirby: { primary: '#ffb6c1', secondary: '#ff69b4', accent: '#ff1493' },
  pikachu: { primary: '#ffd700', secondary: '#000000', accent: '#ff0000' },
  fox: { primary: '#d2691e', secondary: '#ffffff', accent: '#228b22' },
  falcon: { primary: '#4169e1', secondary: '#ffd700', accent: '#ff0000' },
  ness: { primary: '#ff0000', secondary: '#0000ff', accent: '#ffd700' },
  banjo: { primary: '#cd853f', secondary: '#ff6347', accent: '#ffd700' },
  gamewatch: { primary: '#1a1a1a', secondary: '#333333', accent: '#4a4a4a' },
  dk: { primary: '#8b4513', secondary: '#ffd700', accent: '#ff0000' },
  diddy: { primary: '#8b4513', secondary: '#ff0000', accent: '#ffd700' },
};

// Representacion 8-bit en pixel art mejorado (usando bloques unicode)
const avatarPixelArt: Record<AvatarId, string[]> = {
  mario: [
    '    RRRRR    ',
    '   RRRRRRR   ',
    '   BBBSSB    ',
    '  BSBSSSBS   ',
    '  BSBBBSSSB  ',
    '  BBSSSSBBB  ',
    '    SSSSSS   ',
    '  RRRBRRRR   ',
    ' RRRRBRRRRW  ',
    ' WRRRBRRRRW  ',
    ' WWRBBBBRRW  ',
    '   BBBBBB    ',
    '  BBB  BBB   ',
    '  BBB  BBB   ',
    ' BBBB  BBBB  ',
  ],
  luigi: [
    '    GGGGG    ',
    '   GGGGGGG   ',
    '   BBBSSB    ',
    '  BSBSSSBS   ',
    '  BSBBBSSSB  ',
    '  BBSSSSBBB  ',
    '    SSSSSS   ',
    '  GGGBGGGG   ',
    ' GGGGBGGGGG  ',
    ' GGGGBGGGGG  ',
    ' GGBBBBBBGG  ',
    '   BBBBBB    ',
    '  BBB  BBB   ',
    '  BBB  BBB   ',
    ' BBBB  BBBB  ',
  ],
  peach: [
    '     YYY     ',
    '   YYYYYYY   ',
    '  YPPPPPPPY  ',
    '  PPPPPPPPP  ',
    '   PSSSSSP   ',
    '   SBPPBS    ',
    '    SSSS     ',
    '   PPPPPP    ',
    '  PPPPPPPP   ',
    ' PPPPPPPPPP  ',
    ' PPPPPPPPPP  ',
    '  PPPPPPPP   ',
    '   PP  PP    ',
    '   RR  RR    ',
  ],
  yoshi: [
    '       GGG       ',
    '      GWWGG      ',
    '     RGWWBGGGG   ',
    '     GGGGGGGBG   ',
    '     TGGWWGGGGG   ',
    '     TGWWWGGG    ',
    '     TGGGGG     ',
    '    RGGGGGGGG   ',
    '    RGGGGGGG  ',
    'GRRRGGGG   ',
    ' WGGGGGGWWW     ',
    '   WGGGGWWW        ',
    '    WGGGG          ',
    '   TTTT          ',
    '   TTTTT         ',
  ],
  toad: [
    '   RWRWRWR   ',
    '  RWWRWWRWR  ',
    ' RWWWRWWWRW  ',
    ' WWWWWWWWWW  ',
    '  SSSSSSSS   ',
    '  SSBBBBS    ',
    '  SSSSSSS    ',
    '   BBBBBB    ',
    '  BBWWWWBB   ',
    '  BB BB BB   ',
    '  BB    BB   ',
  ],
  bowser: [
    '  GGG   GGG  ',
    '  GGGGGGGGG  ',
    '   GGGGGGG   ',
    '  OOSSSSOOO  ',
    '  OSSBSSOO   ',
    '  OOSSSOO    ',
    '   OOOOOOO   ',
    '  GGGGGGGGG  ',
    ' GGGGGGGGGGG ',
    '  YYYYYYYYYY ',
    '   GGG GGG   ',
    '   GGG GGG   ',
  ],
  link: [
    '    GGGGG    ',
    '   GGGGGGG   ',
    '   GYYYYGG   ',
    '   BSSSSSB   ',
    '   SBBBBBS   ',
    '    SSSSS    ',
    '   GGGGGGG   ',
    '  GGGGGGGGG  ',
    ' BGGGGGGGGB  ',
    '  GGGGGGGGG  ',
    '   GGG GGG   ',
    '   BBB BBB   ',
  ],
  zelda: [
    '    YYYYY    ',
    '   YYYYYYY   ',
    '  YYPPPPPYY  ',
    '   PPPPPPP   ',
    '   SSSSSSS   ',
    '   SBBBBBS   ',
    '    SSSSS    ',
    '   PPPPPPP   ',
    '  PPPPPPPPP  ',
    ' PPPPPPPPPPP ',
    '  PPPPPPPPP  ',
    '   PP   PP   ',
    '   RR   RR   ',
  ],
  samus: [
    '    GGGGG    ',
    '   GGGGGGG   ',
    '  OOGGGGGOO  ',
    '  OOOOOOOOO  ',
    ' OOOOOOOOOOO ',
    '  OOOOOOOOO  ',
    '   OOOOOOO   ',
    '   OOOOOOO   ',
    '  OOO   OOO  ',
    '  OOO   OOO  ',
    '  OO     OO  ',
  ],
  kirby: [
    '    PPPPP    ',
    '   PPPPPPP   ',
    '  PPPPPPPPP  ',
    '  PPBWPBWPP  ',
    '  PPPPPPPPP  ',
    '  PPPPRRPPP  ',
    '   PPPPPPP   ',
    '  PPP   PPP  ',
    '  RR     RR  ',
  ],
  pikachu: [
    ' BB       BB ',
    ' YYB     BYY ',
    '  YYY   YYY  ',
    '   YYYYYYY   ',
    '  YYYBBYBYY  ',
    '  YRYYYYYRR  ',
    '   YYYYYYY   ',
    '    YYYYY    ',
    '   YY   YY   ',
  ],
  fox: [
    '   WW   WW   ',
    '  WWW   WWW  ',
    '  WWWWWWWWW  ',
    '   BBBBBBB   ',
    '  BWWBBBWWB  ',
    '  BBBBBBBBB  ',
    '   GGGGGGG   ',
    '  GGGGGGGGG  ',
    '  GGG   GGG  ',
    '  GG     GG  ',
  ],
  falcon: [
    '    RRRRR    ',
    '   RRRRRRR   ',
    '   BBBBBBB   ',
    '  BBYBBBYBB  ',
    '  BBBBBBBBB  ',
    '   BBBBBBB   ',
    '  RRRRRRRRR  ',
    '   BBBBBBB   ',
    '   BB   BB   ',
    '   BB   BB   ',
  ],
  ness: [
    '   RRRRRR    ',
    '  RBRRRRRR   ',
    '  RRRRRRRR   ',
    '   SSSSSSS   ',
    '  SSBBBBSS   ',
    '   SSSSSSS   ',
    '   RRRRRRR   ',
    '   BBBBBBB   ',
    '   RRR RRR   ',
  ],
  banjo: [
    '   BB  BBB   ',
    '  BBBBBBRBB  ',
    '  BYBBBYBB   ',
    '  BBNNNBB    ',
    '   BBBBBBB   ',
    '   YBBBBBY   ',
    '  BBBYBBBB   ',
    '  BBBBBBBBB  ',
    '   BB   BB   ',
  ],
  gamewatch: [
    '     BBB     ',
    '    BWBWB    ',
    '   BBBBBBB   ',
    '   BWWWWWB   ',
    '   BBBBBBB   ',
    '    BBBBB    ',
    '   BBBBBBB   ',
    '  BBB B BBB  ',
    '    BB BB    ',
    '   BB   BB   ',
    '   BB   BB   ',
  ],
  dk: [
    '   BBBBBBB   ',
    '  BBBBBBBBB  ',
    '  BBTBBTBBB  ',
    '  BBBNNBBBB  ',
    '  BBBBBBBBB  ',
    '   BBBBBBB   ',
    '   RRRRRRR   ',
    '  BBBBBBBBB  ',
    '  BBB   BBB  ',
    '  BBB   BBB  ',
  ],
  diddy: [
    '   BBBBB     ',
    '  BRRRRRRB   ',
    '  BRRRRRRB   ',
    '  BTWBWTBB   ',
    '   BBNBBB    ',
    '   BBBBBB    ',
    '   RRRRRR    ',
    '  RRBBBBRR   ',
    '  BBBBBBBB   ',
    '  YYBBBBYY   ',
    '   BB   BB   ',
    '   YY   YY   ',
  ],
};

// Mapeo de letras a colores por personaje (mejorado con mas detalles)
const colorMap: Record<string, Record<string, string>> = {
  mario: { R: '#e52521', B: '#5c3c0d', S: '#ffcc99', Y: '#fbd000', W: '#ffffff' },
  luigi: { G: '#43b047', B: '#5c3c0d', S: '#ffcc99', Y: '#fbd000', W: '#ffffff' },
  peach: { P: '#ffb6c1', Y: '#ffd700', S: '#ffcc99', R: '#ff69b4', B: '#000000' },
  yoshi: { G: '#43b047', W: '#e8dcc8', R: '#ff0000', B: '#000000', T: '#f5c89a' },
  toad: { R: '#ff0000', W: '#ffffff', S: '#e8c39e', B: '#000000' },
  bowser: { G: '#43b047', O: '#ffa500', Y: '#fbd000', S: '#ffcc99' },
  link: { G: '#43b047', B: '#5c3c0d', S: '#ffcc99', Y: '#ffd700' },
  zelda: { P: '#9370db', Y: '#ffd700', S: '#ffcc99', R: '#ff69b4', B: '#000000' },
  samus: { O: '#ff6600', G: '#00ff00', Y: '#ffcc00' },
  kirby: { P: '#ffb6c1', B: '#000000', R: '#ff0000', W: '#ffffff' },
  pikachu: { Y: '#ffd700', B: '#000000', R: '#ff0000' },
  fox: { W: '#ffffff', B: '#d2691e', G: '#228b22' },
  falcon: { B: '#4169e1', R: '#ff0000', Y: '#ffd700' },
  ness: { R: '#ff0000', B: '#0000ff', S: '#ffcc99', Y: '#ffd700' },
  banjo: { B: '#cd853f', R: '#ff6347', Y: '#ffd700', N: '#000000' },
  gamewatch: { B: '#1a1a1a', W: '#4a4a4a' },
  dk: { B: '#8b4513', T: '#d2b48c', R: '#ff0000', N: '#000000' },
  diddy: { B: '#8b4513', R: '#ff0000', T: '#d2b48c', Y: '#ffd700', N: '#000000', W: '#ffffff' },
};

const sizeConfig = {
  small: { pixel: 2.5, container: 40 },
  medium: { pixel: 3.5, container: 55 },
  large: { pixel: 5, container: 85 },
};

// Color de fondo neutro para todos los avatares (no se mezcla con ningun personaje)
const AVATAR_BACKGROUND = '#2a2a4a';

export default function Avatar8Bit({ avatarId, size = 'medium', fotoUrl }: Avatar8BitProps) {
  const config = sizeConfig[size];
  const colors = avatarColors[avatarId];
  const pixels = avatarPixelArt[avatarId];
  const charColors = colorMap[avatarId] || {};

  // Si hay foto personalizada, mostrarla
  const fullFotoUrl = getFotoUrl(fotoUrl);
  if (fullFotoUrl) {
    return (
      <View style={[styles.container, {
        width: config.container,
        height: config.container,
        backgroundColor: AVATAR_BACKGROUND,
        borderColor: colors.secondary,
      }]}>
        <Image
          source={{ uri: fullFotoUrl }}
          style={[styles.photo, { width: config.container - 4, height: config.container - 4 }]}
        />
      </View>
    );
  }

  // Renderizar pixel art
  return (
    <View style={[styles.container, {
      width: config.container,
      height: config.container,
      backgroundColor: AVATAR_BACKGROUND,
      borderColor: colors.secondary,
    }]}>
      <View style={styles.pixelContainer}>
        {pixels.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.pixelRow}>
            {row.split('').map((char, colIndex) => {
              const pixelColor = char === ' ' ? 'transparent' : (charColors[char] || colors.primary);
              return (
                <View
                  key={`${rowIndex}-${colIndex}`}
                  style={[
                    styles.pixel,
                    {
                      width: config.pixel,
                      height: config.pixel,
                      backgroundColor: pixelColor,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

// Componente simplificado para lista/selector de avatares
interface AvatarListItemProps {
  avatarId: AvatarId;
  name: string;
  selected?: boolean;
  onPress?: () => void;
}

export function AvatarListItem({ avatarId, name, selected, onPress }: AvatarListItemProps) {
  const colors = avatarColors[avatarId];

  return (
    <View style={[
      styles.listItem,
      selected && { borderColor: '#ffd700', borderWidth: 3 },
      { backgroundColor: colors.primary }
    ]}>
      <Avatar8Bit avatarId={avatarId} size="small" />
      <Text style={styles.listItemName}>{name}</Text>
    </View>
  );
}

// Lista de todos los avatares disponibles
export const AVATARES_DISPONIBLES: { id: AvatarId; name: string }[] = [
  { id: 'mario', name: 'Mario' },
  { id: 'luigi', name: 'Luigi' },
  { id: 'peach', name: 'Peach' },
  { id: 'yoshi', name: 'Yoshi' },
  { id: 'toad', name: 'Toad' },
  { id: 'bowser', name: 'Bowser' },
  { id: 'link', name: 'Link' },
  { id: 'zelda', name: 'Zelda' },
  { id: 'samus', name: 'Samus' },
  { id: 'kirby', name: 'Kirby' },
  { id: 'pikachu', name: 'Pikachu' },
  { id: 'fox', name: 'Fox' },
  { id: 'falcon', name: 'C. Falcon' },
  { id: 'ness', name: 'Ness' },
  { id: 'banjo', name: 'Banjo' },
  { id: 'gamewatch', name: 'Mr. G&W' },
  { id: 'dk', name: 'DK' },
  { id: 'diddy', name: 'Diddy' },
];

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pixelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pixelRow: {
    flexDirection: 'row',
  },
  pixel: {
    // Tamanio dinamico
  },
  photo: {
    resizeMode: 'cover',
  },
  listItem: {
    width: 70,
    padding: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    marginHorizontal: 4,
    marginVertical: 4,
  },
  listItemName: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
});
