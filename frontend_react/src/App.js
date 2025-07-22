import React, { useState, useEffect } from "react";
import "./App.css";

// PUBLIC_INTERFACE
/**
 * App component renders the Tic Tac Toe game with a modern, light-themed UI,
 * allowing users to select their side, play, and reset the game.
 */
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

  // Find winner combination indices
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

  // Mark a cell on the board
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    // Don't allow actions if not selected or if game over or cell filled
    if (!userSymbol || gameOver || board[idx]) return;
    // Only current player's turn
    if (currentPlayer !== userSymbol) return;
    // Place symbol, switch turn
    const nextBoard = board.slice();
    nextBoard[idx] = currentPlayer;
    setBoard(nextBoard);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  }

  // PUBLIC_INTERFACE
  function handleSymbolSelect(symbol) {
    if (userSymbol) return; // Only allow one-time selection
    setUserSymbol(symbol);
    setCurrentPlayer("X"); // X always starts
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setIsDraw(false);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setWinner(null);
    setCurrentPlayer("X");
    setUserSymbol(null);
    setIsDraw(false);
  }

  // Highlight winning line
  let winLine = getWinLine(board);

  // UI Components

  function renderCell(idx) {
    const cell = board[idx];
    const highlight = winLine && winLine.includes(idx);
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
            !userSymbol || gameOver || cell || currentPlayer !== userSymbol
              ? "default"
              : "pointer",
          fontWeight: highlight ? 700 : 400
        }}
        aria-label={`Cell ${idx + 1}, ${cell ? cell : "empty"}`}
        onClick={() => handleCellClick(idx)}
        disabled={
          !userSymbol ||
          gameOver ||
          board[idx] ||
          currentPlayer !== userSymbol
        }
        tabIndex={userSymbol && !gameOver ? 0 : -1}
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

  function renderSymbolSelection() {
    return (
      <div className="ttt-select">
        <div className="ttt-select-label">
          Choose your symbol:
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
    if (!userSymbol)
      return (
        <div className="ttt-status">
          <span style={{ color: colors.text }}>
            Select your symbol to start.
          </span>
        </div>
      );
    if (gameOver) {
      if (winner) {
        return (
          <div className="ttt-status" style={{ color: colors.winner }}>
            Winner: <b>{winner}</b>
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
    return (
      <div className="ttt-status" style={{
        color: (currentPlayer === "X" ? colors.primary : colors.accent),
        fontWeight: 500,
      }}>
        {currentPlayer === userSymbol ? "Your turn" : "Waiting..."} {" "}
        ({currentPlayer}&rsquo;s move)
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
