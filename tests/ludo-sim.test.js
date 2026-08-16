import { test } from 'node:test';
import assert from 'node:assert';
// Plain Node cannot resolve boardgame.io's bundler-style subpath exports,
// so reach into the CJS build directly.
import bgioClient from 'boardgame.io/dist/cjs/client.js';
const { Client } = bgioClient;
import { Ludo, legalMovesFor } from '../src/games/ludo/game.js';
import { DONE_STEP } from '../src/games/ludo/board-geometry.js';

// Play whole games with random choices and assert the rules never wedge:
// every state is valid, turns always progress, and the game ends.
for (const numPlayers of [2, 3, 4]) {
  test(`random ${numPlayers}-player game reaches a winner`, () => {
    const client = Client({ game: Ludo, numPlayers });
    client.start();

    let safety = 20000;
    while (safety-- > 0) {
      const { G, ctx } = client.getState();
      if (ctx.gameover) break;

      const stage = ctx.activePlayers?.[ctx.currentPlayer];
      const color = G.colors[Number(ctx.currentPlayer)];

      if (stage === 'roll') {
        client.moves.roll();
      } else if (stage === 'move') {
        const options = legalMovesFor(G, color);
        assert.ok(options.length > 0, 'in move stage with no legal moves');
        client.moves.movePiece(options[Math.floor(Math.random() * options.length)]);
      } else {
        assert.fail(`unexpected stage: ${stage}`);
      }

      // Invariants after every step.
      for (const c of G.colors) {
        for (const piece of G.pieces[c]) {
          assert.ok(piece.steps >= -1 && piece.steps <= DONE_STEP, `bad steps ${piece.steps}`);
        }
      }
    }

    const { G, ctx } = client.getState();
    assert.ok(ctx.gameover, 'game did not finish within the safety limit');
    assert.ok(G.colors.includes(ctx.gameover.winner));
    assert.ok(G.pieces[ctx.gameover.winner].every(p => p.steps === DONE_STEP));
    client.stop();
  });
}
