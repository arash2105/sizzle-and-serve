// Mouse and keyboard input. Hit zones come from config.js, the same
// rectangles the renderer draws, so a click lands where the picture says.
import {
  BELL, BINS, BIN_COUNT, BOARD_STATION, INGREDIENTS, PAN0, PAN1, PLATE,
  STOVE, TRASH,
} from './config.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

function inRect(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function zoneAt(x, y, world) {
  if (world.screen === SCREEN_TITLE) return 'start';
  if (world.screen === SCREEN_OVER) return 'restart';
  if (world.screen === SCREEN_PAUSED) return 'resume';
  if (world.screen !== SCREEN_PLAY) return null;
  if (inRect(x, y, BINS)) {
    const i = Math.floor((x - BINS.x) / (BINS.w + BINS.gap));
    if (i >= 0 && i < BIN_COUNT) return `bin-${i}`;
  }
  if (inRect(x, y, BOARD_STATION)) return 'board';
  if (inRect(x, y, PAN0)) return 'pan-0';
  if (inRect(x, y, PAN1)) return 'pan-1';
  if (inRect(x, y, PLATE)) return 'plate';
  if (inRect(x, y, BELL)) return 'bell';
  if (inRect(x, y, TRASH)) return 'trash';
  return null;
}

export function createInput(canvas, world, pointer, announce) {
  function toLogical(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * 1280) / rect.width,
      y: ((e.clientY - rect.top) * 720) / rect.height,
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = toLogical(e);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.zone = zoneAt(p.x, p.y, world);
  });

  canvas.addEventListener('mousedown', (e) => {
    const p = toLogical(e);
    pointer.x = p.x;
    pointer.y = p.y;
    world.initAudio();
    activate(zoneAt(p.x, p.y, world));
  });

  function activate(zone) {
    if (!zone) return;
    if (zone === 'start') {
      world.startShift();
      announce('Playing. Serve the orders before time runs out.');
      return;
    }
    if (zone === 'restart') {
      world.startShift();
      announce('Playing. Serve the orders before time runs out.');
      return;
    }
    if (zone === 'resume') {
      world.screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    if (world.screen !== SCREEN_PLAY) return;
    if (zone.startsWith('bin-')) {
      const i = Number(zone.slice(4));
      world.pickIngredient(INGREDIENTS[i].id);
      return;
    }
    if (zone === 'board') world.interactBoard();
    else if (zone === 'pan-0') world.interactPan(0);
    else if (zone === 'pan-1') world.interactPan(1);
    else if (zone === 'plate') world.addToPlate();
    else if (zone === 'bell') world.serveDish();
    else if (zone === 'trash') {
      if (world.held) world.trashHeld();
      else world.clearPlate();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;
    const key = e.key;
    if (key === 'p' || key === 'P' || key === 'Escape') {
      if (world.screen === SCREEN_PLAY) {
        world.screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (world.screen === SCREEN_PAUSED) {
        world.screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    if (world.screen === SCREEN_TITLE && (key === ' ' || key === 'Enter')) {
      world.initAudio();
      world.startShift();
      announce('Playing. Serve the orders before time runs out.');
      return;
    }
    if (world.screen === SCREEN_OVER && (key === ' ' || key === 'Enter' || key === 'r' || key === 'R')) {
      world.initAudio();
      world.startShift();
      announce('Playing. Serve the orders before time runs out.');
      return;
    }
    if (world.screen === SCREEN_PAUSED) return;
    if (world.screen !== SCREEN_PLAY) return;
    if (key >= '1' && key <= '8') {
      const i = Number(key) - 1;
      if (i < INGREDIENTS.length) world.pickIngredient(INGREDIENTS[i].id);
      return;
    }
    if (key === ' ' || key === 'Enter') {
      if (world.board) world.interactBoard();
      else if (world.held) world.addToPlate();
      else if (world.plate.length > 0) world.serveDish();
      return;
    }
    if (key === 's' || key === 'S') world.serveDish();
    else if (key === 'c' || key === 'C') world.clearPlate();
    else if (key === 't' || key === 'T') world.trashHeld();
  });

  return { activate, zoneAt };
}
