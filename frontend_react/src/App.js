import React, { useState } from "react";
import "./App.css";

/**
 * App component: Modern Tic Tac Toe
 * Features:
 *  - Display centered 3x3 board, bold visual with color palette per requirement.
 *  - User selects X or O before playing.
 *  - Alternates turns, indicates current player.
 *  - Detects win/draw, displays status.
 *  - "Reset Game" button resets state.
 *  - Responsive, modern light theme using provided colors.
 *  - Uses environment variables for extensibility (example shown).
 */
// PUBLIC_INTERFACE
function App() {
  // == STATE == //
  // Board state: Array of 9 (3x3)
  const [board, setBoard] = useState(Array(9).fill(null));
  // User symbol selection (either 'X' or 'O')
  const [userSymbol, setUserSymbol] = useState(null);
  // Determines turn (starts at "X" which is standard)
  const [currentPlayer, setCurrentPlayer] = useState("X");
  // Winner ("X", "O", or null)
  const [winner, setWinner] = useState(null);
  // If current game is a draw (all squares filled, no winner)
  const [isDraw, setIsDraw] = useState(false);

  // == CONFIG (colors) == //
  const colors = {
    primary: "#1976D2",
    secondary: "#424242",
    accent: "#FFA000",
    // Used throughout, matches App.css config.
  };

  // If environment variables are needed (example: process.env.REACT_APP_API_URL)
  // Default values can be set here as fallback.
  // const baseApiUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";

  // == HELPERS == //
  // Winning combinations (3 rows, 3 cols, 2 diags)
  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  // PUBLIC_INTERFACE
  function calculateWinner(bd) {
    for (let combo of WIN_COMBOS) {
      const [a, b, c] = combo;
      if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) {
        return combo;
      }
    }
    return null;
  }

  // == EVENTS & GAME LOGIC == //

  // When user clicks cell
  // PUBLIC_INTERFACE
  function handleCellClick(idx) {
    if (winner || isDraw || !userSymbol || board[idx]) return;
    if (userSymbol !== currentPlayer) return; // Only let user click when it's their turn

    const newBoard = board.slice();
    newBoard[idx] = currentPlayer;

    // Check for win/draw before updating state
    const winLine = calculateWinner(newBoard);
    if (winLine) {
      setBoard(newBoard);
      setWinner(currentPlayer);
      setIsDraw(false);
      return;
    }
    if (newBoard.every(cell => cell)) {
      setBoard(newBoard);
      setIsDraw(true);
      setWinner(null);
      return;
    }

    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
  }

  // Symbol selection (X or O)
  // PUBLIC_INTERFACE
  function handleSymbolPick(symbol) {
    if (userSymbol) return; // Only allow once
    setUserSymbol(symbol);
    setCurrentPlayer("X");  // X always starts
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
  }

  // PUBLIC_INTERFACE
  function handleReset() {
    setUserSymbol(null);
    setCurrentPlayer("X");
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsDraw(false);
  }

  // == RENDERING UI == //

  // Returns class to highlight the winning combination
  function cellHighlightClass(idx) {
    if (!winner) return "";
    const winLine = calculateWinner(board);
    return winLine && winLine.includes(idx) ? "ttt-cell-highlight" : "";
  }

  // Renders the 3x3 board
  function renderBoard() {
    return (
      <div className="ttt-board">
        {[0, 1, 2].map(row =>
          <div className="ttt-row" key={row}>
            {[0, 1, 2].map(col => {
              const idx = row * 3 + col;
              return (
                <button
                  key={idx}
                  className={"ttt-cell " + cellHighlightClass(idx)}
                  style={{
                    color: board[idx] === "X"
                      ? colors.primary
                      : board[idx] === "O"
                        ? colors.accent
                        : colors.secondary,
                    background: calculateWinner(board)
                      && calculateWinner(board).includes(idx)
                      ? "#FFA00011"
                      : "#fff",
                    fontWeight: calculateWinner(board) && calculateWinner(board).includes(idx) ? 700 : 400,
                  }}
                  aria-label={`Cell ${idx + 1}`}
                  onClick={() => handleCellClick(idx)}
                  disabled={!!winner || isDraw || !userSymbol || !!board[idx] || userSymbol !== currentPlayer}
                  tabIndex={userSymbol && !winner && !isDraw ? 0 : -1}
                >
                  {board[idx]}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Renders the X/O symbol picker before game starts
  function renderSymbolPicker() {
    if (userSymbol) return null;
    return (
      <div className="ttt-select">
        <div className="ttt-select-label">
          Pick your symbol:
        </div>
        <div className="ttt-select-buttons">
          <button
            className="ttt-btn ttt-btn-outline"
            style={{ borderColor: colors.primary, color: colors.primary }}
            onClick={() => handleSymbolPick("X")}
            aria-label="Be X"
            disabled={!!userSymbol}
          >X</button>
          <button
            className="ttt-btn ttt-btn-accent"
            style={{ background: colors.accent, color: "#fff", borderColor: colors.accent }}
            onClick={() => handleSymbolPick("O")}
            aria-label="Be O"
            disabled={!!userSymbol}
          >O</button>
        </div>
      </div>
    );
  }

  // Shows the current status (whose turn, win, or draw)
  function renderStatus() {
    if (!userSymbol) {
      return (
        <div className="ttt-status">
          <span style={{ color: colors.secondary }}>
            Please select your symbol to start.
          </span>
        </div>
      );
    }
    if (winner) {
      return (
        <div className="ttt-status" style={{ color: colors.accent, fontWeight: 700 }}>
          Winner: {winner}
        </div>
      );
    }
    if (isDraw) {
      return (
        <div className="ttt-status" style={{ color: colors.primary, fontWeight: 700 }}>
          It's a draw!
        </div>
      );
    }
    return (
      <div className="ttt-status" style={{
        color: currentPlayer === "X" ? colors.primary : colors.accent,
        fontWeight: 500
      }}>
        Turn: {currentPlayer}
      </div>
    );
  }

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="ttt-title" style={{ color: colors.primary, marginBottom: 6 }}>
          Tic Tac Toe
        </h1>
        <div className="ttt-subtitle" style={{ color: colors.secondary, marginBottom: 24 }}>
          Classic 3x3 game &mdash; Modern UI
        </div>
      </header>
      <main className="ttt-main">
        <div className="ttt-center">
          {renderBoard()}
        </div>
        <section className="ttt-controls" style={{
          background: "#f8f9fa", borderRadius: 14, padding: 18, marginTop: 24, minWidth: 280
        }}>
          {renderSymbolPicker()}
          {renderStatus()}
          <button
            className="ttt-btn ttt-btn-primary"
            style={{
              background: colors.accent,
              color: "#fff",
              borderColor: colors.accent,
              marginTop: 16,
              minWidth: 120
            }}
            onClick={handleReset}
          >Reset Game</button>
        </section>
      </main>
      <footer style={{
        marginTop: 48,
        marginBottom: 8,
        color: "#bdbdbd",
        fontSize: 15,
        textAlign: "center"
      }}>
        &copy; {new Date().getFullYear()} Tic Tac Toe &middot; React Modern UI
      </footer>
    </div>
  );
}

export default App;
