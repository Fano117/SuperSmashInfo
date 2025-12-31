import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal } from 'react-native';
import { getHighscoreGlobal, guardarHighscore } from '@/services/api';

interface TetrisGameProps {
  visible: boolean;
  onClose: () => void;
  usuarioId?: string;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

// Dimensiones responsivas
const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
// Calcular tamaño de celda basado en el espacio disponible
// Dejamos espacio para stats (70px) y padding
const AVAILABLE_WIDTH = Math.min(WINDOW_WIDTH * 0.75, 280) - 70;
const AVAILABLE_HEIGHT = Math.min(WINDOW_HEIGHT * 0.5, 380);
// Usar el menor para que quepa en pantalla
const CELL_SIZE = Math.min(
  Math.floor(AVAILABLE_WIDTH / BOARD_WIDTH),
  Math.floor(AVAILABLE_HEIGHT / BOARD_HEIGHT),
  16 // Máximo 16px por celda
);

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: '#0f380f' },
  O: { shape: [[1, 1], [1, 1]], color: '#0f380f' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#0f380f' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#0f380f' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#0f380f' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0f380f' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#0f380f' },
};

type TetrominoType = keyof typeof TETROMINOS;
type Board = number[][];

const createBoard = (): Board =>
  Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const randomTetromino = (): TetrominoType => {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
};

export default function TetrisGame({ visible, onClose, usuarioId }: TetrisGameProps) {
  const [board, setBoard] = useState<Board>(createBoard());
  const [currentPiece, setCurrentPiece] = useState<TetrominoType>(randomTetromino());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [highScore, setHighScore] = useState(0);

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cargar highscore global del backend al abrir
  useEffect(() => {
    if (visible) {
      getHighscoreGlobal('tetris')
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
      guardarHighscore('tetris', usuarioId, score)
        .then(data => {
          if (data && data.puntuacion > highScore) {
            setHighScore(data.puntuacion);
          }
        })
        .catch(() => {});
    }
  }, [gameOver, score, usuarioId, highScore]);

  const getRotatedShape = useCallback((type: TetrominoType, rot: number) => {
    let shape = [...TETROMINOS[type].shape.map(row => [...row])];
    for (let i = 0; i < rot % 4; i++) {
      shape = shape[0].map((_, idx) => shape.map(row => row[idx]).reverse());
    }
    return shape;
  }, []);

  const isValidMove = useCallback((newX: number, newY: number, newRotation: number) => {
    const shape = getRotatedShape(currentPiece, newRotation);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;
          if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) return false;
          if (boardY >= 0 && board[boardY][boardX]) return false;
        }
      }
    }
    return true;
  }, [board, currentPiece, getRotatedShape]);

  const placePiece = useCallback(() => {
    const shape = getRotatedShape(currentPiece, rotation);
    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && position.y + y >= 0) {
          newBoard[position.y + y][position.x + x] = 1;
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + linesCleared;
        if (Math.floor(newLines / 10) > Math.floor(l / 10)) {
          setLevel(lv => lv + 1);
        }
        return newLines;
      });
    }

    setBoard(newBoard);

    // Spawn new piece
    const newPiece = randomTetromino();
    setCurrentPiece(newPiece);
    setPosition({ x: 3, y: 0 });
    setRotation(0);

    // Check game over
    if (!isValidMove(3, 0, 0)) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
    }
  }, [board, currentPiece, position, rotation, getRotatedShape, isValidMove, level, score, highScore]);

  const moveDown = useCallback(() => {
    if (gameOver || isPaused) return;

    if (isValidMove(position.x, position.y + 1, rotation)) {
      setPosition(p => ({ ...p, y: p.y + 1 }));
    } else {
      placePiece();
    }
  }, [gameOver, isPaused, isValidMove, position, rotation, placePiece]);

  const moveLeft = () => {
    if (isValidMove(position.x - 1, position.y, rotation)) {
      setPosition(p => ({ ...p, x: p.x - 1 }));
    }
  };

  const moveRight = () => {
    if (isValidMove(position.x + 1, position.y, rotation)) {
      setPosition(p => ({ ...p, x: p.x + 1 }));
    }
  };

  const rotate = () => {
    const newRotation = (rotation + 1) % 4;
    if (isValidMove(position.x, position.y, newRotation)) {
      setRotation(newRotation);
    }
  };

  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;

    let newY = position.y;
    while (isValidMove(position.x, newY + 1, rotation)) {
      newY++;
    }

    // Colocar la pieza directamente en la posición final
    const shape = getRotatedShape(currentPiece, rotation);
    const newBoard = board.map(row => [...row]);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && newY + y >= 0) {
          newBoard[newY + y][position.x + x] = 1;
        }
      }
    }

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell === 1)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(0));
        linesCleared++;
        y++;
      }
    }

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800][linesCleared] * level;
      setScore(s => s + points);
      setLines(l => {
        const newLines = l + linesCleared;
        if (Math.floor(newLines / 10) > Math.floor(l / 10)) {
          setLevel(lv => lv + 1);
        }
        return newLines;
      });
    }

    setBoard(newBoard);

    // Spawn new piece
    const newPiece = randomTetromino();
    setCurrentPiece(newPiece);
    setPosition({ x: 3, y: 0 });
    setRotation(0);

    // Check game over
    if (!isValidMove(3, 0, 0)) {
      setGameOver(true);
      if (score > highScore) setHighScore(score);
    }
  }, [gameOver, isPaused, position, rotation, isValidMove, getRotatedShape, currentPiece, board, level, score, highScore]);

  useEffect(() => {
    if (visible && !isPaused && !gameOver) {
      const speed = Math.max(100, 500 - (level - 1) * 50);
      gameLoopRef.current = setInterval(moveDown, speed);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [visible, isPaused, gameOver, moveDown, level]);

  const resetGame = () => {
    setBoard(createBoard());
    setCurrentPiece(randomTetromino());
    setPosition({ x: 3, y: 0 });
    setRotation(0);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setLines(0);
    setIsPaused(true);
  };

  const startGame = () => {
    if (gameOver) resetGame();
    setIsPaused(false);
  };

  const renderBoard = () => {
    const shape = getRotatedShape(currentPiece, rotation);
    const displayBoard = board.map(row => [...row]);

    // Add current piece to display
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] && position.y + y >= 0 && position.y + y < BOARD_HEIGHT) {
          displayBoard[position.y + y][position.x + x] = 2;
        }
      }
    }

    return displayBoard;
  };

  if (!visible) return null;

  const displayBoard = renderBoard();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.gameBoy}>
          <View style={styles.header}>
            <Text style={styles.brandText}>GAME & WATCH</Text>
            <Text style={styles.gameTitle}>TETRIS</Text>
          </View>

          <View style={styles.screenContainer}>
            <View style={styles.screen}>
              <View style={styles.gameArea}>
                {/* Stats */}
                <View style={styles.stats}>
                  <Text style={styles.statText}>SCORE</Text>
                  <Text style={styles.statValue}>{score}</Text>
                  <Text style={styles.statText}>LEVEL</Text>
                  <Text style={styles.statValue}>{level}</Text>
                  <Text style={styles.statText}>LINES</Text>
                  <Text style={styles.statValue}>{lines}</Text>
                  <Text style={styles.statText}>HIGH</Text>
                  <Text style={styles.statValue}>{highScore}</Text>
                </View>

                {/* Board */}
                <View style={styles.board}>
                  {displayBoard.map((row, y) => (
                    <View key={y} style={styles.row}>
                      {row.map((cell, x) => (
                        <View
                          key={x}
                          style={[
                            styles.cell,
                            cell === 1 && styles.filledCell,
                            cell === 2 && styles.currentCell,
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>

              {(gameOver || isPaused) && (
                <View style={styles.messageOverlay}>
                  <Text style={styles.messageText}>
                    {gameOver ? 'GAME OVER' : 'PRESS START'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.controls}>
            <View style={styles.dpad}>
              <TouchableOpacity style={[styles.dpadBtn, styles.dpadUp]} onPress={rotate}>
                <Text style={styles.dpadText}>↻</Text>
              </TouchableOpacity>
              <View style={styles.dpadMiddle}>
                <TouchableOpacity style={[styles.dpadBtn, styles.dpadLeft]} onPress={moveLeft}>
                  <Text style={styles.dpadText}>◀</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dpadCenter} onPress={hardDrop}>
                  <Text style={styles.dropText}>▼▼</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.dpadBtn, styles.dpadRight]} onPress={moveRight}>
                  <Text style={styles.dpadText}>▶</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.dpadBtn, styles.dpadDown]} onPress={moveDown}>
                <Text style={styles.dpadText}>▼</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionBtns}>
              <TouchableOpacity style={styles.actionBtn} onPress={startGame}>
                <Text style={styles.actionBtnText}>START</Text>
              </TouchableOpacity>
            </View>
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
    maxWidth: WINDOW_WIDTH * 0.9,
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
  },
  gameArea: {
    flexDirection: 'row',
  },
  stats: {
    width: 55,
    paddingRight: 6,
  },
  statText: {
    fontSize: 8,
    color: '#0f380f',
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 12,
    color: '#0f380f',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  board: {
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
  filledCell: {
    backgroundColor: '#0f380f',
  },
  currentCell: {
    backgroundColor: '#306230',
  },
  messageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(155, 188, 15, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#0f380f',
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropText: {
    color: '#8b956d',
    fontSize: 10,
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
