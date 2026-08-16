import { test } from 'node:test';
import assert from 'node:assert';
import {
  TRACK,
  START_OFFSET,
  HOME_COLUMN,
  SAFE_TRACK_CELLS,
  trackCellOf,
} from '../src/games/ludo/board-geometry.js';

test('track has 52 unique cells', () => {
  assert.equal(TRACK.length, 52);
  const keys = new Set(TRACK.map(c => c.join(',')));
  assert.equal(keys.size, 52);
});

test('track cells are inside the cross arms', () => {
  for (const [col, row] of TRACK) {
    const inHorizontal = row >= 6 && row <= 8 && col >= 0 && col <= 14;
    const inVertical = col >= 6 && col <= 8 && row >= 0 && row <= 14;
    assert.ok(inHorizontal || inVertical, `cell ${col},${row} outside arms`);
    const inCenter = col >= 6 && col <= 8 && row >= 6 && row <= 8;
    assert.ok(!inCenter, `cell ${col},${row} inside center`);
  }
});

test('consecutive track cells are adjacent, with exactly 4 diagonal corners', () => {
  // The track bends diagonally at the four inner corners of the cross
  // (there is no track cell at the center's corners); every other step is
  // orthogonal.
  let diagonals = 0;
  for (let i = 0; i < 52; i++) {
    const [c1, r1] = TRACK[i];
    const [c2, r2] = TRACK[(i + 1) % 52];
    const dc = Math.abs(c1 - c2);
    const dr = Math.abs(r1 - r2);
    assert.equal(Math.max(dc, dr), 1, `gap between ${i} and ${i + 1}`);
    if (dc === 1 && dr === 1) diagonals++;
  }
  assert.equal(diagonals, 4);
});

test('start cells sit just after each home-column entrance', () => {
  // Each color's step-50 cell (last before home) must be adjacent to its
  // first home-column cell.
  for (const color of Object.keys(START_OFFSET)) {
    const [c1, r1] = TRACK[trackCellOf(color, 50)];
    const [c2, r2] = HOME_COLUMN[color][0];
    assert.equal(Math.abs(c1 - c2) + Math.abs(r1 - r2), 1, `${color} home entry misaligned`);
  }
});

test('home columns are 5 cells and unique', () => {
  const all = new Set();
  for (const cells of Object.values(HOME_COLUMN)) {
    assert.equal(cells.length, 5);
    cells.forEach(c => all.add(c.join(',')));
  }
  assert.equal(all.size, 20);
});

test('safe cells include all four starts', () => {
  for (const offset of Object.values(START_OFFSET)) {
    assert.ok(SAFE_TRACK_CELLS.has(offset));
  }
});
