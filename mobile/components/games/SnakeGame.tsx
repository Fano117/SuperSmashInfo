import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { getHighscoreGlobal, guardarHighscore } from '@/services/api';

interface SnakeGameProps {
  visible: boolean;
  onClose: () => void;
  usuarioId?: string;
}

const GRID_SIZE = 15;
const CELL_SIZE = Math.floor((Dimensions.get('window').width - 80) / GRID_SIZE);

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

export default function SnakeGame({ visible, onClose, usuarioId }: SnakeGameProps) {
  const [snake, setSnake] = useState<Position[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar highscore global del backend al abrir
  useEffect(() => {
    if (visible) {
      getHighscoreGlobal('snake')
        .then(data => {
          if (data && data.puntuacion > 0) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {});
    }
  }, [visible]);

  // Guardar highscore cuando termina el juego
  useEffect(() => {
    if (gameOver && score > 0 && usuarioId) {
      guardarHighscore('snake', usuarioId, score)
        .then(data => {
          if (data && data.puntuacion > highScore) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {});
    }
  }, [gameOver, score, usuarioId, highScore]);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood({ x: 5, y: 5 });
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setIsPaused(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };

      switch (directionRef.current) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      // Check self collision
      if (prevSnake.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [head, ...prevSnake];

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood());
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameOver, isPaused, food, generateFood, score, highScore]);

  useEffect(() => {
    if (visible && !isPaused && !gameOver) {
      gameLoopRef.current = setInterval(moveSnake, 150);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [visible, isPaused, gameOver, moveSnake]);

  const handleDirection = (newDirection: Direction) => {
    const opposites: Record<Direction, Direction> = {
      UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT'
    };
    if (opposites[newDirection] !== directionRef.current) {
      directionRef.current = newDirection;
      setDirection(newDirection);
    }
  };

  const startGame = () => {
    if (gameOver) resetGame();
    setIsPaused(false);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.gameBoy}>
          {/* Game Boy Header */}
          <View style={styles.header}>
            <Text style={styles.brandText}>GAME & WATCH</Text>
            <Text style={styles.gameTitle}>SNAKE</Text>
          </View>

          {/* Screen */}
          <View style={styles.screenContainer}>
            <View style={styles.screen}>
              {/* Score */}
              <View style={styles.scoreRow}>
                <Text style={styles.scoreText}>SCORE: {score}</Text>
                <Text style={styles.scoreText}>HI: {highScore}</Text>
              </View>

              {/* Grid */}
              <View style={styles.grid}>
                {Array.from({ length: GRID_SIZE }).map((_, y) => (
                  <View key={y} style={styles.row}>
                    {Array.from({ length: GRID_SIZE }).map((_, x) => {
                      const isSnake = snake.some(s => s.x === x && s.y === y);
                      const isHead = snake[0].x === x && snake[0].y === y;
                      const isFood = food.x === x && food.y === y;

                      return (
                        <View
                          key={x}
                          style={[
                            styles.cell,
                            isSnake && styles.snakeCell,
                            isHead && styles.snakeHead,
                            isFood && styles.foodCell,
                          ]}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Game Over / Start */}
              {(gameOver || isPaused) && (
                <View style={styles.messageOverlay}>
                  <Text style={styles.messageText}>
                    {gameOver ? 'GAME OVER' : 'PRESS START'}
                  </Text>
                  {gameOver && <Text style={styles.finalScore}>SCORE: {score}</Text>}
                </View>
              )}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* D-Pad */}
            <View style={styles.dpad}>
              <TouchableOpacity style={[styles.dpadBtn, styles.dpadUp]} onPress={() => handleDirection('UP')}>
                <Text style={styles.dpadText}>▲</Text>
              </TouchableOpacity>
              <View style={styles.dpadMiddle}>
                <TouchableOpacity style={[styles.dpadBtn, styles.dpadLeft]} onPress={() => handleDirection('LEFT')}>
                  <Text style={styles.dpadText}>◀</Text>
                </TouchableOpacity>
                <View style={styles.dpadCenter} />
                <TouchableOpacity style={[styles.dpadBtn, styles.dpadRight]} onPress={() => handleDirection('RIGHT')}>
                  <Text style={styles.dpadText}>▶</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.dpadBtn, styles.dpadDown]} onPress={() => handleDirection('DOWN')}>
                <Text style={styles.dpadText}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.actionBtn} onPress={startGame}>
                <Text style={styles.actionBtnText}>START</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Close Button */}
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
    fontSize: 16,
    color: '#2d3425',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  screenContainer: {
    backgroundColor: '#4a5240',
    padding: 8,
    borderRadius: 4,
  },
  screen: {
    backgroundColor: '#9bbc0f',
    padding: 8,
    width: GRID_SIZE * CELL_SIZE + 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 10,
    color: '#0f380f',
    fontWeight: 'bold',
  },
  grid: {
    borderWidth: 2,
    borderColor: '#0f380f',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#9bbc0f',
    borderWidth: 0.5,
    borderColor: '#8bac0f',
  },
  snakeCell: {
    backgroundColor: '#0f380f',
  },
  snakeHead: {
    backgroundColor: '#306230',
  },
  foodCell: {
    backgroundColor: '#0f380f',
    borderRadius: CELL_SIZE / 2,
  },
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(155, 188, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 18,
    color: '#0f380f',
    fontWeight: 'bold',
  },
  finalScore: {
    fontSize: 14,
    color: '#0f380f',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 10,
  },
  dpad: {
    alignItems: 'center',
  },
  dpadBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3425',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dpadUp: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  dpadDown: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  dpadLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dpadRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  dpadMiddle: {
    flexDirection: 'row',
  },
  dpadCenter: {
    width: 40,
    height: 40,
    backgroundColor: '#2d3425',
  },
  dpadText: {
    color: '#8b956d',
    fontSize: 16,
  },
  actionBtns: {
    alignItems: 'center',
  },
  actionBtn: {
    backgroundColor: '#2d3425',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  actionBtnText: {
    color: '#8b956d',
    fontSize: 12,
    fontWeight: 'bold',
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
