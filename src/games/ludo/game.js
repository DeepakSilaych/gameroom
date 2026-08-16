import { INVALID_MOVE } from '../core.js';
import {
  SEAT_COLORS,
  SAFE_TRACK_CELLS,
  LAST_TRACK_STEP,
  DONE_STEP,
  trackCellOf,
} from './board-geometry.js';

// A piece is { steps } — see board-geometry.js for the steps semantics.

function legalMovesFor(G, color) {
  const die = G.die;
  if (!die) return [];
  const moves = [];
  G.pieces[color].forEach((piece, i) => {
    if (piece.steps === DONE_STEP) return;
    if (piece.steps === -1) {
      if (die === 6) moves.push(i);
      return;
    }
    if (piece.steps + die <= DONE_STEP) moves.push(i);
  });
  return moves;
}

function applyMove(G, color, pieceIndex) {
  const piece = G.pieces[color][pieceIndex];
  let captured = false;

  piece.steps = piece.steps === -1 ? 0 : piece.steps + G.die;

  // Capture: only on the shared track, never on safe cells.
  if (piece.steps <= LAST_TRACK_STEP) {
    const cell = trackCellOf(color, piece.steps);
    if (!SAFE_TRACK_CELLS.has(cell)) {
      for (const other of G.colors) {
        if (other === color) continue;
        for (const enemy of G.pieces[other]) {
          if (
            enemy.steps >= 0 &&
            enemy.steps <= LAST_TRACK_STEP &&
            trackCellOf(other, enemy.steps) === cell
          ) {
            enemy.steps = -1;
            captured = true;
          }
        }
      }
    }
  }
  return captured;
}

export const Ludo = {
  name: 'ludo',
  minPlayers: 2,
  maxPlayers: 4,

  setup: ({ ctx }) => {
    const colors = SEAT_COLORS[ctx.numPlayers] || SEAT_COLORS[4];
    const pieces = {};
    for (const color of colors) {
      pieces[color] = [{ steps: -1 }, { steps: -1 }, { steps: -1 }, { steps: -1 }];
    }
    return {
      colors,
      pieces,
      die: null,
      // What the previous player rolled, so a skipped turn is visible.
      lastRoll: null,
    };
  },

  turn: {
    activePlayers: { currentPlayer: 'roll' },
    stages: {
      roll: {
        moves: {
          roll: ({ G, ctx, random, events }) => {
            const color = G.colors[Number(ctx.currentPlayer)];
            G.die = random.D6();
            G.lastRoll = { color, die: G.die };
            if (legalMovesFor(G, color).length === 0) {
              G.die = null;
              events.endTurn();
              return;
            }
            events.setStage('move');
          },
        },
      },
      move: {
        moves: {
          movePiece: ({ G, ctx, events }, pieceIndex) => {
            const color = G.colors[Number(ctx.currentPlayer)];
            if (!legalMovesFor(G, color).includes(pieceIndex)) return INVALID_MOVE;
            const die = G.die;
            const captured = applyMove(G, color, pieceIndex);
            const finished = G.pieces[color][pieceIndex].steps === DONE_STEP;
            G.die = null;
            // Classic bonus turn: rolling a six, taking a piece, or bringing
            // a piece home lets the same player roll again.
            if (die === 6 || captured || finished) {
              events.setStage('roll');
            } else {
              events.endTurn();
            }
          },
        },
      },
    },
  },

  endIf: ({ G }) => {
    for (const color of G.colors) {
      if (G.pieces[color].every(p => p.steps === DONE_STEP)) {
        return { winner: color };
      }
    }
  },
};

export { legalMovesFor };
