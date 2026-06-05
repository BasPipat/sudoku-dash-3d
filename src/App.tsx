import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { Board2D } from './components/Board2D';
import type { Sudoku3DBoard, SelectedCell, Difficulty, FocusAxis } from './types';
import { generatePuzzle, checkSudokuRules, checkWinCondition, getGlowingCells } from './utils/sudoku';
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const App: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Sudoku3DBoard>(() => generatePuzzle('easy'));
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [activeLayer, setActiveLayer] = useState<number | 'all'>('all');
  const [focusAxis, setFocusAxis] = useState<FocusAxis>('Z');
  const [hoveredSlice, setHoveredSlice] = useState<{ axis: FocusAxis; index: number } | null>(null);
  const [clickedSlice, setClickedSlice] = useState<{ axis: FocusAxis; index: number } | null>(null);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [isAssistMode, setIsAssistMode] = useState<boolean>(true);
  const [highlightedNumber, setHighlightedNumber] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [hints, setHints] = useState<number>(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [screen, setScreen] = useState<'splash' | 'menu' | 'difficulty' | 'game' | 'leaderboard'>('splash');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');

  // Transition animation states for "pulling out" effect
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionProgress, setTransitionProgress] = useState<number>(0);
  const [transitionSlice, setTransitionSlice] = useState<{ axis: FocusAxis; index: number } | null>(null);

  const triggerTransition = (axis: FocusAxis, index: number) => {
    // Switch the slice and view mode immediately without pull-out animation lag
    setFocusAxis(axis);
    setActiveLayer(index);
    setClickedSlice(null);
    setViewMode('2d');
    setIsTransitioning(false);
    setTransitionProgress(0);
    setTransitionSlice(null);
  };

  // Reset viewMode to 3d if activeLayer becomes 'all'
  useEffect(() => {
    if (activeLayer === 'all') {
      setViewMode('3d');
    }
  }, [activeLayer]);

  // Toggle theme class
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // Loading progress bar simulation
  useEffect(() => {
    if (screen === 'splash') {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setScreen('menu'), 400);
            return 100;
          }
          return prev + 4;
        });
      }, 70);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Compute glowing cells
  const glowingCells = useMemo(() => getGlowingCells(board), [board]);

  // Count how many times each digit appears in the current 2D slice
  const completedNumbers = useMemo((): Set<number> => {
    if (activeLayer === 'all') return new Set();
    const counts: Record<number, number> = {};
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        let x: number, y: number, z: number;
        const layerIdx = activeLayer as number;
        if (focusAxis === 'X') { x = layerIdx; y = row; z = col; }
        else if (focusAxis === 'Y') { x = col; y = layerIdx; z = row; }
        else { x = col; y = row; z = layerIdx; }
        const v = board[z][y][x].value;
        if (v > 0) counts[v] = (counts[v] ?? 0) + 1;
      }
    }
    return new Set(Object.entries(counts).filter(([, c]) => c >= 9).map(([n]) => Number(n)));
  }, [board, activeLayer, focusAxis]);

  // Refs to allow keyboard event listeners to access fresh state
  const selectedCellRef = useRef<SelectedCell | null>(null);
  selectedCellRef.current = selectedCell;

  const boardRef = useRef<Sudoku3DBoard>(board);
  boardRef.current = board;

  const activeLayerRef = useRef<number | 'all'>(activeLayer);
  activeLayerRef.current = activeLayer;

  const focusAxisRef = useRef<FocusAxis>(focusAxis);
  focusAxisRef.current = focusAxis;

  const isNotesModeRef = useRef<boolean>(isNotesMode);
  isNotesModeRef.current = isNotesMode;

  const hoveredSliceRef = useRef<{ axis: FocusAxis; index: number } | null>(hoveredSlice);
  hoveredSliceRef.current = hoveredSlice;

  // Initialize a new game
  const handleNewGame = () => {
    const newBoard = generatePuzzle(difficulty);
    setBoard(newBoard);
    setSelectedCell(null);
    setActiveLayer('all');
    setFocusAxis('Z');
    setHoveredSlice(null);
    setClickedSlice(null);
    setIsNotesMode(false);
    setTimer(0);
    setMoves(0);
    setHasWon(false);
    setHasLost(false);
    setMistakes(0);
    setHints(0);
  };

  // Generate new game when difficulty changes
  useEffect(() => {
    handleNewGame();
  }, [difficulty]);

  // Timer Tick
  useEffect(() => {
    if (hasWon || hasLost) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasWon, hasLost]);

  // Reveal the correct answer for selected cell
  const handleHint = () => {
    if (hints >= 3) return; // Limit to 3 hints max
    const activeCell = selectedCellRef.current;
    if (!activeCell) return;
    const currentBoard = boardRef.current;
    const cell = currentBoard[activeCell.z][activeCell.y][activeCell.x];
    if (cell.isOriginal) return;
    const answer = cell.solvedValue;
    if (!answer || answer === cell.value) return;
    // Fill in the correct answer
    const updatedBoard = currentBoard.map((layer, zIdx) =>
      layer.map((row, yIdx) =>
        row.map((c, xIdx) => {
          if (zIdx === activeCell.z && yIdx === activeCell.y && xIdx === activeCell.x) {
            return { ...c, value: answer, notes: [] };
          }
          return c;
        })
      )
    );
    const validatedBoard = checkSudokuRules(updatedBoard);
    setBoard(validatedBoard);
    setHints((prev) => prev + 1);
    if (checkWinCondition(validatedBoard)) {
      setHasWon(true);
      setSelectedCell(null);
    }
  };

  // Input number or toggle candidate notes
  const handleNumberInput = (num: number) => {
    const activeCell = selectedCellRef.current;
    if (!activeCell) return;

    const currentBoard = boardRef.current;
    const cell = currentBoard[activeCell.z][activeCell.y][activeCell.x];

    // Prefilled cells cannot be modified
    if (cell.isOriginal) return;

    let updatedBoard: Sudoku3DBoard;

    if (isNotesModeRef.current) {
      if (num === 0) {
        // Clear notes of current cell
        updatedBoard = currentBoard.map((layer, zIdx) =>
          layer.map((row, yIdx) =>
            row.map((c, xIdx) => {
              if (zIdx === activeCell.z && yIdx === activeCell.y && xIdx === activeCell.x) {
                return { ...c, notes: [] };
              }
              return c;
            })
          )
        );
      } else {
        // Toggle number in candidate notes list
        updatedBoard = currentBoard.map((layer, zIdx) =>
          layer.map((row, yIdx) =>
            row.map((c, xIdx) => {
              if (zIdx === activeCell.z && yIdx === activeCell.y && xIdx === activeCell.x) {
                const currentNotes = c.notes || [];
                const notes = currentNotes.includes(num)
                  ? currentNotes.filter((n) => n !== num)
                  : [...currentNotes, num].sort();
                return { ...c, notes };
              }
              return c;
            })
          )
        );
      }
    } else {
      // Normal digit input (clears existing notes automatically)
      updatedBoard = currentBoard.map((layer, zIdx) =>
        layer.map((row, yIdx) =>
          row.map((c, xIdx) => {
            if (zIdx === activeCell.z && yIdx === activeCell.y && xIdx === activeCell.x) {
              return { ...c, value: num, notes: [] };
            }
            return c;
          })
        )
      );
    }

    // Validate board rules (rows, cols, depth, 3x3 box)
    const validatedBoard = checkSudokuRules(updatedBoard);
    setBoard(validatedBoard);
    setMoves((prev) => prev + 1);

    // Track mistakes
    if (!isNotesModeRef.current && num !== 0) {
      const targetCellInValidated = validatedBoard[activeCell.z][activeCell.y][activeCell.x];
      if (targetCellInValidated.isError) {
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            setHasLost(true);
            setSelectedCell(null);
          }
          return next;
        });
      }
    }

    // Check victory
    if (checkWinCondition(validatedBoard)) {
      setHasWon(true);
      setSelectedCell(null);
    }
  };

  // Helper coordinate mappings for 2D to 3D navigation
  const get2DFrom3D = (x: number, y: number, z: number, axis: FocusAxis): { row: number; col: number } => {
    if (axis === 'X') return { row: y, col: z };
    if (axis === 'Y') return { row: z, col: x };
    return { row: y, col: x }; // Z axis
  };

  const get3DFrom2D = (row: number, col: number, axis: FocusAxis, layer: number): { x: number; y: number; z: number } => {
    if (axis === 'X') return { x: layer, y: row, z: col };
    if (axis === 'Y') return { x: col, y: layer, z: row };
    return { x: col, y: row, z: layer }; // Z axis
  };

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || hasWon || hasLost) return;

      const activeCell = selectedCellRef.current;

      // Toggle Notes Mode with key 'N' or 'n'
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsNotesMode((prev) => !prev);
        return;
      }

      // Handle slicing layers with W/S (PageUp/PageDown)
      let movedSlice = false;
      let nextLayer = activeLayerRef.current;
      if (nextLayer !== 'all') {
        if (e.key === 'PageUp' || e.key === 'w' || e.key === 'W') {
          nextLayer = Math.min(8, nextLayer + 1);
          movedSlice = true;
        } else if (e.key === 'PageDown' || e.key === 's' || e.key === 'S') {
          nextLayer = Math.max(0, nextLayer - 1);
          movedSlice = true;
        }
      }

      if (movedSlice && nextLayer !== 'all') {
        e.preventDefault();
        setActiveLayer(nextLayer);
        if (activeCell) {
          const { row, col } = get2DFrom3D(activeCell.x, activeCell.y, activeCell.z, focusAxisRef.current);
          const next3D = get3DFrom2D(row, col, focusAxisRef.current, nextLayer);
          setSelectedCell(next3D);
        }
        return;
      }

      // Handle Arrow Navigation mapped to 2D board
      if (activeCell && activeLayerRef.current !== 'all') {
        let { row, col } = get2DFrom3D(activeCell.x, activeCell.y, activeCell.z, focusAxisRef.current);
        let moved = false;

        if (e.key === 'ArrowUp') {
          row = Math.max(0, row - 1);
          moved = true;
        } else if (e.key === 'ArrowDown') {
          row = Math.min(8, row + 1);
          moved = true;
        } else if (e.key === 'ArrowLeft') {
          col = Math.max(0, col - 1);
          moved = true;
        } else if (e.key === 'ArrowRight') {
          col = Math.min(8, col + 1);
          moved = true;
        }

        if (moved) {
          e.preventDefault();
          const next3D = get3DFrom2D(row, col, focusAxisRef.current, activeLayerRef.current as number);
          setSelectedCell(next3D);
          return;
        }
      }

      // Check digit inputs
      if (/^[1-9]$/.test(e.key)) {
        handleNumberInput(parseInt(e.key, 10));
      }
      // Check deletion/clear inputs
      else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleNumberInput(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasWon]);

  // Handle cell clicking in 3D or 2D
  const handleSelectCell = (x: number, y: number, z: number, axis?: FocusAxis, index?: number) => {
    if (selectedCell && selectedCell.x === x && selectedCell.y === y && selectedCell.z === z) {
      setSelectedCell(null);
      return;
    }
    setSelectedCell({ x, y, z });
    setHighlightedNumber(null); // entering edit mode clears number scan highlight

    // If clicking a cell in 3D, lock that slice
    if (viewMode === '3d') {
      const activeHover = hoveredSliceRef.current;
      const targetAxis = axis || (activeHover ? activeHover.axis : focusAxis);
      const targetIndex = index !== undefined ? index : (activeHover ? activeHover.index : (activeLayer === 'all' ? 0 : activeLayer));
      
      setClickedSlice({ axis: targetAxis, index: targetIndex });
    }
  };

  const handleHoverSlice = (axis: FocusAxis | null, index: number | null) => {
    if (axis === null || index === null) {
      setHoveredSlice(null);
    } else {
      setHoveredSlice({ axis, index });
    }
  };

  if (screen === 'splash') {
    return (
      <div className="splash-container">
        <div className="splash-logo-area">
          <div className="cube-3d-logo">
            <div className="cube-logo-face front">9</div>
            <div className="cube-logo-face back">3</div>
            <div className="cube-logo-face left">X</div>
            <div className="cube-logo-face right">D</div>
            <div className="cube-logo-face top">🏆</div>
            <div className="cube-logo-face bottom">❤️</div>
          </div>
          <h1 className="splash-title glow-cyan-text">SUDOKU DASH 3D</h1>
          <p className="splash-subtitle">Multi-Dimensional Sudoku Challenge</p>
          <div className="loading-bar-wrapper">
            <div className="loading-bar" style={{ width: `${loadingProgress}%` }}></div>
          </div>
          <p className="loading-text">Loading Assets... {loadingProgress}%</p>
        </div>
      </div>
    );
  }

  if (screen === 'menu') {
    return (
      <div className="menu-container">
        <div className="theme-toggle-corner">
          <button
            className="theme-btn"
            onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            aria-label="Toggle theme"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              transition: 'all 0.3s ease'
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <div className="menu-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <div className="cube-3d-logo">
            <div className="cube-logo-face front">9</div>
            <div className="cube-logo-face back">3</div>
            <div className="cube-logo-face left">X</div>
            <div className="cube-logo-face right">D</div>
            <div className="cube-logo-face top">🏆</div>
            <div className="cube-logo-face bottom">❤️</div>
          </div>
          <div>
            <h1 className="menu-title glow-cyan-text">SUDOKU DASH 3D</h1>
            <p className="menu-subtitle">9x9x9 Multi-Layer Sudoku</p>
          </div>
        </div>
        
        <div className="menu-buttons">
          <button className="menu-btn primary" onClick={() => setScreen('difficulty')}>
            <span className="btn-icon">🎮</span> Start Puzzle
          </button>
          <button className="menu-btn secondary" onClick={() => setScreen('leaderboard')}>
            <span className="btn-icon">🏆</span> Leaderboards
          </button>
        </div>

        <div className="menu-card glass-panel">
          <h3 className="card-title">📖 How to Play</h3>
          <p className="card-desc">
            This is a 3D Sudoku puzzle. The board is a 9x9x9 cube composed of 9 slices along 3 coordinate axes (X, Y, and Z).
          </p>
          <ul className="card-list">
            <li>Each 9x9 grid slice must follow classic Sudoku rules.</li>
            <li>Completed and correct lines will glow in neon emerald!</li>
            <li>You have exactly 3 lives. Putting incorrect values costs 1 life.</li>
          </ul>
        </div>
      </div>
    );
  }

  if (screen === 'difficulty') {
    return (
      <div className="difficulty-container">
        <button className="back-btn" onClick={() => setScreen('menu')}>
          ← Back to Menu
        </button>
        <h2 className="screen-title glow-cyan-text">Select Difficulty</h2>
        <p className="screen-subtitle">Choose your puzzle complexity</p>

        <div className="difficulty-cards">
          <div 
            className="diff-card easy glass-panel" 
            onClick={() => {
              setDifficulty('easy');
              setBoard(generatePuzzle('easy'));
              setScreen('game');
            }}
          >
            <div className="diff-icon">🌱</div>
            <div className="diff-card-content">
              <h3>Easy</h3>
              <p>Perfect for beginners. More pre-filled cells to guide your solution.</p>
            </div>
          </div>

          <div 
            className="diff-card medium glass-panel" 
            onClick={() => {
              setDifficulty('medium');
              setBoard(generatePuzzle('medium'));
              setScreen('game');
            }}
          >
            <div className="diff-icon">⚡</div>
            <div className="diff-card-content">
              <h3>Medium</h3>
              <p>A balanced challenge. Requires standard coordinate slicing logic.</p>
            </div>
          </div>

          <div 
            className="diff-card hard glass-panel" 
            onClick={() => {
              setDifficulty('hard');
              setBoard(generatePuzzle('hard'));
              setScreen('game');
            }}
          >
            <div className="diff-icon">🔥</div>
            <div className="diff-card-content">
              <h3>Hard</h3>
              <p>For Sudoku masters. Very few prefilled cells, testing your multi-dimensional logic.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'leaderboard') {
    return (
      <div className="leaderboard-container">
        <button className="back-btn" onClick={() => setScreen('menu')}>
          ← Back to Menu
        </button>
        <h2 className="screen-title glow-cyan-text">🏆 Global Leaderboards</h2>
        <p className="screen-subtitle">Top 9x9x9 Puzzle Completers</p>

        <div className="leaderboard-table-wrapper glass-panel">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Difficulty</th>
                <th>Time</th>
                <th>Moves</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>🥇 1</td>
                <td>GamerZ_Sudoku</td>
                <td><span className="badge hard">Hard</span></td>
                <td>14:32</td>
                <td>122</td>
              </tr>
              <tr>
                <td>🥈 2</td>
                <td>NeonCuber</td>
                <td><span className="badge medium">Medium</span></td>
                <td>08:15</td>
                <td>98</td>
              </tr>
              <tr>
                <td>🥉 3</td>
                <td>LogicMaster</td>
                <td><span className="badge hard">Hard</span></td>
                <td>18:44</td>
                <td>145</td>
              </tr>
              <tr>
                <td>4</td>
                <td>SlicerPro</td>
                <td><span className="badge easy">Easy</span></td>
                <td>04:02</td>
                <td>76</td>
              </tr>
              <tr>
                <td>5</td>
                <td>AlphaSudoku</td>
                <td><span className="badge medium">Medium</span></td>
                <td>11:20</td>
                <td>110</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={`gameplay-container viewmode-${viewMode}`}>
      {/* Sidebar panel */}
      <aside className="game-sidebar glass-panel">
        {/* Top Header Bar */}
        <header className="game-header-bar">
          <div className="brand-block">
            <button className="icon-btn back-btn" onClick={() => setScreen('menu')} title="Quit to Menu">
              ←
            </button>
            <div>
              <h1 className="game-title glow-cyan-text">SUDOKU DASH 3D</h1>
              <div className="game-subtitle">9x9x9 Multi-Layer Sudoku</div>
            </div>
          </div>
          <button
            className="icon-btn theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Stats HUD Card */}
        <div className="game-hud-bar">
        <div className="hud-item difficulty">
          <span className="hud-icon">🧠</span>
          <div className="hud-content">
            <span className="hud-label">Difficulty</span>
            <span className="hud-value active-val">{difficulty.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="hud-item time">
          <span className="hud-icon">⏱️</span>
          <div className="hud-content">
            <span className="hud-label">Time</span>
            <span className="hud-value glow-cyan">{formatTime(timer)}</span>
          </div>
        </div>

        <div className="hud-item moves">
          <span className="hud-icon">🎮</span>
          <div className="hud-content">
            <span className="hud-label">Moves</span>
            <span className="hud-value">{moves}</span>
          </div>
        </div>

        <div className="hud-item mistakes">
          <span className="hud-icon">❤️</span>
          <div className="hud-content">
            <span className="hud-label">Mistakes</span>
            <span className="hud-value-hearts">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`heart-icon ${i < 3 - mistakes ? 'active' : 'inactive'}`}>❤️</span>
              ))}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="game-controls-panel">
        {/* Row 1: Focus Axis */}
        <div className="control-section">
          <div className="control-section-title">Focus Axis</div>
          <div className="segmented-control">
            <button
              className={`btn ${focusAxis === 'Z' ? 'active' : ''}`}
              onClick={() => setFocusAxis('Z')}
            >
              Z Plane
            </button>
            <button
              className={`btn ${focusAxis === 'Y' ? 'active' : ''}`}
              onClick={() => setFocusAxis('Y')}
            >
              Y Plane
            </button>
            <button
              className={`btn ${focusAxis === 'X' ? 'active' : ''}`}
              onClick={() => setFocusAxis('X')}
            >
              X Plane
            </button>
          </div>
        </div>

        {/* Row 2: Slice Layers */}
        <div className="control-section">
          <div className="control-section-title">
            {activeLayer === 'all'
              ? `${focusAxis} Layers: All`
              : `${focusAxis} Layer: ${activeLayer + 1}`}
          </div>
          <div className="layers-control-grid">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((layerIdx) => {
              const isHighlight = clickedSlice && clickedSlice.axis === focusAxis && clickedSlice.index === layerIdx;
              return (
                <button
                  key={layerIdx}
                  className={`btn layer-btn ${activeLayer === layerIdx ? 'active' : ''} ${isHighlight ? 'highlight-pulse' : ''}`}
                  onClick={() => {
                    triggerTransition(focusAxis, layerIdx);
                  }}
                >
                  {focusAxis}{layerIdx + 1}
                </button>
              );
            })}
            <button
              className={`btn layer-btn ${activeLayer === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveLayer('all');
                setViewMode('3d');
                setClickedSlice(null);
              }}
              style={activeLayer !== 'all' ? { 
                fontSize: '9px',
                padding: '4px 2px',
                lineHeight: '1.1',
                background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                color: '#fff',
                border: 'none',
                fontWeight: 'bold'
              } : {}}
            >
              {activeLayer === 'all' ? 'All' : 'Switch to 3D'}
            </button>
          </div>
        </div>

        {/* Clicked Slice Status Banner */}
        {clickedSlice && (
          <div className="clicked-slice-banner pulse-border">
            <span className="slice-label">🎯 Clicked: {clickedSlice.axis}{clickedSlice.index + 1}</span>
            <button 
              className="btn focus-slice-btn" 
              onClick={() => triggerTransition(clickedSlice.axis, clickedSlice.index)}
            >
              📂 Pull to 2D
            </button>
          </div>
        )}

        {/* Row 3: Selected Cell coordinate banner */}
        <div className="selected-cell-banner">
          {selectedCell ? (
            <span>Selected Cell: X{selectedCell.x + 1} / Y{selectedCell.y + 1} / Z{selectedCell.z + 1}</span>
          ) : (
            <span className="no-cell-selected">Selected Cell: None</span>
          )}
        </div>

        {/* Row 4 & 4.5: Input Mode + Assist — combined into one row on mobile */}
        <div className="mode-assist-row">
          <div className="control-section">
            <div className="control-section-title">Input Mode</div>
            <div className="segmented-control mode-tabs">
              <button
                className={`btn mode-btn ${!isNotesMode ? 'active' : ''}`}
                onClick={() => setIsNotesMode(false)}
              >
                Normal
              </button>
              <button
                className={`btn mode-btn notes-mode ${isNotesMode ? 'active' : ''}`}
                onClick={() => setIsNotesMode(true)}
              >
                Notes
              </button>
            </div>
          </div>

          <div className="control-section">
            <div className="control-section-title">Gameplay Assist</div>
            <div className="segmented-control mode-tabs">
              <button
                className={`btn mode-btn ${!isAssistMode ? 'active' : ''}`}
                onClick={() => setIsAssistMode(false)}
              >
                Assist Off
              </button>
              <button
                className={`btn mode-btn ${isAssistMode ? 'active' : ''}`}
                onClick={() => setIsAssistMode(true)}
              >
                Assist On
              </button>
            </div>
          </div>
        </div>

        {/* Row 5: Keypad */}
        <div className="keypad-grid-controls">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const isComplete = completedNumbers.has(num);
            const isHighlighted = highlightedNumber === num;
            return (
              <button
                key={num}
                className={`keypad-btn-val ${
                  isComplete ? 'num-complete' : ''
                } ${
                  isHighlighted ? 'num-highlighted' : ''
                }`}
                onClick={() => {
                  if (selectedCell) {
                    // Cell is selected → enter the digit, clear highlight
                    handleNumberInput(num);
                    setHighlightedNumber(null);
                  } else {
                    // No cell selected → toggle highlight only
                    setHighlightedNumber(highlightedNumber === num ? null : num);
                  }
                }}
                disabled={false}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Row 5.5: Deselect Button */}
        {(selectedCell || highlightedNumber !== null) && (
          <button
            className="action-btn deselect-cute"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCell(null);
              setHighlightedNumber(null);
            }}
            title="Deselect or Clear Highlight"
            style={{ width: '100%', marginTop: '10px' }}
          >
            🖐️ Deselect
          </button>
        )}

        {/* Row 6: Actions */}
        <div className="action-row-buttons">
          <button
            className="action-btn clear"
            onClick={() => handleNumberInput(0)}
            disabled={!selectedCell}
          >
            CLEAR
          </button>
          <button
            className="action-btn hint-btn"
            onClick={handleHint}
            disabled={hints >= 3 || !selectedCell || (selectedCell && board[selectedCell.z][selectedCell.y][selectedCell.x].isOriginal)}
            title={`Reveal correct answer for selected cell (${3 - hints} hints left)`}
          >
            💡 Hint ({Math.max(0, 3 - hints)} Left)
          </button>
          <button className="action-btn new-game" style={{ gridColumn: '1 / -1' }} onClick={handleNewGame}>
            New Game
          </button>
        </div>
      </div>
      </aside>

      {/* Active Slice Banner */}
      <div className="active-slice-title">
        <h2>{activeLayer === 'all' ? '3D View: All Slices' : `Slice View: ${focusAxis}${activeLayer + 1}`}</h2>
        <p className="active-slice-sub">Focus: {focusAxis} Plane</p>
      </div>

      {/* Viewport Container — clicking empty area clears highlighted number */}
      <div
        className="game-viewport-container glass-panel"
        onClick={() => setHighlightedNumber(null)}
      >
        {viewMode === '3d' || isTransitioning ? (
          <GameCanvas
            board={board}
            selectedCell={selectedCell}
            activeLayer={activeLayer}
            focusAxis={focusAxis}
            onSelectCell={handleSelectCell}
            hoveredSlice={hoveredSlice}
            onHoverSlice={handleHoverSlice}
            glowingCells={glowingCells}
            theme={theme}
            isTransitioning={isTransitioning}
            transitionProgress={transitionProgress}
            transitionSlice={transitionSlice}
          />
        ) : (
          <Board2D
            board={board}
            selectedCell={selectedCell}
            activeLayer={activeLayer}
            focusAxis={focusAxis}
            onSelectCell={handleSelectCell}
            glowingCells={glowingCells}
            isAssistMode={isAssistMode}
            highlightedNumber={highlightedNumber}
          />
        )}
      </div>
    </div>

      {/* Victory Celebration Modal */}
      {hasWon && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ borderColor: '#00ff87', maxWidth: '440px' }}>
            <div style={{ fontSize: '72px', animation: 'bounce 2s infinite', marginBottom: '10px' }}>🏆</div>
            <h2 className="modal-title success" style={{ color: '#00ff87', fontSize: '28px' }}>VICTORY!</h2>
            
            {/* Rank Calculation Section */}
            <div className="victory-rank-badge" style={{ margin: '15px 0' }}>
              <span className="rank-label" style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rank</span>
              <span className="rank-letter" style={{
                fontSize: '80px',
                fontWeight: '900',
                background: 'linear-gradient(135deg, #00ff87 0%, #60efff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(0, 255, 135, 0.4)',
                lineHeight: 1,
                display: 'block'
              }}>
                {mistakes === 0 && timer < 600 ? 'S' : mistakes <= 1 ? 'A' : 'B'}
              </span>
            </div>

            <p className="modal-desc" style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              You successfully solved the 3D Sudoku puzzle!<br />
              Time taken: <strong>{Math.floor(timer / 60)}m {timer % 60}s</strong><br />
              Total moves: <strong>{moves}</strong><br />
              Mistakes: <strong>{mistakes} / 3</strong>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
              <button
                className="btn primary"
                onClick={() => {
                  navigator.clipboard.writeText(`I solved the 9x9x9 3D Sudoku in ${Math.floor(timer / 60)}m ${timer % 60}s with ${moves} moves! Rank: ${mistakes === 0 && timer < 600 ? 'S' : mistakes <= 1 ? 'A' : 'B'}`);
                  alert('Score details copied to clipboard!');
                }}
                style={{
                  background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                📤 Share Score
              </button>
              <button
                className="btn secondary"
                onClick={handleNewGame}
                style={{ padding: '10px', borderRadius: '8px' }}
              >
                🔄 Play Again
              </button>
              <button
                className="btn secondary"
                onClick={() => setScreen('menu')}
                style={{ padding: '10px', borderRadius: '8px' }}
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {hasLost && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ borderColor: '#ef4444' }}>
            <div style={{ fontSize: '64px' }}>💀</div>
            <h2 className="modal-title error" style={{ color: '#ef4444' }}>Game Over!</h2>
            <p className="modal-desc">
              You made 3 mistakes and ran out of lives!<br />
              Time elapsed: <strong>{Math.floor(timer / 60)}m {timer % 60}s</strong><br />
              Total moves: <strong>{moves}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '10px' }}>
              <button
                className="btn primary"
                onClick={handleNewGame}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #ff7e7e 100%)',
                  boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                Try Again
              </button>
              <button
                className="btn secondary"
                onClick={() => setScreen('menu')}
                style={{ padding: '10px', borderRadius: '8px' }}
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
