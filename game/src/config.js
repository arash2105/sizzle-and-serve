// Shared constants: the layout rectangles here are the single source of truth
// for both rendering and mouse hit-testing, so a click always lands where the
// picture says it does. All coordinates are in the game's logical 1280x720
// space; the canvas scales to the window.

export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const BEST_KEY = 'sizzle_best';

// ---- layout ----
export const HUD = { x: 0, y: 0, w: 1280, h: 48 };
export const BOARD = { x: 24, y: 56, w: 1232, h: 140 };
export const BOARD_TICKET_W = 400;
export const BOARD_TICKET_GAP = 16;
export const BOARD_TICKET_H = 124;

export const BOARD_STATION = { x: 36, y: 296, w: 260, h: 150 };
export const STOVE = { x: 332, y: 296, w: 336, h: 150 };
export const PAN0 = { x: 356, y: 316, w: 132, h: 110 };
export const PAN1 = { x: 512, y: 316, w: 132, h: 110 };
export const PLATE = { x: 700, y: 296, w: 280, h: 150, cx: 840, cy: 372, rx: 118, ry: 62 };
export const BELL = { x: 1016, y: 296, w: 148, h: 150, cx: 1090, cy: 356 };
export const TRASH = { x: 1184, y: 296, w: 72, h: 150, cx: 1220, cy: 372 };

export const BINS = { x: 36, y: 560, w: 148, h: 140, gap: 8 };
export const BIN_COUNT = 8;

export const START_BUTTON = { x: 490, y: 452, w: 300, h: 64 };
export const RESTART_BUTTON = { x: 490, y: 478, w: 300, h: 64 };

// ---- ingredients ----
// prep: 'chop' means it must be chopped first; cook: seconds on the stove
// (0 means it never needs cooking). needsPrep is derived from prep.
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', color: '#d99b52', dark: '#a86f2e', prep: null, cook: 0 },
  { id: 'patty', name: 'Patty', color: '#7a4a28', dark: '#54301a', prep: null, cook: 4 },
  { id: 'lettuce', name: 'Lettuce', color: '#58b368', dark: '#2f7d3d', prep: 'chop', cook: 0 },
  { id: 'tomato', name: 'Tomato', color: '#d94343', dark: '#9e2626', prep: 'chop', cook: 0 },
  { id: 'cheese', name: 'Cheese', color: '#f2c94c', dark: '#c39a1d', prep: null, cook: 0 },
  { id: 'onion', name: 'Onion', color: '#c39bd3', dark: '#8e5aa8', prep: 'chop', cook: 0 },
  { id: 'sauce', name: 'Sauce', color: '#c73e3a', dark: '#8f2320', prep: null, cook: 0 },
  { id: 'egg', name: 'Egg', color: '#f7f1e3', dark: '#d8cfae', prep: null, cook: 3 },
];
export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

// ---- dishes ----
export const DISHES = [
  { id: 'classic', name: 'Classic Burger', recipe: ['bun', 'patty', 'lettuce', 'bun'], reward: 100, coins: 15, time: 30 },
  { id: 'cheese', name: 'Cheeseburger Deluxe', recipe: ['bun', 'patty', 'cheese', 'tomato', 'bun'], reward: 150, coins: 25, time: 35 },
  { id: 'mega', name: 'Mega Stack', recipe: ['bun', 'patty', 'cheese', 'onion', 'sauce', 'patty', 'bun'], reward: 280, coins: 45, time: 45 },
  { id: 'sunny', name: 'Sunny Breakfast', recipe: ['bun', 'patty', 'egg', 'cheese', 'bun'], reward: 200, coins: 30, time: 35 },
];
export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

// ---- tuning ----
export const SHIFT_TIME = 150; // seconds per shift
export const MAX_STRIKES = 3;
export const MAX_ORDERS = 3;
export const ORDER_SPAWN_EVERY = 7; // seconds between new orders
export const COMBO_WINDOW = 6; // seconds a combo stays alive
export const COMBO_BONUS = 20; // extra points per combo step
export const CHOP_TIME = 2; // seconds of chopping (4 clicks)
export const CHOP_PER_CLICK = 0.5; // seconds of progress per chop click
export const BURN_AFTER = 1.8; // burn at 1.8x the cook time
