import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the game title", () => {
  render(<App />);
  const titleElement = screen.getByText(/Tic Tac Toe/i);
  expect(titleElement).toBeInTheDocument();
});

test("renders symbol picker on start", () => {
  render(<App />);
  const symbolPrompt = screen.getByText(/Pick your symbol/i);
  expect(symbolPrompt).toBeInTheDocument();
});
