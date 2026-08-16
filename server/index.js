import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Plain Node cannot resolve boardgame.io's bundler-style subpath exports,
// so use the CJS build directly.
import bgioServer from 'boardgame.io/dist/cjs/server.js';
import serve from 'koa-static';
import send from 'koa-send';
const { Server, Origins } = bgioServer;
import { Chess } from '../src/games/chess/game.js';
import { Ludo } from '../src/games/ludo/game.js';

const PORT = Number(process.env.PORT) || 8000;
const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '../dist');

const server = Server({
  games: [Chess, Ludo],
  origins: [
    'https://games.deepaksilaych.me',
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

// Storage is the default in-memory store on purpose: rooms are one-time.
// A restart clears every match, and nothing is written to disk.

// Serve the built client. Anything that isn't an API or socket route falls
// back to index.html so /:game/:matchID deep links work.
server.app.use(serve(dist));
server.app.use(async (ctx, next) => {
  await next();
  if (
    ctx.status === 404 &&
    ctx.method === 'GET' &&
    !ctx.path.startsWith('/games') &&
    !ctx.path.startsWith('/socket.io')
  ) {
    await send(ctx, 'index.html', { root: dist });
  }
});

server.run(PORT, () => {
  console.log(`gameroom listening on :${PORT}`);
});
