# gameroom

Multiplayer board games with one-time share-link rooms, built on
[boardgame.io](https://boardgame.io). Live at
[games.deepaksilaych.me](https://games.deepaksilaych.me).

Create a room → send the link → friends pick a seat → play. Rooms live in
server memory only; a restart clears them. That's a feature.

## Games

| Game | Players | Rules engine |
|---|---|---|
| Chess | 2 | [chess.js](https://github.com/jhlywa/chess.js) |
| Ludo | 2–4 | own (`src/games/ludo/game.js`), classic rules |

## Adding a game

The platform (rooms, turns, sockets, seats, spectators) is boardgame.io's;
a game contributes only rules and a board:

1. `src/games/<name>/game.js` — a boardgame.io game object: `setup`,
   `moves`, `endIf`. Pure functions over plain state, no networking.
   Import `INVALID_MOVE` from `../core.js` (not from boardgame.io — the
   rules modules must load in plain Node for the server and tests).
2. `src/games/<name>/Board.jsx` — a React component receiving
   `{ G, ctx, moves, playerID, matchData }`.
3. Register it in `src/games/registry.js` (client) **and** in the `games`
   array in `server/index.js`.
4. Add tests in `tests/`.

## Development

```bash
npm install
npm test              # rules + geometry tests, headless
npm run build         # client → dist/
npm run server        # serves dist + API on :8000
npm run dev           # vite dev server on :5173, proxies API to :8000
```

## Deploy

Single container (`Dockerfile`): builds the client, runs the Node server,
which serves the static client, the lobby REST API, and socket.io on one
port. No database. Deployed via Dokploy on the VPS.
