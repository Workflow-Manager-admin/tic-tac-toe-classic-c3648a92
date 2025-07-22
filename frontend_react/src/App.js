import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * App component renders the Tic Tac Toe game, allowing users to select
 * Player vs Player or Player vs AI, handles game logic and UI.
 */
// PUBLIC_INTERFACE
function App() {
  // Board state: 3x3 (9 cells) initialized to null
  const [board, setBoard] = useState(Array(9).fill(null));
  // X or O for user
  const [userSymbol, setUserSymbol] = useState(null);
  // Track if game is ongoing or ended
  const [gameOver, setGameOver] = useState(false);
  // "X" always starts by default
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // Store winner symbol ("X", "O"), or null if none
  const [winner, setWinner] = useState(null);
  // Track if draw
  const [isDraw, setIsDraw] = useState(false);

  // ==== AI-RELATED STATE ====
  const [mode, setMode] = useState(null); // "pvp" or "ai"
  const [aiSymbol, setAiSymbol] = useState(null);

  // CSS Colors (from requirements)
  const colors = {
    primary: "#1976D2",
    secondary: "#424242",
    accent: "#FFA000",
    boardBg: "#fff",
    cellBorder: "#e9ecef",
    cellHover: "#FFA00033",
    cellHighlight: "#FFA00011",
    text: "#444",
    winner: "#FFA000",
    draw: "#1976D2",
    controlBg: "#f8f9fa",
    btnPrimary: "#FFA000",
    btnPrimaryText: "#fff",
    btnOutline: "#1976D2",
    btnOutlineText: "#1976D2",
    disabled: "#bdbdbd"
  };

  // Winning combinations (zero-based board indices)
  const WIN_COMBINATIONS = [
    [0, 1, 2], // row 1
    [3, 4, 5], // row 2
    [6, 7, 8], // row 3
    [0, 3, 6], // col 1
    [1, 4, 7], // col 2
    [2, 5, 8], // col 3
    [0, 4, 8], // diag
    [2, 4, 6], // anti-diag
  ];

  // PUBLIC_INTERFACE
  function getWinLine(board) {
    for (let combo of WIN_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        board[a] &&
        board[a] === board[b] &&
        board[b] === board[c]
      ) {
        return combo;
      }
    }
    return null;
  }

  // Check for winner or draw every change
  useEffect(() => {
    const winLine = getWinLine(board);
    if (winLine) {
      setWinner(board[winLine[0]]);
      setGameOver(true);
      setIsDraw(false);
      return;
    }
    // If all cells filled and no winner, it's a draw
    if (board.every(cell => cell)) {
      setIsDraw(true);
      setGameOver(true);
      setWinner(null);
    }
  }, [board]);

  // If playing vs AI and it's the AI's turn, let AI move after small delay
  useEffect(() => {
    if (
      mode === "ai" &&
      userSymbol &&
      aiSymbol &&
      !gameOver &&
      currentPlayer === aiSymbol
    ) {
      const timer = setTimeout(() => {
        handleAIMove();
      }, 420); // ms delay for realism
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [board, currentPlayer, gameOver, mode, aiSymbol, userSymbol]);

  // Handles a move by the current human player
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (!userSymbol || gameOver || board[idx]) return;
    // Enforce turns — userSymbol's turn in PvAI, anyone's turn in PvP if matches currentPlayer
    if (
      (mode === "ai" && currentPlayer !== userSymbol) ||
      (mode === "pvp" && currentPlayer !== getActiveHuman())
    ) return;
    const nextBoard = board.slice();
    nextBoard[idx] = currentPlayer;
    setBoard(nextBoard);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  }

  // PUBLIC_INTERFACE
  function handleSymbolSelect(symbol) {
    if (userSymbol) return; // Only allow one-time selection after both chosen
    setUserSymbol(symbol);
    if (mode === "ai") {
      setAiSymbol(symbol === "X" ? "O" : "X");
    }
    setCurrentPlayer("X"); // X always starts
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setIsDraw(false);
  }

  // PUBLIC_INTERFACE
  function handleModeSelect(selectedMode) {
    handleReset();
    setMode(selectedMode);
    setAiSymbol(null);
    setUserSymbol(null);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setCurrentPlayer("X");
    setUserSymbol(null);
    setAiSymbol(null);
    setIsDraw(false);
    setMode(null);
  }

  // For PvP, determine which human chooses, for PvAI always userSymbol
  function getActiveHuman() {
    if (mode === "pvp") {
      return currentPlayer;
    }
    if (mode === "ai") {
      return userSymbol;
    }
    return null;
  }

  // ==== AI LOGIC ====
  // PUBLIC_INTERFACE
  function handleAIMove() {
    // Only take AI move if game is ongoing and it's AI's turn
    if (gameOver || !aiSymbol || currentPlayer !== aiSymbol) return;

    const bestMove = findBestMove(board, aiSymbol, userSymbol);
    if (typeof bestMove === "number") {
      const nextBoard = board.slice();
      nextBoard[bestMove] = aiSymbol;
      setBoard(nextBoard);
      setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
    }
  }

  /**
   * Minimax algorithm for Tic Tac Toe.
   * Returns best index for AI to move, or random if first turn.
   * @param {Array} newBoard - board array
   * @param {string} ai - AI symbol
   * @param {string} human - Human symbol
   */
  // PUBLIC_INTERFACE
  function findBestMove(newBoard, ai, human) {
    // If board is empty (first move), take center or random
    if (newBoard.every(cell => cell === null)) {
      return Math.random() < 0.8 ? 4 : Math.floor(Math.random() * 9);
    }
    // If center is open take center (fast heuristic), but minimax will fix if not
    if (newBoard[4] === null) {
      return 4;
    }
    // Minimax
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = ai;
        const score = minimax(newBoard, 0, false, ai, human);
        newBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }
    return move;
  }

  /**
   * Minimax recursion
   * @param {Array} tempBoard
   * @param {number} depth
   * @param {boolean} isMaximizing
   * @param {string} ai
   * @param {string} human
   * @returns {number}
   */
  // PUBLIC_INTERFACE
  function minimax(tempBoard, depth, isMaximizing, ai, human) {
    // Terminal checks
    const winLine = getWinLine(tempBoard);
    if (winLine) {
      const winnerSymbol = tempBoard[winLine[0]];
      if (winnerSymbol === ai) {
        return 10 - depth;
      } else if (winnerSymbol === human) {
        return depth - 10;
      }
    }
    if (tempBoard.every(cell => cell)) {
      // Draw
      return 0;
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = ai;
          const score = minimax(tempBoard, depth + 1, false, ai, human);
          tempBoard[i] = null;
          bestScore = Math.max(bestScore, score);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!tempBoard[i]) {
          tempBoard[i] = human;
          const score = minimax(tempBoard, depth + 1, true, ai, human);
          tempBoard[i] = null;
          bestScore = Math.min(bestScore, score);
        }
      }
      return bestScore;
    }
  }

  // Highlight winning line
  let winLine = getWinLine(board);

  // ==== UI Components ====

  function renderCell(idx) {
    const cell = board[idx];
    const highlight = winLine && winLine.includes(idx);
    // Disable clicking if: mode/symbol not chosen, game over, already filled, or not this player's turn
    const isDisabled =
      !mode ||
      !userSymbol ||
      gameOver ||
      !!board[idx] ||
      (mode === "ai"
        ? currentPlayer !== userSymbol
        : mode === "pvp"
        ? currentPlayer !== getActiveHuman()
        : true);
    return (
      <button
        key={idx}
        className="ttt-cell"
        style={{
          borderColor: colors.cellBorder,
          color: cell === "X" ? colors.primary : cell === "O" ? colors.accent : colors.text,
          background: highlight
            ? colors.cellHighlight
            : colors.boardBg,
          cursor:
            isDisabled
              ? "default"
              : "pointer",
          fontWeight: highlight ? 700 : 400
        }}
        aria-label={`Cell ${idx + 1}, ${cell ? cell : "empty"}`}
        onClick={() => handleCellClick(idx)}
        disabled={isDisabled}
        tabIndex={mode && userSymbol && !gameOver ? 0 : -1}
      >
        {cell}
      </button>
    );
  }

  function renderBoard() {
    return (
      <div className="ttt-board">
        {[0, 1, 2].map((row) => (
          <div className="ttt-row" key={row}>
            {[0, 1, 2].map((col) => {
              const idx = row * 3 + col;
              return renderCell(idx);
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderModeSelection() {
    return (
      <div className="ttt-select" style={{ marginBottom: 18 }}>
        <div className="ttt-select-label">
          Choose game mode:
        </div>
        <div className="ttt-select-buttons" style={{ gap: 14 }}>
          <button
            className={`ttt-btn ttt-btn-outline`}
            style={{
              borderColor: colors.primary,
              color: colors.primary
            }}
            onClick={() => handleModeSelect("pvp")}
            aria-label="Player vs Player"
            disabled={!!mode}
          >
            Player vs Player
          </button>
          <button
            className="ttt-btn ttt-btn-accent"
            style={{
              background: colors.accent,
              color: "#fff",
              borderColor: colors.accent
            }}
            onClick={() => handleModeSelect("ai")}
            aria-label="Play vs AI"
            disabled={!!mode}
          >
            Player vs AI
          </button>
        </div>
      </div>
    );
  }

  function renderSymbolSelection() {
    // Only show after mode is picked and userSymbol isn't picked
    if (!mode || userSymbol) return null;
    return (
      <div className="ttt-select">
        <div className="ttt-select-label">
          {mode === "ai" ? "Choose your symbol:" : "Player 1, choose your symbol:"}
        </div>
        <div className="ttt-select-buttons">
          <button
            className="ttt-btn ttt-btn-outline"
            style={{
              borderColor: colors.primary,
              color: colors.primary,
            }}
            onClick={() => handleSymbolSelect("X")}
            aria-label="Play as X"
            disabled={!!userSymbol}
          >
            X
          </button>
          <button
            className="ttt-btn ttt-btn-accent"
            style={{
              background: "#FFA000",
              color: "#fff",
              borderColor: "#FFA000"
            }}
            onClick={() => handleSymbolSelect("O")}
            aria-label="Play as O"
            disabled={!!userSymbol}
          >
            O
          </button>
        </div>
      </div>
    );
  }

  function renderStatus() {
    if (!mode) {
      return (
        <div className="ttt-status">
          <span style={{ color: colors.text }}>
            Select game mode to start.
          </span>
        </div>
      );
    }
    if (!userSymbol) {
      return (
        <div className="ttt-status">
          <span style={{ color: colors.text }}>
            Choose symbol to begin.
          </span>
        </div>
      );
    }
    if (gameOver) {
      if (winner) {
        let winnerText = "";
        if (mode === "ai") {
          winnerText = winner === userSymbol ? "You win!" : "AI wins!";
        } else {
          winnerText = `Winner: ${winner}`;
        }
        return (
          <div className="ttt-status" style={{ color: colors.winner }}>
            {winnerText}
          </div>
        );
      }
      if (isDraw) {
        return (
          <div className="ttt-status" style={{ color: colors.draw }}>
            It's a draw!
          </div>
        );
      }
    }
    // Ongoing game
    let turnText = "";
    if (mode === "ai") {
      turnText = currentPlayer === userSymbol
        ? "Your turn"
        : "AI is thinking...";
    } else {
      turnText = `Player ${currentPlayer}'s turn`;
    }
    return (
      <div className="ttt-status" style={{
        color: (currentPlayer === "X" ? colors.primary : colors.accent),
        fontWeight: 500,
      }}>
        {turnText} {" "}
        {mode === "ai" ? "" : `(${currentPlayer})`}
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: "100vh", background: "#fff", color: "#222" }}>
      <header className="ttt-header">
        <h1 className="ttt-title" style={{ color: colors.primary, marginBottom: 6 }}>
          Tic Tac Toe
        </h1>
        <div className="ttt-subtitle" style={{ color: colors.secondary, marginBottom: 24 }}>
          Play a classic game in a modern style!
        </div>
      </header>
      <main className="ttt-main">
        <div className="ttt-center">
          {renderBoard()}
        </div>
        <section className="ttt-controls" style={{
          background: colors.controlBg, borderRadius: 14, padding: 18, marginTop: 24, boxShadow: "0 4px 16px #ececec22", display: "inline-block", minWidth: 280
        }}>
          {renderModeSelection()}
          {renderSymbolSelection()}
          {renderStatus()}
          <button
            className="ttt-btn ttt-btn-primary"
            style={{
              background: colors.btnPrimary,
              color: colors.btnPrimaryText,
              borderColor: colors.btnPrimary,
              marginTop: 16,
              minWidth: 120
            }}
            onClick={handleReset}
          >
            Reset Game
          </button>
        </section>
      </main>
      <footer style={{ marginTop: 48, marginBottom: 8, color: "#bdbdbd", fontSize: 15, textAlign: "center" }}>
        &copy; {new Date().getFullYear()} React Tic Tac Toe &middot; Modern UI
      </footer>
    </div>
  );
}

export default App;
