import React from 'react';
import {
  TRACK,
  START_OFFSET,
  SAFE_TRACK_CELLS,
  HOME_COLUMN,
  CENTER,
  BASE_SLOTS,
  LAST_TRACK_STEP,
  DONE_STEP,
  trackCellOf,
} from './board-geometry.js';
import { legalMovesFor } from './game.js';

const CELL = 40; // SVG units per grid cell; viewBox is 15 * CELL square.

const FILL = {
  red: '#e5484d',
  green: '#30a46c',
  yellow: '#f0c000',
  blue: '#3e63dd',
};

const QUADRANT = {
  red: [0, 0],
  green: [9, 0],
  yellow: [9, 9],
  blue: [0, 9],
};

const px = ([col, row]) => [col * CELL, row * CELL];
const centerOf = ([col, row]) => [(col + 0.5) * CELL, (row + 0.5) * CELL];

function cellOfPiece(color, piece, pieceIndex) {
  if (piece.steps === -1) return BASE_SLOTS[color][pieceIndex];
  if (piece.steps <= LAST_TRACK_STEP) return TRACK[trackCellOf(color, piece.steps)];
  if (piece.steps < DONE_STEP) return HOME_COLUMN[color][piece.steps - 51];
  return CENTER;
}

export default function LudoBoard({ G, ctx, moves, playerID, matchData }) {
  const myColor = playerID != null ? G.colors[Number(playerID)] : null;
  const currentColor = G.colors[Number(ctx.currentPlayer)];
  const stage = ctx.activePlayers?.[ctx.currentPlayer];
  const isMe = playerID === ctx.currentPlayer && !ctx.gameover;
  const movable = isMe && stage === 'move' ? legalMovesFor(G, myColor) : [];

  const nameOf = id => matchData?.find(p => String(p.id) === id)?.name || `Player ${Number(id) + 1}`;
  const nameOfColor = color => nameOf(String(G.colors.indexOf(color)));

  // Group pieces by the cell they occupy so stacks fan out visibly.
  const byCell = new Map();
  for (const color of G.colors) {
    G.pieces[color].forEach((piece, i) => {
      const cell = cellOfPiece(color, piece, i);
      const key = cell.join(',');
      if (!byCell.has(key)) byCell.set(key, []);
      byCell.get(key).push({ color, piece, index: i });
    });
  }

  let status;
  if (ctx.gameover) {
    status = `🏆 ${nameOfColor(ctx.gameover.winner)} (${ctx.gameover.winner}) wins!`;
  } else if (isMe) {
    status = stage === 'roll' ? 'Your turn — roll!' : `You rolled ${G.die} — pick a piece`;
  } else {
    const last = G.lastRoll && G.lastRoll.color !== currentColor
      ? ` (last roll: ${G.lastRoll.die})`
      : '';
    status = `${nameOfColor(currentColor)} (${currentColor}) is playing${last}`;
  }

  return (
    <div className="ludo-board">
      <p className="status">
        <span className="dot" style={{ background: FILL[currentColor] }} />
        {status}
      </p>

      <svg viewBox={`0 0 ${15 * CELL} ${15 * CELL}`} className="ludo-svg">
        {/* board background */}
        <rect width={15 * CELL} height={15 * CELL} fill="#faf7f2" rx={8} />

        {/* quadrant bases */}
        {Object.entries(QUADRANT).map(([color, [qc, qr]]) => (
          <g key={color}>
            <rect x={qc * CELL} y={qr * CELL} width={6 * CELL} height={6 * CELL} fill={FILL[color]} rx={8} />
            <rect x={(qc + 1) * CELL} y={(qr + 1) * CELL} width={4 * CELL} height={4 * CELL} fill="#fff" rx={6} />
            {BASE_SLOTS[color].map((slot, i) => {
              const [cx, cy] = centerOf(slot);
              return <circle key={i} cx={cx} cy={cy} r={CELL * 0.32} fill="none" stroke={FILL[color]} strokeWidth={2} />;
            })}
          </g>
        ))}

        {/* track cells */}
        {TRACK.map((cell, i) => {
          const [x, y] = px(cell);
          const isStart = Object.values(START_OFFSET).includes(i);
          const startColor = isStart
            ? Object.keys(START_OFFSET).find(c => START_OFFSET[c] === i)
            : null;
          return (
            <g key={i}>
              <rect
                x={x} y={y} width={CELL} height={CELL}
                fill={startColor ? FILL[startColor] : '#fff'}
                stroke="#c9c2b8" strokeWidth={1}
              />
              {SAFE_TRACK_CELLS.has(i) && !startColor && (
                <text x={x + CELL / 2} y={y + CELL * 0.68} textAnchor="middle" fontSize={CELL * 0.5} fill="#b0a89c">★</text>
              )}
            </g>
          );
        })}

        {/* home columns */}
        {Object.entries(HOME_COLUMN).map(([color, cells]) =>
          cells.map((cell, i) => {
            const [x, y] = px(cell);
            return <rect key={`${color}${i}`} x={x} y={y} width={CELL} height={CELL} fill={FILL[color]} opacity={0.85} stroke="#c9c2b8" />;
          })
        )}

        {/* center */}
        <g>
          <rect x={6 * CELL} y={6 * CELL} width={3 * CELL} height={3 * CELL} fill="#fff" stroke="#c9c2b8" />
          <polygon points={`${6 * CELL},${6 * CELL} ${9 * CELL},${6 * CELL} ${7.5 * CELL},${7.5 * CELL}`} fill={FILL.green} />
          <polygon points={`${9 * CELL},${6 * CELL} ${9 * CELL},${9 * CELL} ${7.5 * CELL},${7.5 * CELL}`} fill={FILL.yellow} />
          <polygon points={`${9 * CELL},${9 * CELL} ${6 * CELL},${9 * CELL} ${7.5 * CELL},${7.5 * CELL}`} fill={FILL.blue} />
          <polygon points={`${6 * CELL},${9 * CELL} ${6 * CELL},${6 * CELL} ${7.5 * CELL},${7.5 * CELL}`} fill={FILL.red} />
        </g>

        {/* pieces */}
        {[...byCell.entries()].map(([key, stack]) =>
          stack.map(({ color, index }, stackIdx) => {
            const cell = key.split(',').map(Number);
            let [cx, cy] = centerOf(cell);
            if (stack.length > 1) {
              const angle = (2 * Math.PI * stackIdx) / stack.length;
              cx += Math.cos(angle) * CELL * 0.18;
              cy += Math.sin(angle) * CELL * 0.18;
            }
            const clickable = color === myColor && movable.includes(index);
            return (
              <g
                key={`${color}-${index}`}
                onClick={clickable ? () => moves.movePiece(index) : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
              >
                {clickable && (
                  <circle cx={cx} cy={cy} r={CELL * 0.34} fill="none" stroke="#111" strokeWidth={3} className="pulse" />
                )}
                <circle cx={cx} cy={cy} r={CELL * 0.27} fill={FILL[color]} stroke="#3a3530" strokeWidth={1.5} />
                <circle cx={cx - CELL * 0.07} cy={cy - CELL * 0.07} r={CELL * 0.07} fill="#ffffff88" />
              </g>
            );
          })
        )}
      </svg>

      <div className="ludo-controls">
        {isMe && stage === 'roll' ? (
          <button className="roll" onClick={() => moves.roll()}>🎲 Roll</button>
        ) : (
          <div className="die-face">{G.die ? `🎲 ${G.die}` : ' '}</div>
        )}
      </div>

      <p className="players">
        {G.colors.map(color => (
          <span key={color} style={{ color: FILL[color], fontWeight: color === currentColor ? 700 : 400 }}>
            ● {nameOfColor(color)}{' '}
          </span>
        ))}
        {playerID == null && ' · watching'}
      </p>
    </div>
  );
}
