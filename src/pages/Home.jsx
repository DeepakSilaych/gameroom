import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAMES } from '../games/registry.js';
import { lobby } from '../lobby.js';

export default function Home() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [numPlayers, setNumPlayers] = useState({ ludo: 4 });

  const createRoom = async game => {
    setBusy(true);
    setError(null);
    try {
      const players = game.players.length === 1 ? game.players[0] : numPlayers[game.name] || game.players[game.players.length - 1];
      const { matchID } = await lobby.createMatch(game.name, { numPlayers: players });
      navigate(`/${game.name}/${matchID}`);
    } catch (e) {
      setError(`Could not create a room: ${e.message}`);
      setBusy(false);
    }
  };

  return (
    <main className="home">
      <h1>🎲 gameroom</h1>
      <p className="sub">
        Create a room, send the link, play. Rooms are temporary — they vanish
        when everyone leaves.
      </p>
      {error && <p className="error">{error}</p>}
      <div className="game-cards">
        {GAMES.map(game => (
          <div className="card" key={game.name}>
            <div className="card-emoji">{game.emoji}</div>
            <h2>{game.title}</h2>
            <p>{game.tagline}</p>
            {game.players.length > 1 && (
              <label>
                Players{' '}
                <select
                  value={numPlayers[game.name] || game.players[game.players.length - 1]}
                  onChange={e =>
                    setNumPlayers({ ...numPlayers, [game.name]: Number(e.target.value) })
                  }
                >
                  {game.players.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            )}
            <button disabled={busy} onClick={() => createRoom(game)}>
              Create room
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
