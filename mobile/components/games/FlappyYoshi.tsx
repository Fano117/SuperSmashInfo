import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { getHighscoreGlobal, guardarHighscore } from '@/services/api';

interface FlappyYoshiProps {
  visible: boolean;
  onClose: () => void;
  usuarioId?: string;
}

// Dimensiones responsivas basadas en el tamaño de pantalla
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(WINDOW_WIDTH * 0.85, 350); // Máximo 350px, 85% del ancho
const SCREEN_HEIGHT = Math.min(WINDOW_HEIGHT * 0.45, 400); // Máximo 400px, 45% del alto

const YOSHI_SIZE = 21;
const YOSHI_HITBOX = 12;
const PIPE_WIDTH = Math.max(40, SCREEN_WIDTH * 0.15); // Tuberías proporcionales
const PIPE_HITBOX_OFFSET = 10;
const PIPE_GAP = Math.max(120, SCREEN_HEIGHT * 0.32); // Gap proporcional al alto
const GRAVITY = 0.5;
const JUMP_FORCE = -9;
const BASE_PIPE_SPEED = 1.5;
const SPEED_INCREMENT = 0.3;
const MAX_PIPE_SPEED = 4;
// Intervalo de spawn: tiempo que tarda una tubería en cruzar la pantalla + espacio extra
// Con velocidad 1.5, una tubería tarda ~200 frames en cruzar 300px = ~3.3 segundos
// Agregamos espacio para que haya ~1.5 anchos de pantalla entre tuberías
const PIPE_SPAWN_INTERVAL = 3500; // 3.5 segundos - más espacio horizontal entre tuberías

// Colores del huevo de Yoshi (verde -> turquesa -> azul -> rojo -> amarillo)
const EGG_COLORS = ['#4CAF50', '#00BCD4', '#2196F3', '#F44336', '#FFEB3B'];

const PIXEL_SIZE = 2; // 30% más grande que 1.5

// Componente del huevo de Yoshi estilo pixel art exacto como en la imagen
const EGG_WIDTH = 11;
const EGG_HEIGHT = 13;

const YoshiEgg = ({ spotColor }: { spotColor: string }) => {
  // Mapa de pixeles del huevo (0=transparente, 1=negro/borde, 2=blanco, 3=mancha de color)
  // Basado exactamente en la imagen del huevo de Yoshi
  const eggPixelMap = [
    [0,0,0,1,1,1,1,1,0,0,0],      // Fila 1: borde superior
    [0,0,1,2,2,3,2,2,1,0,0],      // Fila 2
    [0,1,2,2,3,3,2,2,2,1,0],      // Fila 3
    [0,1,2,2,3,3,2,3,2,1,0],      // Fila 4
    [1,2,2,2,2,2,3,3,2,2,1],      // Fila 5
    [1,2,3,2,2,2,3,3,2,2,1],      // Fila 6
    [1,2,3,3,2,2,2,2,2,2,1],      // Fila 7
    [1,2,3,3,2,2,2,2,3,2,1],      // Fila 8
    [1,2,2,3,2,2,2,3,3,2,1],      // Fila 9
    [0,1,2,2,2,2,3,3,2,1,0],      // Fila 10
    [0,1,2,2,2,2,2,2,2,1,0],      // Fila 11
    [0,0,1,2,2,2,2,2,1,0,0],      // Fila 12
    [0,0,0,1,1,1,1,1,0,0,0],      // Fila 13: borde inferior
  ];

  const getPixelColor = (value: number) => {
    switch (value) {
      case 0: return 'transparent';
      case 1: return '#2D3436'; // Borde oscuro
      case 2: return '#FFFFFF';
      case 3: return spotColor;
      default: return 'transparent';
    }
  };

  return (
    <View style={{ width: EGG_WIDTH * PIXEL_SIZE, height: EGG_HEIGHT * PIXEL_SIZE }}>
      {eggPixelMap.map((row, rowIndex) => (
        <View key={rowIndex} style={{ flexDirection: 'row' }}>
          {row.map((pixel, colIndex) => (
            <View
              key={colIndex}
              style={{
                width: PIXEL_SIZE,
                height: PIXEL_SIZE,
                backgroundColor: getPixelColor(pixel),
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}


export default function FlappyYoshi({ visible, onClose, usuarioId }: FlappyYoshiProps) {
  const [yoshiY, setYoshiY] = useState(SCREEN_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [pipeSpeed, setPipeSpeed] = useState(BASE_PIPE_SPEED);
  const [eggColorIndex, setEggColorIndex] = useState(0);

  // Cargar highscore global del backend al abrir
  useEffect(() => {
    if (visible) {
      getHighscoreGlobal('flappy-yoshi')
        .then(data => {
          if (data && data.puntuacion > 0) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {
          // Si falla, mantener highscore local
        });
    }
  }, [visible]);

  // Guardar highscore cuando termina el juego
  useEffect(() => {
    if (gameOver && score > 0 && usuarioId) {
      guardarHighscore('flappy-yoshi', usuarioId, score)
        .then(data => {
          if (data && data.puntuacion > highScore) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {
          // Si falla, mantener highscore local
        });
    }
  }, [gameOver, score, usuarioId, highScore]);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pipeSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colorTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pipeSpeedRef = useRef(BASE_PIPE_SPEED);
  const velocityRef = useRef(velocity);
  const yoshiYRef = useRef(yoshiY);
  const scoreRef = useRef(score);
  const highScoreRef = useRef(highScore);
  const gameOverRef = useRef(gameOver);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    yoshiYRef.current = yoshiY;
  }, [yoshiY]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const resetGame = useCallback(() => {
    setYoshiY(SCREEN_HEIGHT / 2);
    setVelocity(0);
    velocityRef.current = 0;
    setPipes([]);
    setGameOver(false);
    setScore(0);
    setIsPaused(true);
    setPipeSpeed(BASE_PIPE_SPEED);
    pipeSpeedRef.current = BASE_PIPE_SPEED;
    setEggColorIndex(0);
  }, []);

  const jump = () => {
    if (gameOver) {
      resetGame();
      return;
    }
    if (isPaused) {
      setIsPaused(false);
      return;
    }
    setVelocity(JUMP_FORCE);
    velocityRef.current = JUMP_FORCE;
  };

  const spawnPipe = useCallback(() => {
    const minHeight = 50;
    const maxHeight = SCREEN_HEIGHT - PIPE_GAP - 50;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    setPipes(prev => [...prev, {
      x: SCREEN_WIDTH,
      topHeight,
      passed: false,
    }]);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOverRef.current || isPausedRef.current) return;

    // Update Yoshi position
    setVelocity(v => {
      const newV = v + GRAVITY;
      velocityRef.current = newV;
      return newV;
    });

    setYoshiY(y => {
      const newY = y + velocityRef.current;

      // Check floor/ceiling collision
      if (newY < 0 || newY > SCREEN_HEIGHT - YOSHI_SIZE) {
        setGameOver(true);
        if (scoreRef.current > highScoreRef.current) setHighScore(scoreRef.current);
        return y;
      }

      yoshiYRef.current = newY;
      return newY;
    });

    // Update pipes
    setPipes(prev => {
      const yoshiX = 50;
      // Usar hitbox más pequeña centrada en el sprite
      const hitboxOffset = (YOSHI_SIZE - YOSHI_HITBOX) / 2;
      const yoshiLeft = yoshiX + hitboxOffset;
      const yoshiRight = yoshiX + YOSHI_SIZE - hitboxOffset;
      const yoshiTop = yoshiYRef.current + hitboxOffset;
      const yoshiBottom = yoshiYRef.current + YOSHI_SIZE - hitboxOffset;

      return prev.map(pipe => {
        const newX = pipe.x - pipeSpeedRef.current;

        // Check collision (con hitbox reducida de las tuberías)
        const pipeLeft = newX + PIPE_HITBOX_OFFSET;
        const pipeRight = newX + PIPE_WIDTH - PIPE_HITBOX_OFFSET;
        const topPipeBottom = pipe.topHeight - PIPE_HITBOX_OFFSET;
        const bottomPipeTop = pipe.topHeight + PIPE_GAP + PIPE_HITBOX_OFFSET;

        if (yoshiRight > pipeLeft && yoshiLeft < pipeRight) {
          if (yoshiTop < topPipeBottom || yoshiBottom > bottomPipeTop) {
            setGameOver(true);
            if (scoreRef.current > highScoreRef.current) setHighScore(scoreRef.current);
          }
        }

        // Check if passed
        if (!pipe.passed && newX + PIPE_WIDTH < yoshiLeft) {
          setScore(s => s + 1);
          return { ...pipe, x: newX, passed: true };
        }

        return { ...pipe, x: newX };
      }).filter(pipe => pipe.x > -PIPE_WIDTH);
    });
  }, []);

  useEffect(() => {
    if (visible && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60);
      pipeSpawnRef.current = setInterval(spawnPipe, PIPE_SPAWN_INTERVAL);
      // Spawn first pipe immediately
      spawnPipe();

      // Timer para incrementar velocidad cada 30 segundos
      speedTimerRef.current = setInterval(() => {
        setPipeSpeed(speed => {
          const newSpeed = Math.min(speed + SPEED_INCREMENT, MAX_PIPE_SPEED);
          pipeSpeedRef.current = newSpeed;
          return newSpeed;
        });
      }, 30000);

      // Timer para cambiar color del huevo cada 10 segundos
      colorTimerRef.current = setInterval(() => {
        setEggColorIndex(idx => (idx + 1) % EGG_COLORS.length);
      }, 10000);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (pipeSpawnRef.current) clearInterval(pipeSpawnRef.current);
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
      if (colorTimerRef.current) clearInterval(colorTimerRef.current);
    };
  }, [visible, isPaused, gameOver, gameLoop, spawnPipe]);

  useEffect(() => {
    if (!visible) {
      resetGame();
    }
  }, [visible, resetGame]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.gameBoy}>
          <View style={styles.header}>
            <Text style={styles.brandText}>GAME & WATCH</Text>
            <Text style={styles.gameTitle}>FLAPPY YOSHI</Text>
          </View>

          <View style={styles.screenContainer}>
            <TouchableWithoutFeedback onPress={jump}>
              <View style={styles.screen}>
                {/* Score */}
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreText}>SCORE: {score}</Text>
                  <Text style={styles.scoreText}>SPD: {pipeSpeed.toFixed(1)}</Text>
                  <Text style={styles.scoreText}>HI: {highScore}</Text>
                </View>

                {/* Game Area */}
                <View style={styles.gameArea}>
                  {/* Sky background */}
                  <View style={styles.sky}>
                    {/* Clouds */}
                    <Text style={[styles.cloud, { top: 20, left: 30 }]}>☁️</Text>
                    <Text style={[styles.cloud, { top: 60, left: 150 }]}>☁️</Text>
                    <Text style={[styles.cloud, { top: 40, left: 250 }]}>☁️</Text>
                  </View>

                  {/* Pipes */}
                  {pipes.map((pipe, index) => (
                    <React.Fragment key={index}>
                      {/* Top pipe */}
                      <View style={[
                        styles.pipe,
                        styles.pipeTop,
                        { left: pipe.x, height: pipe.topHeight }
                      ]}>
                        <Text style={styles.pipeEmoji}>🟩</Text>
                        <View style={styles.pipeCapTop} />
                      </View>
                      {/* Bottom pipe */}
                      <View style={[
                        styles.pipe,
                        styles.pipeBottom,
                        {
                          left: pipe.x,
                          top: pipe.topHeight + PIPE_GAP,
                          height: SCREEN_HEIGHT - pipe.topHeight - PIPE_GAP - 40
                        }
                      ]}>
                        <View style={styles.pipeCapBottom} />
                      </View>
                    </React.Fragment>
                  ))}

                  {/* Yoshi Egg */}
                  <View style={[styles.yoshi, { top: yoshiY }]}>
                    <YoshiEgg spotColor={EGG_COLORS[eggColorIndex]} />
                  </View>

                  {/* Ground */}
                  <View style={styles.ground}>
                    <Text style={styles.groundText}>🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫🟫</Text>
                  </View>
                </View>

                {/* Messages */}
                {(gameOver || isPaused) && (
                  <View style={styles.messageOverlay}>
                    <Text style={styles.messageText}>
                      {gameOver ? 'GAME OVER' : 'TAP TO START'}
                    </Text>
                    {gameOver && <Text style={styles.finalScore}>SCORE: {score}</Text>}
                    <Text style={styles.hint}>
                      {gameOver ? 'TAP TO RETRY' : 'TAP TO JUMP'}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕ CERRAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBoy: {
    backgroundColor: '#8b956d',
    borderRadius: 20,
    padding: 12,
    borderWidth: 4,
    borderColor: '#5c6650',
    maxWidth: WINDOW_WIDTH * 0.95,
    maxHeight: WINDOW_HEIGHT * 0.85,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandText: {
    fontSize: 10,
    color: '#4a5240',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  gameTitle: {
    fontSize: 14,
    color: '#2d3425',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  screenContainer: {
    backgroundColor: '#4a5240',
    padding: 8,
    borderRadius: 4,
  },
  screen: {
    backgroundColor: '#87CEEB',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    overflow: 'hidden',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 100,
  },
  scoreText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  sky: {
    ...StyleSheet.absoluteFillObject,
  },
  cloud: {
    position: 'absolute',
    fontSize: 30,
  },
  yoshi: {
    position: 'absolute',
    left: 50,
    width: EGG_WIDTH * PIXEL_SIZE,
    height: EGG_HEIGHT * PIXEL_SIZE,
  },
  pipe: {
    position: 'absolute',
    width: PIPE_WIDTH,
    backgroundColor: '#2d8b2d',
    borderWidth: 3,
    borderColor: '#1a5c1a',
  },
  pipeTop: {
    top: 0,
    justifyContent: 'flex-end',
  },
  pipeBottom: {
    justifyContent: 'flex-start',
  },
  pipeCapTop: {
    height: 20,
    backgroundColor: '#3da33d',
    marginHorizontal: -5,
    marginBottom: -3,
    borderWidth: 3,
    borderColor: '#1a5c1a',
  },
  pipeCapBottom: {
    height: 20,
    backgroundColor: '#3da33d',
    marginHorizontal: -5,
    marginTop: -3,
    borderWidth: 3,
    borderColor: '#1a5c1a',
  },
  pipeEmoji: {
    display: 'none',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  groundText: {
    fontSize: 20,
  },
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 2,
  },
  finalScore: {
    fontSize: 18,
    color: '#ffd700',
    marginTop: 10,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 20,
  },
  closeBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#2d3425',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
