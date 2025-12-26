import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, TouchableWithoutFeedback } from 'react-native';

interface FlappyYoshiProps {
  visible: boolean;
  onClose: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width - 80;
const SCREEN_HEIGHT = 400;
const YOSHI_SIZE = 30;
const PIPE_WIDTH = 50;
const PIPE_GAP = 120;
const GRAVITY = 0.6;
const JUMP_FORCE = -10;
const PIPE_SPEED = 3;

interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export default function FlappyYoshi({ visible, onClose }: FlappyYoshiProps) {
  const [yoshiY, setYoshiY] = useState(SCREEN_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState(0);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pipeSpawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const velocityRef = useRef(velocity);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  const resetGame = useCallback(() => {
    setYoshiY(SCREEN_HEIGHT / 2);
    setVelocity(0);
    velocityRef.current = 0;
    setPipes([]);
    setGameOver(false);
    setScore(0);
    setIsPaused(true);
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
    if (gameOver || isPaused) return;

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
        if (score > highScore) setHighScore(score);
        return y;
      }

      return newY;
    });

    // Update pipes
    setPipes(prev => {
      const yoshiX = 50;
      const yoshiRight = yoshiX + YOSHI_SIZE;
      const yoshiTop = yoshiY;
      const yoshiBottom = yoshiY + YOSHI_SIZE;

      return prev.map(pipe => {
        const newX = pipe.x - PIPE_SPEED;

        // Check collision
        const pipeLeft = newX;
        const pipeRight = newX + PIPE_WIDTH;
        const topPipeBottom = pipe.topHeight;
        const bottomPipeTop = pipe.topHeight + PIPE_GAP;

        if (yoshiRight > pipeLeft && yoshiX < pipeRight) {
          if (yoshiTop < topPipeBottom || yoshiBottom > bottomPipeTop) {
            setGameOver(true);
            if (score > highScore) setHighScore(score);
          }
        }

        // Check if passed
        if (!pipe.passed && newX + PIPE_WIDTH < yoshiX) {
          setScore(s => s + 1);
          return { ...pipe, x: newX, passed: true };
        }

        return { ...pipe, x: newX };
      }).filter(pipe => pipe.x > -PIPE_WIDTH);
    });
  }, [gameOver, isPaused, yoshiY, score, highScore]);

  useEffect(() => {
    if (visible && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(gameLoop, 1000 / 60);
      pipeSpawnRef.current = setInterval(spawnPipe, 2000);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (pipeSpawnRef.current) clearInterval(pipeSpawnRef.current);
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

                  {/* Yoshi */}
                  <View style={[styles.yoshi, { top: yoshiY }]}>
                    <Text style={styles.yoshiEmoji}>🦖</Text>
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
    padding: 15,
    borderWidth: 4,
    borderColor: '#5c6650',
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
    width: YOSHI_SIZE,
    height: YOSHI_SIZE,
  },
  yoshiEmoji: {
    fontSize: 28,
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
