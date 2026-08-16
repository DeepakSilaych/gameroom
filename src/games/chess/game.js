import { INVALID_MOVE } from '../core.js';
import { Chess as ChessEngine } from 'chess.js';

// All rules come from chess.js; the game state is just the FEN string.
// Seat 0 plays white, seat 1 plays black.

export const Chess = {
  name: 'chess',
  minPlayers: 2,
  maxPlayers: 2,

  setup: () => ({ fen: new ChessEngine().fen() }),

  moves: {
    move: ({ G, ctx }, from, to, promotion) => {
      const engine = new ChessEngine(G.fen);
      const turn = engine.turn() === 'w' ? '0' : '1';
      if (turn !== ctx.currentPlayer) return INVALID_MOVE;
      try {
        engine.move({ from, to, promotion: promotion || 'q' });
      } catch {
        return INVALID_MOVE;
      }
      G.fen = engine.fen();
    },
  },

  // Each successful move ends the turn (an INVALID_MOVE does not count).
  // chess.js remains the authority on whose turn it is: the order.next
  // callback reads the side to move out of the FEN.
  turn: {
    minMoves: 1,
    maxMoves: 1,
    order: {
      first: () => 0,
      next: ({ G }) => (new ChessEngine(G.fen).turn() === 'w' ? 0 : 1),
    },
  },

  endIf: ({ G }) => {
    const engine = new ChessEngine(G.fen);
    if (!engine.isGameOver()) return;
    if (engine.isCheckmate()) {
      // The side to move is the one mated.
      return { winner: engine.turn() === 'w' ? '1' : '0' };
    }
    return { draw: true };
  },
};
