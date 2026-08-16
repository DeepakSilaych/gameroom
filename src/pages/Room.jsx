import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { byName } from '../games/registry.js';
import { lobby, SERVER, savedSeat, saveSeat } from '../lobby.js';

export default function Room() {
  const { gameName, matchID } = useParams();
  const meta = byName(gameName);
  const [match, setMatch] = useState(null);
  const [gone, setGone] = useState(false);
  const [seat, setSeat] = useState(() => savedSeat(matchID));
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);

  // Poll the seat list so newly joined players appear. The in-game state
  // itself is pushed over the socket; this is only for the header.
  useEffect(() => {
    let stop = false;
    const fetchMatch = () =>
      lobby
        .getMatch(gameName, matchID)
        .then(m => !stop && setMatch(m))
        .catch(() => !stop && setGone(true));
    fetchMatch();
    const t = setInterval(fetchMatch, 3000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [gameName, matchID]);

  const GameClient = useMemo(() => {
    if (!meta) return null;
    return Client({
      game: meta.game,
      board: meta.board,
      multiplayer: SocketIO({ server: SERVER }),
      debug: false,
    });
  }, [meta]);

  if (!meta) return <main className="room"><p>Unknown game “{gameName}”. <Link to="/">Home</Link></p></main>;
  if (gone)
    return (
      <main className="room">
        <p>
          This room no longer exists — rooms are temporary and cleared on
          server restart. <Link to="/">Create a new one</Link>
        </p>
      </main>
    );

  const join = async playerID => {
    const playerName = name.trim() || `Player ${Number(playerID) + 1}`;
    try {
      const { playerCredentials } = await lobby.joinMatch(gameName, matchID, {
        playerID,
        playerName,
      });
      const s = { playerID, credentials: playerCredentials, name: playerName };
      saveSeat(matchID, s);
      setSeat(s);
    } catch (e) {
      alert(`Could not take that seat: ${e.message}`);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const seats = match ? match.players : [];
  const openSeats = seats.filter(p => !p.name);

  return (
    <main className="room">
      <header className="room-header">
        <Link to="/" className="brand">🎲 gameroom</Link>
        <span className="room-title">{meta.title}</span>
        <button className="copy" onClick={copyLink}>
          {copied ? 'Copied!' : 'Copy invite link'}
        </button>
      </header>

      {!seat && (
        <section className="seat-picker">
          <h2>Pick a seat</h2>
          <input
            placeholder="Your name"
            value={name}
            maxLength={20}
            onChange={e => setName(e.target.value)}
          />
          <div className="seats">
            {seats.map(p => (
              <button
                key={p.id}
                disabled={!!p.name}
                onClick={() => join(String(p.id))}
              >
                {p.name ? `${p.name}` : `Seat ${p.id + 1} — free`}
              </button>
            ))}
          </div>
          <p className="hint">…or just watch. Spectators see the live game below.</p>
        </section>
      )}

      {seat && openSeats.length > 0 && (
        <p className="waiting">
          Waiting for {openSeats.length} more player{openSeats.length > 1 ? 's' : ''} —
          send them the invite link.
        </p>
      )}

      {GameClient && (
        <GameClient
          matchID={matchID}
          playerID={seat ? seat.playerID : null}
          credentials={seat ? seat.credentials : undefined}
        />
      )}
    </main>
  );
}
