import { LobbyClient } from 'boardgame.io/client';

// Same-origin in production; the Vite dev server proxies /games to :8000.
export const SERVER = `${window.location.protocol}//${window.location.host}`;

export const lobby = new LobbyClient({ server: SERVER });

// Seat credentials per match, so a refresh rejoins the same seat.
const KEY = 'gameroom-seats';

export function savedSeat(matchID) {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')[matchID] || null;
  } catch {
    return null;
  }
}

export function saveSeat(matchID, seat) {
  const all = JSON.parse(localStorage.getItem(KEY) || '{}');
  all[matchID] = seat;
  localStorage.setItem(KEY, JSON.stringify(all));
}
