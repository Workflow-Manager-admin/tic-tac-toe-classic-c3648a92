import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * App component renders the Tic Tac Toe game, allowing users to select
 * X or O, handles game logic, interaction, and UI.
 */
// PUBLIC_INTERFACE
function App() {
  // State for 3x3 board, displayed as 9-element array
  const [board, setBoard] = useState(Array(9).fill(null));
  // User's chosen symbol ("X" or "O")
  const [userSymbol, setUserSymbol] = useState(null);
  // Track which symbol's turn it is, "X" always starts by convention
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // Win state: null (no winner), "X" or "O"
  const [winner, setWinner] = useState(null);
  // Win line used for highlighting (an array of three indices, or null)
  const [winLine, setWinLine] = useState(null);
  // Track if game is draw (true/false)
  const [isDraw, setIsDraw] = useState(false);

  // Winning combinations (indices into board array)
  const WIN_COMBINATIONS = [
    [0, 1, 2], // rows
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6], // cols
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8], // diags
    [2, 4, 6],
  ];

  // Helper to check winner, returns [winningSymbol, winLineArr] or [null, null]
  // PUBLIC_INTERFACE
  function checkWinner(bd) {
    for (let combo of WIN_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        bd[a] &&
        bd[a] === bd[b] &&
        bd[a] === bd[c]
      ) {
        return [bd[a], combo];
      }
    }
    return [null, null];
  }

  // Whenever the board updates, check for winner/draw
  useEffect(() => {
    const [foundWinner, foundLine] = checkWinner(board);
    setWinner(foundWinner);
    setWinLine(foundLine);
    if (!foundWinner && board.every(cell => cell)) setIsDraw(true);
    else setIsDraw(false);
  }, [board]);

  // Handler: Click a cell for a move
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (winner || isDraw) return;
    if (!userSymbol) return; // block until user selected symbol
    if (board[idx]) return; // cell filled

    // Only allow player with turn to play
    if (currentPlayer !== userSymbol) return;

    const newBoard = [...board];
    newBoard[idx] = currentPlayer;
    setBoard(newBoard);
    setCurrentPlayer((prev) => (prev === "X" ? "O" : "X"));
  }

  // Opponent (O or X opposite to user) auto-plays randomly
  useEffect(() => {
    // only play if no winner, user picked, it's opponent's turn, and not a draw
    if (
      userSymbol &&
      !winner &&
      !isDraw &&
      currentPlayer !== userSymbol
    ) {
      // Find free cells
      const empty = board
        .map((cell, i) => (cell == null ? i : null))
        .filter(x => x !== null);
      // (For two-human-player game, disable this USEFFECT block, in this version we have single-player random bot)
      // For current requirements, no AI/bot, so do nothing
      // If you want PvP only, remove this section
    }
  }, [board, winner, isDraw, userSymbol, currentPlayer, board]);

  // PUBLIC_INTERFACE
  function handleSymbolSelect(sym) {
    setUserSymbol(sym);
    setCurrentPlayer("X"); // reset to X always first
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
    setWinLine(null);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setBoard(Array(9).fill(null));
    setUserSymbol(null);
    setCurrentPlayer("X");
    setWinner(null);
    setIsDraw(false);
    setWinLine(null);
  }

  function renderCell(idx) {
    const highlight = winLine && winLine.includes(idx);
    return (
      <button
        key={idx}
        className="ttt-cell"
        style={{
          color:
            board[idx] === "X"
              ? "var(--ttt-primary)"
              : board[idx] === "O"
              ? "var(--ttt-accent)"
              : "var(--ttt-text)",
          background: highlight
            ? "var(--ttt-cell-highlight)"
            : "var(--ttt-board-bg)",
          fontWeight: highlight ? 700 : 400,
        }}
        aria-label={`Cell ${idx + 1}, ${board[idx] ? board[idx] : "empty"}`}
        onClick={() => handleCellClick(idx)}
        disabled={
          winner ||
          isDraw ||
          !userSymbol ||
          board[idx] ||
          currentPlayer !== userSymbol
        }
        tabIndex={userSymbol && !winner && !isDraw ? 0 : -1}
      >
        {board[idx]}
      </button>
    );
  }

  function renderBoard() {
    return (
      <div className="ttt-board">
        {[0, 1, 2].map(row => (
          <div className="ttt-row" key={row}>
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              return renderCell(idx);
            })}
          </div>
        ))}
      </div>
    );
  }

  function renderSymbolSelection() {
    if (userSymbol) return null;
    return (
      <div className="ttt-select">
        <div className="ttt-select-label">Choose your symbol:</div>
        <div className="ttt-select-buttons">
          <button
            className="ttt-btn ttt-btn-outline"
            style={{
              borderColor: "var(--ttt-primary)",
              color: "var(--ttt-primary)",
            }}
            onClick={() => handleSymbolSelect("X")}
            aria-label="Play as X"
          >
            X
          </button>
          <button
            className="ttt-btn ttt-btn-accent"
            style={{
              background: "var(--ttt-accent)",
              color: "#fff",
              borderColor: "var(--ttt-accent)",
            }}
            onClick={() => handleSymbolSelect("O")}
            aria-label="Play as O"
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
          <span style={{ color: "var(--ttt-text)" }}>
            Choose your symbol to start.
          </span>
        </div>
      );
    if (winner) {
      return (
        <div className="ttt-status" style={{ color: "var(--ttt-winner)" }}>
          Winner: {winner}
        </div>
      );
    }
    if (isDraw) {
      return (
        <div className="ttt-status" style={{ color: "var(--ttt-draw)" }}>
          It's a draw!
        </div>
      );
    }
    // Ongoing
    return (
      <div className="ttt-status" style={{
        color: currentPlayer === "X"
          ? "var(--ttt-primary)"
          : "var(--ttt-accent)",
        fontWeight: 500,
      }}>
        {userSymbol === currentPlayer
          ? "Your turn"
          : `Waiting for opponent...`}
        {" "}
        ({currentPlayer})
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: "100vh", background: "#fff", color: "#222" }}>
      <header className="ttt-header">
        <h1 className="ttt-title" style={{ color: "var(--ttt-primary)" }}>
          Tic Tac Toe
        </h1>
        <div className="ttt-subtitle" style={{ color: "var(--ttt-secondary)", marginBottom: 24 }}>
          Play a classic game in a modern style!
        </div>
      </header>
      <main className="ttt-main">
        <div className="ttt-center">
          {renderBoard()}
        </div>
        <section className="ttt-controls" style={{
          background: "var(--ttt-control-bg)",
          borderRadius: 14,
          padding: 18,
          marginTop: 24,
          boxShadow: "0 4px 16px #ececec22",
          display: "inline-block",
          minWidth: 280,
        }}>
          {renderSymbolSelection()}
          {renderStatus()}
          <button
            className="ttt-btn ttt-btn-primary"
            style={{
              background: "var(--ttt-accent)",
              color: "#fff",
              borderColor: "var(--ttt-accent)",
              marginTop: 16,
              minWidth: 120,
            }}
            onClick={handleReset}
          >
            Reset Game
          </button>
        </section>
      </main>
      <footer style={{
        marginTop: 48,
        marginBottom: 8,
        color: "#bdbdbd",
        fontSize: 15,
        textAlign: "center"
      }}>
        &copy; {new Date().getFullYear()} React Tic Tac Toe &middot; Modern UI
      </footer>
    </div>
  );
}

export default App;
