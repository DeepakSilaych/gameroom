// boardgame.io compares a move's return value against this exact string
// (its own INVALID_MOVE constant). Defining it here keeps the rules modules
// free of boardgame.io imports, so they load in plain Node (server, tests)
// where the package's bundler-style subpath exports do not resolve.
export const INVALID_MOVE = 'INVALID_MOVE';
