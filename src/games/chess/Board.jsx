import React, { useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess as ChessEngine } from 'chess.js';
import { sfx } from '../../sounds.js';

const pieceCount = fen => (fen.split(' ')[0].match(/[a-zA-Z]/g) || []).length;

export default function ChessBoard({ G, ctx, moves, playerID, matchData }) {
  const prev = useRef({ fen: G.fen, gameover: false });
  useEffect(() => {
    const before = prev.current;
    if (G.fen !== before.fen) {
      if (ctx.gameover && !before.gameover) sfx.win();
      else if (pieceCount(G.fen) < pieceCount(before.fen)) sfx.capture();
      else sfx.move();
    }
    prev.current = { fen: G.fen, gameover: !!ctx.gameover };
  }, [G.fen, ctx.gameover]);

  const engine = new ChessEngine(G.fen);
  const myTurn = playerID != null && ctx.currentPlayer === playerID && !ctx.gameover;
  const orientation = playerID === '1' ? 'black' : 'white';

  const nameOf = id =>
    matchData?.find(p => String(p.id) === id)?.name || (id === '0' ? 'White' : 'Black');

  const onDrop = (from, to) => {
    if (!myTurn) return false;
    // Validate locally so an illegal drop snaps back instantly.
    const probe = new ChessEngine(G.fen);
    try {
      probe.move({ from, to, promotion: 'q' });
    } catch {
      return false;
    }
    moves.move(from, to, 'q');
    return true;
  };

  let status;
  if (ctx.gameover) {
    status = ctx.gameover.draw
      ? 'Draw.'
      : `Checkmate — ${nameOf(ctx.gameover.winner)} wins!`;
  } else {
    status = `${nameOf(ctx.currentPlayer)} to move${engine.inCheck() ? ' — check!' : ''}`;
    if (myTurn) status = `Your move${engine.inCheck() ? ' — you are in check!' : ''}`;
  }

  return (
    <div className="chess-board">
      <p className="status">{status}</p>
      <div className="chess-square">
        <Chessboard
          position={G.fen}
          onPieceDrop={onDrop}
          boardOrientation={orientation}
          arePiecesDraggable={myTurn}
        />
      </div>
      <p className="players">
        ♔ {nameOf('0')} · ♚ {nameOf('1')}
        {playerID == null && ' · watching'}
      </p>
    </div>
  );
}
