// Geometry of the classic 15x15 Ludo board, shared by rules and UI.
//
// The main track is 52 cells walked clockwise. Cell coordinates are
// [col, row] with the origin at the top-left. Each color enters the track
// at its own offset and, after 51 steps, turns into its 5-cell home
// column and then the center.

export const TRACK = [
  // left arm, walking right along the top lane
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  // up the left lane of the top arm
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  // across the top
  [7, 0], [8, 0],
  // down the right lane of the top arm
  [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  // right arm, walking right along the top lane
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  // down the right edge
  [14, 7], [14, 8],
  // right arm, walking left along the bottom lane
  [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  // down the right lane of the bottom arm
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  // across the bottom
  [7, 14], [6, 14],
  // up the left lane of the bottom arm
  [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  // left arm, walking left along the bottom lane
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  // up the left edge
  [0, 7], [0, 6],
];

// Seat order is fixed: red -> green -> yellow -> blue, clockwise.
export const COLORS = ['red', 'green', 'yellow', 'blue'];

export const START_OFFSET = { red: 0, green: 13, yellow: 26, blue: 39 };

// Track indices where a piece can never be captured: the four entry cells
// plus the four star cells.
export const SAFE_TRACK_CELLS = new Set([0, 13, 26, 39, 8, 21, 34, 47]);

// Home columns, walked from the edge toward the center.
export const HOME_COLUMN = {
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  yellow: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
};

export const CENTER = [7, 7];

// Where the four pieces rest before entering play.
export const BASE_SLOTS = {
  red: [[2, 2], [3, 2], [2, 3], [3, 3]],
  green: [[11, 2], [12, 2], [11, 3], [12, 3]],
  yellow: [[11, 11], [12, 11], [11, 12], [12, 12]],
  blue: [[2, 11], [3, 11], [2, 12], [3, 12]],
};

// Steps semantics for a piece:
//   -1        in base
//   0..50     on the main track (absolute cell = (START_OFFSET + steps) % 52)
//   51..55    in the home column
//   56        done (center)
export const LAST_TRACK_STEP = 50;
export const DONE_STEP = 56;

// Which colors play at each table size. Two players sit opposite.
export const SEAT_COLORS = {
  2: ['red', 'yellow'],
  3: ['red', 'green', 'yellow'],
  4: ['red', 'green', 'yellow', 'blue'],
};

export function trackCellOf(color, steps) {
  return (START_OFFSET[color] + steps) % 52;
}
