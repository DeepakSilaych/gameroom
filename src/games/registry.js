// The single place a game is registered. Adding a game to the platform:
// write its rules + board component, then add one entry here.
// (Server-side game list lives in server/index.js, which imports the rules
// modules directly — keep the two lists in sync.)
import { Chess } from './chess/game.js';
import { Ludo } from './ludo/game.js';
import ChessBoard from './chess/Board.jsx';
import LudoBoard from './ludo/Board.jsx';

export const GAMES = [
  {
    game: Chess,
    board: ChessBoard,
    name: 'chess',
    title: 'Chess',
    emoji: '♞',
    players: [2],
    tagline: '2 players',
  },
  {
    game: Ludo,
    board: LudoBoard,
    name: 'ludo',
    title: 'Ludo',
    emoji: '🎲',
    players: [2, 3, 4],
    tagline: '2–4 players',
  },
];

export const byName = name => GAMES.find(g => g.name === name);
