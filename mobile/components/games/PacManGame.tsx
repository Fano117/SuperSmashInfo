import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { getHighscoreGlobal, guardarHighscore } from '@/services/api';

interface PacManGameProps {
  visible: boolean;
  onClose: () => void;
  usuarioId?: string;
}

const CELL_SIZE = 15;
const LEVELS = [
  // Level 1 - Classic simple maze
  [
    '#####################',
    '#o........#........o#',
    '#.###.###.#.###.###.#',
    '#.###.###.#.###.###.#',
    '#...................#',
    '#.###.#.#####.#.###.#',
    '#.....#...#...#.....#',
    '#####.###.#.###.#####',
    '#####.#.......#.#####',
    '#..... .G...G. .....#',
    '#.###.#########.###.#',
    '#.....#.......#.....#',
    '#####.#...P...#.#####',
    '#####.#.#####.#.#####',
    '#...................#',
    '#.###.#.#####.#.###.#',
    '#o..#.....#.....#..o#',
    '###.#.#.#.#.#.#.#.###',
    '#...................#',
    '#####################',
  ],
  // Level 2 - Medium difficulty
  [
    '#####################',
    '#o.................o#',
    '#.##.###.#.###.##.#.#',
    '#.#......#......#...#',
    '#.#.####.#.####.#.#.#',
    '#...................#',
    '#.###.#.###.#.###.#.#',
    '#.....#.....#.....#.#',
    '#.###.#.G.G.#.###.#.#',
    '#.....#.....#.....#.#',
    '#.###.#.###.#.###.#.#',
    '#.#...#...P...#...#.#',
    '#.#.#.#.#####.#.#.#.#',
    '#...#.....#.....#...#',
    '#.###.###.#.###.###.#',
    '#...................#',
    '#.#.###.#.#.###.#.#.#',
    '#.#.....#.#.....#.#.#',
    '#o.................o#',
    '#####################',
  ],
  // Level 3 - Hard maze
  [
    '#####################',
    '#o.................o#',
    '#.#.###.###.###.#.#.#',
    '#.#.#.....#.....#.#.#',
    '#.#.#.###.#.###.#.#.#',
    '#...................#',
    '###.#.#.###.#.#.###.#',
    '#...#.#.....#.#.....#',
    '#.###.#.G.G.#.#.###.#',
    '#.....#.....#.#.....#',
    '#.###.#.###.#.#.###.#',
    '#...#.#..P..#.#.#...#',
    '#.#.#.#.###.#.#.#.#.#',
    '#.#.....#.#.....#.#.#',
    '#.#.###.#.#.###.#.#.#',
    '#...................#',
    '#.###.#.###.#.###.#.#',
    '#.....#.....#.....#.#',
    '#o.................o#',
    '#####################',
  ],
];

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

interface Ghost {
  pos: Position;
  direction: Direction;
  scared: boolean;
  color: string;
}

const GHOST_COLORS = ['#ff0000', '#00ffff', '#ffb8ff', '#ffb852'];

export default function PacManGame({ visible, onClose, usuarioId }: PacManGameProps) {
  const [level, setLevel] = useState(0);
  const [maze, setMaze] = useState<string[]>([]);
  const [pacman, setPacman] = useState<Position>({ x: 10, y: 15 });
  const [pacmanDir, setPacmanDir] = useState<Direction>('RIGHT');
  const [ghosts, setGhosts] = useState<Ghost[]>([]);
  const [dots, setDots] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [powerMode, setPowerMode] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [powerPelletBlink, setPowerPelletBlink] = useState(true);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef(pacmanDir);

  // Parpadeo de power pellets
  useEffect(() => {
    if (visible) {
      blinkTimerRef.current = setInterval(() => {
        setPowerPelletBlink(b => !b);
      }, 300);
    }
    return () => {
      if (blinkTimerRef.current) clearInterval(blinkTimerRef.current);
    };
  }, [visible]);

  // Cargar highscore global del backend al abrir
  useEffect(() => {
    if (visible) {
      getHighscoreGlobal('pacman')
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
      guardarHighscore('pacman', usuarioId, score)
        .then(data => {
          if (data && data.puntuacion > highScore) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {});
    }
  }, [gameOver, score, usuarioId, highScore]);

  const initLevel = useCallback((lvl: number) => {
    const levelMaze = LEVELS[lvl];
    setMaze(levelMaze);

    const newDots = new Set<string>();
    let pacPos = { x: 10, y: 15 };
    const ghostPositions: Position[] = [];

    levelMaze.forEach((row, y) => {
      row.split('').forEach((cell, x) => {
        if (cell === '.' || cell === 'o') {
          newDots.add(`${x},${y}`);
        }
        if (cell === 'P') {
          pacPos = { x, y };
        }
        if (cell === 'G') {
          ghostPositions.push({ x, y });
        }
      });
    });

    setDots(newDots);
    setPacman(pacPos);
    setPacmanDir('RIGHT');
    directionRef.current = 'RIGHT';
    setGhosts(ghostPositions.map((pos, i) => ({
      pos,
      direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as Direction,
      scared: false,
      color: GHOST_COLORS[i % GHOST_COLORS.length],
    })));
    setLevelComplete(false);
  }, []);

  useEffect(() => {
    if (visible) {
      initLevel(level);
    }
  }, [visible, level, initLevel]);

  const isWall = useCallback((x: number, y: number): boolean => {
    if (y < 0 || y >= maze.length) return true;
    const row = maze[y];
    if (x < 0 || x >= row.length) return true;
    return row[x] === '#';
  }, [maze]);

  const moveGhost = useCallback((ghost: Ghost): Ghost => {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    const moves: Record<Direction, Position> = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 },
    };

    // Try current direction first
    const move = moves[ghost.direction];
    let newX = ghost.pos.x + move.x;
    let newY = ghost.pos.y + move.y;

    if (!isWall(newX, newY)) {
      // Occasionally change direction
      if (Math.random() < 0.1) {
        const validDirs = directions.filter(d => {
          const m = moves[d];
          return !isWall(ghost.pos.x + m.x, ghost.pos.y + m.y);
        });
        if (validDirs.length > 0) {
          ghost.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
        }
      }
      return { ...ghost, pos: { x: newX, y: newY } };
    }

    // Pick new random direction
    const validDirs = directions.filter(d => {
      const m = moves[d];
      return !isWall(ghost.pos.x + m.x, ghost.pos.y + m.y);
    });

    if (validDirs.length > 0) {
      const newDir = validDirs[Math.floor(Math.random() * validDirs.length)];
      const newMove = moves[newDir];
      return {
        ...ghost,
        pos: { x: ghost.pos.x + newMove.x, y: ghost.pos.y + newMove.y },
        direction: newDir,
      };
    }

    return ghost;
  }, [isWall]);

  const gameLoop = useCallback(() => {
    if (gameOver || isPaused || levelComplete) return;

    // Animate mouth
    setMouthOpen(m => !m);

    // Move Pacman
    const moves: Record<Direction, Position> = {
      UP: { x: 0, y: -1 },
      DOWN: { x: 0, y: 1 },
      LEFT: { x: -1, y: 0 },
      RIGHT: { x: 1, y: 0 },
    };

    const move = moves[directionRef.current];
    let pacmanX = pacman.x;
    let pacmanY = pacman.y;
    const newX = pacman.x + move.x;
    const newY = pacman.y + move.y;

    if (!isWall(newX, newY)) {
      pacmanX = newX;
      pacmanY = newY;
      setPacman({ x: newX, y: newY });

      // Check dot
      const dotKey = `${newX},${newY}`;
      if (dots.has(dotKey)) {
        const isPowerPellet = maze[newY]?.[newX] === 'o';
        setDots(prev => {
          const newDots = new Set(prev);
          newDots.delete(dotKey);

          // Check level complete
          if (newDots.size === 0) {
            setLevelComplete(true);
            if (level < LEVELS.length - 1) {
              setTimeout(() => {
                setLevel(l => l + 1);
              }, 2000);
            } else {
              setGameOver(true);
            }
          }

          return newDots;
        });

        setScore(s => s + (isPowerPellet ? 50 : 10));

        if (isPowerPellet) {
          setPowerMode(true);
          setGhosts(prev => prev.map(g => ({ ...g, scared: true })));
          if (powerTimerRef.current) clearTimeout(powerTimerRef.current);
          powerTimerRef.current = setTimeout(() => {
            setPowerMode(false);
            setGhosts(prev => prev.map(g => ({ ...g, scared: false })));
          }, 5000);
        }
      }
    }

    // Move ghosts and check collision in one operation
    setGhosts(prev => {
      const movedGhosts = prev.map(moveGhost);
      let collisionHandled = false;

      // Check collision with each ghost
      for (let i = 0; i < movedGhosts.length; i++) {
        const ghost = movedGhosts[i];
        const prevGhost = prev[i];

        // Check if ghost is at pacman's position (exact match)
        const ghostAtPacman = ghost.pos.x === pacmanX && ghost.pos.y === pacmanY;
        const prevGhostAtPacman = prevGhost.pos.x === pacmanX && prevGhost.pos.y === pacmanY;

        // Also check if they crossed paths (pacman moved to where ghost was, ghost moved to where pacman was)
        const crossedPaths = (prevGhost.pos.x === pacmanX && prevGhost.pos.y === pacmanY) ||
                            (ghost.pos.x === pacman.x && ghost.pos.y === pacman.y);

        if ((ghostAtPacman || prevGhostAtPacman || crossedPaths) && !collisionHandled) {
          collisionHandled = true;

          if (powerMode) {
            setScore(s => s + 200);
            movedGhosts[i] = { ...ghost, pos: { x: 10, y: 9 } };
          } else {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameOver(true);
              } else {
                setTimeout(() => initLevel(level), 100);
              }
              return newLives;
            });
          }
        }
      }

      return movedGhosts;
    });
  }, [gameOver, isPaused, levelComplete, pacman, dots, maze, isWall, powerMode, moveGhost, level, initLevel]);

  useEffect(() => {
    if (visible && !isPaused && !gameOver && !levelComplete) {
      gameLoopRef.current = setInterval(gameLoop, 200);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [visible, isPaused, gameOver, levelComplete, gameLoop]);

  const handleDirection = (dir: Direction) => {
    directionRef.current = dir;
    setPacmanDir(dir);
  };

  const resetGame = () => {
    setLevel(0);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setPowerMode(false);
    setIsPaused(true);
    initLevel(0);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPaused(false);
  };

  if (!visible) return null;

  // Determinar si una celda de pared tiene vecinos para dibujar bordes
  const getWallStyle = (x: number, y: number) => {
    const row = maze[y] || '';
    const isCurrentWall = row[x] === '#';
    if (!isCurrentWall) return null;

    const hasTop = y > 0 && (maze[y - 1]?.[x] === '#');
    const hasBottom = y < maze.length - 1 && (maze[y + 1]?.[x] === '#');
    const hasLeft = x > 0 && row[x - 1] === '#';
    const hasRight = x < row.length - 1 && row[x + 1] === '#';

    return {
      borderTopWidth: hasTop ? 0 : 2,
      borderBottomWidth: hasBottom ? 0 : 2,
      borderLeftWidth: hasLeft ? 0 : 2,
      borderRightWidth: hasRight ? 0 : 2,
    };
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.gameBoy}>
          <View style={styles.header}>
            <Text style={styles.brandText}>GAME & WATCH</Text>
            <Text style={styles.gameTitle}>PAC-MAN</Text>
          </View>

          <View style={styles.screenContainer}>
            <View style={styles.screen}>
              {/* HUD */}
              <View style={styles.hud}>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>LEVEL</Text>
                  <Text style={styles.hudValue}>{level + 1}</Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>SCORE</Text>
                  <Text style={styles.hudValue}>{score}</Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>HIGH</Text>
                  <Text style={styles.hudValue}>{highScore}</Text>
                </View>
                <View style={styles.hudItem}>
                  <Text style={styles.hudLabel}>LIVES</Text>
                  <Text style={styles.hudLives}>{'🟡'.repeat(lives)}</Text>
                </View>
              </View>

              {/* Maze */}
              <View style={styles.maze}>
                {maze.map((row, y) => (
                  <View key={y} style={styles.mazeRow}>
                    {row.split('').map((cell, x) => {
                      const isPacman = pacman.x === x && pacman.y === y;
                      const ghost = ghosts.find(g => g.pos.x === x && g.pos.y === y);
                      const hasDot = dots.has(`${x},${y}`);
                      const isPowerPellet = cell === 'o' && hasDot;
                      const isWallCell = cell === '#';
                      const isPath = cell !== '#' && cell !== ' ';
                      const wallBorders = getWallStyle(x, y);

                      return (
                        <View
                          key={x}
                          style={[
                            styles.cell,
                            isPath && styles.path,
                            isWallCell && styles.wall,
                            isWallCell && wallBorders,
                          ]}
                        >
                          {isPacman && (
                            <View style={[
                              styles.pacmanContainer,
                              pacmanDir === 'LEFT' && styles.pacmanLeft,
                              pacmanDir === 'UP' && styles.pacmanUp,
                              pacmanDir === 'DOWN' && styles.pacmanDown,
                            ]}>
                              <View style={styles.pacmanBody}>
                                {mouthOpen && <View style={styles.pacmanMouth} />}
                                <View style={styles.pacmanEye} />
                              </View>
                            </View>
                          )}
                          {ghost && (
                            <View style={[
                              styles.ghostContainer,
                              { backgroundColor: ghost.scared ? '#2121de' : ghost.color }
                            ]}>
                              <View style={styles.ghostEyes}>
                                <View style={styles.ghostEye}>
                                  <View style={styles.ghostPupil} />
                                </View>
                                <View style={styles.ghostEye}>
                                  <View style={styles.ghostPupil} />
                                </View>
                              </View>
                              <View style={styles.ghostBottom}>
                                <View style={styles.ghostWave} />
                                <View style={styles.ghostWave} />
                                <View style={styles.ghostWave} />
                              </View>
                            </View>
                          )}
                          {!isPacman && !ghost && hasDot && !isPowerPellet && (
                            <View style={styles.dot} />
                          )}
                          {!isPacman && !ghost && isPowerPellet && (
                            <View style={[
                              styles.powerPellet,
                              powerPelletBlink && styles.powerPelletBlink
                            ]} />
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>

              {/* Messages */}
              {(gameOver || isPaused || levelComplete) && (
                <View style={styles.messageOverlay}>
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>
                      {gameOver ? (level >= LEVELS.length - 1 && lives > 0 ? '🏆 YOU WIN!' : '💀 GAME OVER') :
                       levelComplete ? `✨ LEVEL ${level + 1} COMPLETE!` : '🕹️ PRESS START'}
                    </Text>
                    {gameOver && <Text style={styles.messageScore}>FINAL SCORE: {score}</Text>}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
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

            <TouchableOpacity style={styles.startBtn} onPress={startGame}>
              <Text style={styles.startBtnText}>START</Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameBoy: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 15,
    borderWidth: 4,
    borderColor: '#0f0f1a',
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  brandText: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  gameTitle: {
    fontSize: 18,
    color: '#ffff00',
    fontWeight: 'bold',
    letterSpacing: 4,
    textShadowColor: '#ff0',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  screenContainer: {
    backgroundColor: '#000',
    padding: 6,
    borderRadius: 4,
    borderWidth: 3,
    borderColor: '#333',
  },
  screen: {
    backgroundColor: '#000',
    padding: 4,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: '#111',
    borderRadius: 2,
  },
  hudItem: {
    alignItems: 'center',
  },
  hudLabel: {
    color: '#888',
    fontSize: 8,
    fontWeight: 'bold',
  },
  hudValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hudLives: {
    fontSize: 10,
  },
  maze: {
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 2,
  },
  mazeRow: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  path: {
    backgroundColor: '#0a0a1a',
  },
  wall: {
    backgroundColor: '#1a1aff',
    borderColor: '#4a4aff',
  },
  // Pacman styles
  pacmanContainer: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pacmanBody: {
    width: CELL_SIZE - 2,
    height: CELL_SIZE - 2,
    backgroundColor: '#ffff00',
    borderRadius: CELL_SIZE,
    overflow: 'hidden',
  },
  pacmanMouth: {
    position: 'absolute',
    right: -1,
    top: '50%',
    marginTop: -5,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: '#0a0a1a',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  pacmanEye: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 3,
    height: 3,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  pacmanLeft: {
    transform: [{ rotate: '180deg' }],
  },
  pacmanUp: {
    transform: [{ rotate: '-90deg' }],
  },
  pacmanDown: {
    transform: [{ rotate: '90deg' }],
  },
  // Ghost styles
  ghostContainer: {
    width: CELL_SIZE - 3,
    height: CELL_SIZE - 2,
    borderTopLeftRadius: CELL_SIZE / 2,
    borderTopRightRadius: CELL_SIZE / 2,
    overflow: 'hidden',
  },
  ghostEyes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 2,
    marginTop: 2,
  },
  ghostEye: {
    width: 4,
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ghostPupil: {
    width: 2,
    height: 2,
    backgroundColor: '#00f',
    borderRadius: 1,
  },
  ghostBottom: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  ghostWave: {
    flex: 1,
    height: 3,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  // Dots
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#ffb897',
  },
  powerPellet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffb897',
  },
  powerPelletBlink: {
    backgroundColor: '#fff',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  // Messages
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: '#1a1a2e',
    padding: 20,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#ffff00',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#ffff00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  messageScore: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
  },
  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 20,
  },
  dpad: {
    alignItems: 'center',
  },
  dpadBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a3e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3a3a4e',
  },
  dpadUp: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 0,
  },
  dpadDown: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 0,
  },
  dpadLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderRightWidth: 0,
  },
  dpadRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 0,
  },
  dpadMiddle: {
    flexDirection: 'row',
  },
  dpadCenter: {
    width: 40,
    height: 40,
    backgroundColor: '#2a2a3e',
    borderWidth: 2,
    borderColor: '#3a3a4e',
  },
  dpadText: {
    color: '#aaa',
    fontSize: 16,
  },
  startBtn: {
    backgroundColor: '#ff0000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#aa0000',
  },
  startBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  closeBtn: {
    marginTop: 15,
    alignItems: 'center',
    padding: 8,
  },
  closeBtnText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
