import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';

interface PacManGameProps {
  visible: boolean;
  onClose: () => void;
}

const CELL_SIZE = 16;
const LEVELS = [
  // Level 1 - Simple maze
  [
    '#####################',
    '#.........#.........#',
    '#.###.###.#.###.###.#',
    '#o#...#.....#...#.o#',
    '#.#.#.#.###.#.#.#.#.#',
    '#...#.....#.....#...#',
    '###.#####.#.#####.###',
    '###.#.....#.....#.###',
    '#.....###.#.###.....#',
    '#.###.# G G #.###.#',
    '#.#...#######...#.#.#',
    '#.#.#.........#.#.#.#',
    '#...#.#######.#.....#',
    '###.#.#.....#.#.###.#',
    '#.....#.###.#.......#',
    '#.#####.#P#.#####.#.#',
    '#...................#',
    '#.###.#.#####.#.###.#',
    '#o..#...........#..o#',
    '#####################',
  ],
  // Level 2 - More complex
  [
    '#####################',
    '#o........#........o#',
    '#.##.####.#.####.##.#',
    '#...................#',
    '#.##.#.#####.#.##.#.#',
    '#....#...#...#......#',
    '####.###.#.###.#####',
    '   #.#.......#.#    ',
    '####.#.## ##.#.#####',
    '#......# G #.......#',
    '####.#.#####.#.#####',
    '   #.#...P...#.#    ',
    '####.#.#####.#.#####',
    '#.........#.........#',
    '#.##.####.#.####.##.#',
    '#..#...........#....#',
    '##.#.#.#####.#.#.##.#',
    '#....#...#...#......#',
    '#o##...#.#.#...##..o#',
    '#####################',
  ],
  // Level 3 - Final challenge
  [
    '#####################',
    '#o.................o#',
    '#.###.#######.###.#.#',
    '#.#.......#.......#.#',
    '#.#.#####.#.#####.#.#',
    '#...#.....#.....#...#',
    '#.#.#.#########.#.#.#',
    '#.#...#...#...#...#.#',
    '#.#####.#.#.#.#####.#',
    '#.......#G G#.......#',
    '#.#####.#####.#####.#',
    '#.#...#...P...#...#.#',
    '#.#.#.#########.#.#.#',
    '#...#.....#.....#...#',
    '#.#.#####.#.#####.#.#',
    '#.#.......#.......#.#',
    '#.###.#######.###.#.#',
    '#...................#',
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
}

export default function PacManGame({ visible, onClose }: PacManGameProps) {
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

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const directionRef = useRef(pacmanDir);

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
    setGhosts(ghostPositions.map(pos => ({
      pos,
      direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as Direction,
      scared: false,
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
    const newX = pacman.x + move.x;
    const newY = pacman.y + move.y;

    if (!isWall(newX, newY)) {
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

    // Move ghosts
    setGhosts(prev => prev.map(moveGhost));

    // Check ghost collision
    setGhosts(prev => {
      let newGhosts = [...prev];
      newGhosts.forEach((ghost, i) => {
        if (Math.abs(ghost.pos.x - newX) <= 0.5 && Math.abs(ghost.pos.y - newY) <= 0.5) {
          if (powerMode) {
            setScore(s => s + 200);
            newGhosts[i] = { ...ghost, pos: { x: 10, y: 9 } };
          } else {
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameOver(true);
              } else {
                initLevel(level);
              }
              return newLives;
            });
          }
        }
      });
      return newGhosts;
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

  const getPacmanChar = () => {
    if (!mouthOpen) return '●';
    switch (pacmanDir) {
      case 'RIGHT': return '>';
      case 'LEFT': return '<';
      case 'UP': return '∧';
      case 'DOWN': return '∨';
    }
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
                <Text style={styles.hudText}>LVL:{level + 1}</Text>
                <Text style={styles.hudText}>SCORE:{score}</Text>
                <Text style={styles.hudText}>{'❤️'.repeat(lives)}</Text>
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

                      return (
                        <View key={x} style={[styles.cell, cell === '#' && styles.wall]}>
                          {isPacman && (
                            <Text style={styles.pacman}>{getPacmanChar()}</Text>
                          )}
                          {ghost && (
                            <Text style={[styles.ghost, ghost.scared && styles.scaredGhost]}>
                              {ghost.scared ? '👻' : '👾'}
                            </Text>
                          )}
                          {!isPacman && !ghost && hasDot && (
                            <View style={[styles.dot, isPowerPellet && styles.powerPellet]} />
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
                  <Text style={styles.messageText}>
                    {gameOver ? (level >= LEVELS.length - 1 && lives > 0 ? 'YOU WIN!' : 'GAME OVER') :
                     levelComplete ? `LEVEL ${level + 1} COMPLETE!` : 'PRESS START'}
                  </Text>
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
    backgroundColor: 'rgba(0,0,0,0.9)',
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
    fontSize: 16,
    color: '#ffff00',
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  screenContainer: {
    backgroundColor: '#000',
    padding: 4,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#333',
  },
  screen: {
    backgroundColor: '#000',
    padding: 4,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  hudText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  maze: {
    alignItems: 'center',
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
  wall: {
    backgroundColor: '#2121de',
    borderWidth: 1,
    borderColor: '#5555ff',
  },
  pacman: {
    color: '#ffff00',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ghost: {
    fontSize: 12,
  },
  scaredGhost: {
    opacity: 0.7,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ffb8ae',
  },
  powerPellet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffb8ae',
  },
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#ffff00',
    fontWeight: 'bold',
  },
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
    width: 35,
    height: 35,
    backgroundColor: '#333',
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
    width: 35,
    height: 35,
    backgroundColor: '#333',
  },
  dpadText: {
    color: '#888',
    fontSize: 14,
  },
  startBtn: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  startBtnText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 15,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#666',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
