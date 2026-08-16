import { test } from 'node:test';
import assert from 'node:assert';
import bgioClient from 'boardgame.io/dist/cjs/client.js';
import { Chess } from '../src/games/chess/game.js';

const { Client } = bgioClient;

test('turns alternate and illegal moves are rejected without passing the turn', () => {
  const c = Client({ game: Chess, numPlayers: 2 });
  c.start();
  c.moves.move('e2', 'e4');
  assert.equal(c.getState().ctx.currentPlayer, '1');
  c.moves.move('e7', 'e5');
  assert.equal(c.getState().ctx.currentPlayer, '0');
  const fen = c.getState().G.fen;
  c.moves.move('e5', 'e4'); // black tries to move again, out of turn
  assert.equal(c.getState().G.fen, fen);
  assert.equal(c.getState().ctx.currentPlayer, '0');
  c.stop();
});

test("scholar's mate ends the game with white as winner", () => {
  const c = Client({ game: Chess, numPlayers: 2 });
  c.start();
  const seq = [
    ['e2', 'e4'], ['e7', 'e5'],
    ['d1', 'h5'], ['b8', 'c6'],
    ['f1', 'c4'], ['g8', 'f6'],
    ['h5', 'f7'],
  ];
  for (const [from, to] of seq) c.moves.move(from, to);
  assert.deepEqual(c.getState().ctx.gameover, { winner: '0' });
  c.stop();
});
