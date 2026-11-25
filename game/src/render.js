// All drawing: a warm little kitchen in the game's logical 1280x720 space.
// Every shape is drawn in code; no images, no web fonts, no network.
import {
  BELL, BINS, BIN_COUNT, BOARD, BOARD_STATION, BOARD_TICKET_GAP,
  BOARD_TICKET_H, BOARD_TICKET_W, DISH_BY_ID, HUD, INGREDIENTS,
  INGREDIENT_BY_ID, MAX_STRIKES, PAN0, PAN1, PLATE, RESTART_BUTTON,
  START_BUTTON, STOVE, TRASH, VIEW,
} from './config.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, font, color, align = 'left', baseline = 'alphabetic') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(str, x, y);
}

export function drawIngredient(ctx, id, x, y, s) {
  const def = INGREDIENT_BY_ID[id];
  if (!def) return;
  ctx.save();
  ctx.lineWidth = Math.max(1.5, s * 0.08);
  ctx.strokeStyle = def.dark;
  if (id === 'bun') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(x, y + s * 0.3, s, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = def.dark;
    ctx.fillRect(x - s, y + s * 0.3, s * 2, s * 0.4);
    ctx.fillStyle = '#fff2cc';
    ctx.beginPath();
    ctx.arc(x - s * 0.4, y - s * 0.35, s * 0.09, 0, Math.PI * 2);
    ctx.arc(x + s * 0.35, y - s * 0.45, s * 0.09, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'patty') {
    ctx.fillStyle = def.color;
    rr(ctx, x - s, y - s * 0.55, s * 2, s * 1.1, s * 0.4);
    ctx.fill();
    ctx.stroke();
  } else if (id === 'lettuce') {
    ctx.fillStyle = def.color;
    for (const [dx, dy] of [[-0.5, 0.15], [0, -0.25], [0.5, 0.15]]) {
      ctx.beginPath();
      ctx.arc(x + dx * s, y + dy * s, s * 0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (id === 'tomato') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#e86a6a';
    ctx.beginPath();
    ctx.arc(x, y, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'cheese') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.moveTo(x - s, y + s * 0.6);
    ctx.lineTo(x + s, y + s * 0.6);
    ctx.lineTo(x, y - s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (id === 'onion') {
    ctx.strokeStyle = def.color;
    ctx.lineWidth = s * 0.3;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = s * 0.18;
    ctx.beginPath();
    ctx.arc(x, y, s * 0.3, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'sauce') {
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(x, y - s * 0.1, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - s * 0.6, y - s * 0.1, s * 1.2, s * 0.5);
    ctx.beginPath();
    ctx.arc(x - s * 0.3, y + s * 0.4, s * 0.18, 0, Math.PI * 2);
    ctx.arc(x + s * 0.35, y + s * 0.4, s * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'egg') {
    ctx.fillStyle = '#f7f1e3';
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(x, y, s * 0.48, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFace(ctx, x, y, r, mood) {
  // mood: 0 happy, 1 worried, 2 angry
  ctx.save();
  ctx.fillStyle = mood === 2 ? '#f2b8a0' : '#f6c89f';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a34';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.15, r * 0.09, 0, Math.PI * 2);
  ctx.arc(x + r * 0.35, y - r * 0.15, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  if (mood === 0) ctx.arc(x, y + r * 0.1, r * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (mood === 1) ctx.arc(x, y + r * 0.55, r * 0.4, 1.15 * Math.PI, 1.85 * Math.PI);
  else {
    ctx.moveTo(x - r * 0.4, y + r * 0.55);
    ctx.lineTo(x + r * 0.4, y + r * 0.55);
  }
  ctx.stroke();
  if (mood === 1) {
    ctx.fillStyle = '#7ec8f2';
    ctx.beginPath();
    ctx.arc(x + r * 0.85, y - r * 0.7, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function render(ctx, world, pointer) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  drawBackground(ctx);
  drawOrderBoard(ctx, world);
  drawStations(ctx, world);
  drawBins(ctx, world, pointer);
  drawHUD(ctx, world);
  drawToasts(ctx, world);
  drawHeld(ctx, world, pointer);
  if (world.screen === SCREEN_TITLE) drawTitle(ctx, world);
  else if (world.screen === SCREEN_PAUSED) drawPaused(ctx);
  else if (world.screen === SCREEN_OVER) drawGameOver(ctx, world);
}

function drawBackground(ctx) {
  // Wall.
  ctx.fillStyle = '#f6ead2';
  ctx.fillRect(0, HUD.h, VIEW.width, 156);
  ctx.strokeStyle = '#e3d3ae';
  ctx.lineWidth = 2;
  for (let x = 0; x <= VIEW.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, HUD.h);
    ctx.lineTo(x, 204);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 126);
  ctx.lineTo(VIEW.width, 126);
  ctx.stroke();
  // Counter.
  ctx.fillStyle = '#caa06a';
  ctx.fillRect(0, 204, VIEW.width, 28);
  ctx.fillStyle = '#a87b48';
  ctx.fillRect(0, 232, VIEW.width, 316);
  ctx.fillStyle = '#8a5f31';
  ctx.fillRect(0, 232, VIEW.width, 6);
  // Shelf the bins sit on.
  ctx.fillStyle = '#4a3525';
  ctx.fillRect(0, 548, VIEW.width, 172);
  ctx.fillStyle = '#5d452f';
  ctx.fillRect(0, 548, VIEW.width, 8);
}

function drawHUD(ctx, world) {
  ctx.fillStyle = '#241d18';
  ctx.fillRect(HUD.x, HUD.y, HUD.w, HUD.h);
  text(ctx, 'SCORE', 24, 18, '700 13px system-ui, sans-serif', '#c9a86a');
  text(ctx, String(world.score), 24, 42, '700 24px system-ui, sans-serif', '#fff');
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(196, 24, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c39a1d';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '¢', 196, 29, '700 13px system-ui, sans-serif', '#7a5a10', 'center');
  text(ctx, String(world.coins), 214, 33, '700 22px system-ui, sans-serif', '#fff');
  // Shift timer, centred.
  const mins = Math.floor(world.shiftTimer / 60);
  const secs = Math.floor(world.shiftTimer % 60);
  const shiftText = `SHIFT ${mins}:${String(secs).padStart(2, '0')}`;
  text(ctx, shiftText, 640, 20, '700 15px system-ui, sans-serif', '#c9a86a', 'center');
  const frac = Math.max(0, world.shiftTimer / 150);
  ctx.fillStyle = '#3a2f26';
  rr(ctx, 540, 28, 200, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#7be495' : frac > 0.25 ? '#ffd166' : '#ff6b5e';
  if (frac > 0) {
    rr(ctx, 540, 28, 200 * frac, 10, 5);
    ctx.fill();
  }
  // Combo and strikes, right.
  if (world.combo > 1) {
    text(ctx, `COMBO x${world.combo}`, 1000, 31, '700 20px system-ui, sans-serif', '#ffb347', 'right');
  }
  text(ctx, 'STRIKES', 1064, 18, '700 12px system-ui, sans-serif', '#c9a86a');
  for (let i = 0; i < MAX_STRIKES; i += 1) {
    const cx = 1080 + i * 30;
    const lost = i < world.strikes;
    ctx.fillStyle = lost ? '#ff6b5e' : '#fff8e8';
    ctx.beginPath();
    ctx.arc(cx, 33, 10, 0, Math.PI * 2);
    ctx.fill();
    if (lost) {
      ctx.strokeStyle = '#7a1512';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 5, 28);
      ctx.lineTo(cx + 5, 38);
      ctx.moveTo(cx + 5, 28);
      ctx.lineTo(cx - 5, 38);
      ctx.stroke();
    }
  }
}

function drawOrderBoard(ctx, world) {
  ctx.fillStyle = '#5a3d24';
  rr(ctx, BOARD.x, BOARD.y, BOARD.w, BOARD.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#3d2812';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'ORDERS', BOARD.x + 16, BOARD.y + 24, '700 15px system-ui, sans-serif', '#e8c88f');
  for (let i = 0; i < 3; i += 1) {
    const x = BOARD.x + 92 + i * (BOARD_TICKET_W + BOARD_TICKET_GAP);
    const y = BOARD.y + 8;
    const order = world.orders[i];
    ctx.fillStyle = order ? '#fff8e8' : '#e8dcc2';
    rr(ctx, x, y, BOARD_TICKET_W, BOARD_TICKET_H, 10);
    ctx.fill();
    ctx.strokeStyle = '#c9b48a';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!order) {
      text(ctx, 'Waiting for customers…', x + 20, y + 62, '400 17px system-ui, sans-serif', '#8a7a5f');
      continue;
    }
    const frac = Math.max(0, order.timeLeft / order.totalTime);
    const mood = frac > 0.5 ? 0 : frac > 0.25 ? 1 : 2;
    drawFace(ctx, x + 34, y + 34, 22, mood);
    text(ctx, order.name, x + 66, y + 30, '700 21px system-ui, sans-serif', '#2b2118');
    text(ctx, `#${order.seq}`, x + BOARD_TICKET_W - 14, y + 30, '700 15px system-ui, sans-serif', '#8a7a5f', 'right');
    // Recipe chips in order.
    order.recipe.forEach((id, j) => {
      const cx = x + 80 + j * 34;
      const cy = y + 62;
      const def = INGREDIENT_BY_ID[id];
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = id === 'egg' ? '#b8ab8d' : def.dark;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (id === 'egg') {
        ctx.fillStyle = '#f2c94c';
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      text(ctx, def.name[0], cx, cy + 5, '700 13px system-ui, sans-serif', '#fff', 'center');
      if (j < order.recipe.length - 1) {
        text(ctx, '›', cx + 17, cy + 5, '700 14px system-ui, sans-serif', '#8a7a5f', 'center');
      }
    });
    // Timer bar.
    ctx.fillStyle = '#e0d3b3';
    rr(ctx, x + 66, y + 88, 300, 12, 6);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? '#58b368' : frac > 0.25 ? '#e8a13a' : '#d94343';
    if (frac > 0) {
      rr(ctx, x + 66, y + 88, 300 * frac, 12, 6);
      ctx.fill();
    }
    text(ctx, `${Math.ceil(order.timeLeft)}s`, x + 374, y + 100, '700 15px system-ui, sans-serif', frac > 0.25 ? '#5a4a34' : '#d94343', 'right');
  }
}

function drawStations(ctx, world) {
  // Chopping board.
  ctx.fillStyle = '#e8c88f';
  rr(ctx, BOARD_STATION.x, BOARD_STATION.y, BOARD_STATION.w, BOARD_STATION.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#b98d4f';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'CHOPPING BOARD', BOARD_STATION.x + 130, BOARD_STATION.y + 24, '700 15px system-ui, sans-serif', '#7a5a30', 'center');
  // Knife.
  ctx.fillStyle = '#cfd6dd';
  ctx.beginPath();
  ctx.moveTo(BOARD_STATION.x + 196, BOARD_STATION.y + 52);
  ctx.lineTo(BOARD_STATION.x + 240, BOARD_STATION.y + 52);
  ctx.lineTo(BOARD_STATION.x + 228, BOARD_STATION.y + 66);
  ctx.lineTo(BOARD_STATION.x + 196, BOARD_STATION.y + 66);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5a3d24';
  ctx.fillRect(BOARD_STATION.x + 240, BOARD_STATION.y + 52, 14, 14);
  if (world.board) {
    drawIngredient(ctx, world.board.id, BOARD_STATION.x + 90, BOARD_STATION.y + 76, 30);
    const frac = world.board.progress / world.board.max;
    ctx.fillStyle = '#d8cfae';
    rr(ctx, BOARD_STATION.x + 24, BOARD_STATION.y + 124, 212, 10, 5);
    ctx.fill();
    ctx.fillStyle = '#58b368';
    rr(ctx, BOARD_STATION.x + 24, BOARD_STATION.y + 124, 212 * frac, 10, 5);
    ctx.fill();
  } else {
    text(ctx, 'Click an ingredient,', BOARD_STATION.x + 130, BOARD_STATION.y + 92, '400 15px system-ui, sans-serif', '#8a7a5f', 'center');
    text(ctx, 'then click here to chop.', BOARD_STATION.x + 130, BOARD_STATION.y + 114, '400 15px system-ui, sans-serif', '#8a7a5f', 'center');
  }

  // Stove with two pans.
  ctx.fillStyle = '#3a3a3f';
  rr(ctx, STOVE.x, STOVE.y, STOVE.w, STOVE.h, 10);
  ctx.fill();
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'STOVE', STOVE.x + 168, STOVE.y + 24, '700 15px system-ui, sans-serif', '#cfd6dd', 'center');
  [PAN0, PAN1].forEach((pan, i) => {
    const cx = pan.x + pan.w / 2;
    const cy = pan.y + pan.h / 2 + 6;
    const item = world.pans[i];
    ctx.fillStyle = '#1e1e22';
    ctx.beginPath();
    ctx.arc(cx, cy, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#55555c';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = '#2c2c31';
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fill();
    if (item) {
      const def = INGREDIENT_BY_ID[item.id];
      const frac = Math.min(1, item.progress / def.cook);
      if (item.state === 'burnt') {
        ctx.fillStyle = '#141414';
        ctx.beginPath();
        ctx.arc(cx, cy, 30, 0, Math.PI * 2);
        ctx.fill();
        text(ctx, 'BURNT', cx, cy + 5, '700 13px system-ui, sans-serif', '#ff6b5e', 'center');
      } else {
        drawIngredient(ctx, item.id, cx, cy, 30);
        ctx.strokeStyle = item.state === 'cooked' ? '#7be495' : '#ffd166';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
      }
      text(ctx, item.state === 'burnt' ? 'trash it!' : item.state === 'cooked' ? 'ready!' : 'cooking…', cx, cy + 62, '700 12px system-ui, sans-serif', item.state === 'burnt' ? '#ff6b5e' : '#cfd6dd', 'center');
    } else {
      text(ctx, 'empty pan', cx, cy + 5, '400 13px system-ui, sans-serif', '#8a8a92', 'center');
    }
  });

  // Plate.
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(PLATE.cx, PLATE.cy + 46, PLATE.rx + 6, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath();
  ctx.ellipse(PLATE.cx, PLATE.cy, PLATE.rx, PLATE.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cfc8b8';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.ellipse(PLATE.cx, PLATE.cy, PLATE.rx - 22, PLATE.ry - 14, 0, 0, Math.PI * 2);
  ctx.fill();
  world.plate.forEach((id, i) => {
    const def = INGREDIENT_BY_ID[id];
    const y = PLATE.cy + 24 - i * 11;
    ctx.fillStyle = def.color;
    rr(ctx, PLATE.cx - 74, y - 8, 148, 15, 7);
    ctx.fill();
    ctx.strokeStyle = def.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (id === 'bun' && i === world.plate.length - 1) {
      ctx.fillStyle = def.color;
      ctx.beginPath();
      ctx.arc(PLATE.cx, y - 8, 74, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  });
  if (world.plate.length === 0) {
    text(ctx, 'PLATE', PLATE.cx, PLATE.cy + 6, '700 16px system-ui, sans-serif', '#b8ab8d', 'center');
  }
  const next = world.nextNeededId();
  if (world.plateMatchesOrder()) {
    text(ctx, 'Ready — ring the bell!', PLATE.cx, PLATE.y + PLATE.h + 26, '700 16px system-ui, sans-serif', '#7be495', 'center');
  } else if (next) {
    text(ctx, `Next: ${INGREDIENT_BY_ID[next].name}`, PLATE.cx, PLATE.y + PLATE.h + 26, '700 16px system-ui, sans-serif', '#fff8e8', 'center');
  }

  // Serve bell.
  const bellReady = world.plateMatchesOrder() !== null;
  if (world.servedFlash > 0 || bellReady) {
    ctx.save();
    ctx.shadowColor = '#ffd166';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath();
    ctx.arc(BELL.cx, BELL.cy, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#d9a521';
  ctx.beginPath();
  ctx.arc(BELL.cx, BELL.cy, 42, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a6d1a';
  ctx.fillRect(BELL.cx - 46, BELL.cy - 2, 92, 10);
  ctx.fillStyle = '#5a3d24';
  ctx.beginPath();
  ctx.arc(BELL.cx, BELL.cy - 44, 8, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, 'SERVE', BELL.cx, BELL.cy + 52, '700 16px system-ui, sans-serif', '#fff8e8', 'center');
  text(ctx, 'press S', BELL.cx, BELL.cy + 72, '400 13px system-ui, sans-serif', '#d8cfae', 'center');

  // Trash can.
  ctx.fillStyle = '#7a7d84';
  rr(ctx, TRASH.x + 8, TRASH.y + 44, 56, 82, 8);
  ctx.fill();
  ctx.strokeStyle = '#55585e';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#5d6066';
  ctx.fillRect(TRASH.x + 4, TRASH.y + 36, 64, 10);
  text(ctx, 'TRASH', TRASH.cx, TRASH.y + 142, '700 12px system-ui, sans-serif', '#d8cfae', 'center');
}

function drawBins(ctx, world, pointer) {
  INGREDIENTS.forEach((ing, i) => {
    const x = BINS.x + i * (BINS.w + BINS.gap);
    const y = BINS.y;
    const hovered = pointer.zone === `bin-${i}`;
    const held = world.held && world.held.id === ing.id;
    ctx.fillStyle = hovered ? '#8a6136' : '#6b4a2f';
    rr(ctx, x, y, BINS.w, BINS.h, 12);
    ctx.fill();
    ctx.strokeStyle = held ? '#ffd166' : hovered ? '#e8c88f' : '#4a3525';
    ctx.lineWidth = held || hovered ? 3 : 2;
    ctx.stroke();
    drawIngredient(ctx, ing.id, x + BINS.w / 2, y + 52, 32);
    text(ctx, ing.name, x + BINS.w / 2, y + 108, '700 17px system-ui, sans-serif', '#fff8e8', 'center');
    const tag = ing.prep === 'chop' ? 'CHOP' : ing.cook > 0 ? 'COOK' : 'READY';
    text(ctx, tag, x + BINS.w / 2, y + 128, '700 11px system-ui, sans-serif', tag === 'READY' ? '#7be495' : '#ffd166', 'center');
    // Key number badge.
    ctx.fillStyle = '#241d18';
    ctx.beginPath();
    ctx.arc(x + 18, y + 18, 13, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, String(i + 1), x + 18, y + 23, '700 14px system-ui, sans-serif', '#fff', 'center');
  });
}

function drawToasts(ctx, world) {
  world.toasts.forEach((t) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
    ctx.font = '700 20px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(t.text, t.x, t.y);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });
}

function drawHeld(ctx, world, pointer) {
  if (!world.held) return;
  const def = INGREDIENT_BY_ID[world.held.id];
  const x = Math.max(8, Math.min(VIEW.width - 158, pointer.x + 16));
  const y = Math.max(56, Math.min(VIEW.height - 44, pointer.y - 40));
  ctx.fillStyle = '#fff8e8';
  rr(ctx, x, y, 150, 34, 9);
  ctx.fill();
  ctx.strokeStyle = def.dark;
  ctx.lineWidth = 2;
  ctx.stroke();
  drawIngredient(ctx, def.id, x + 20, y + 17, 11);
  const state = world.held.state === 'burnt' ? 'BURNT' : world.held.state === 'cooked' ? 'cooked' : world.held.prepped ? 'ready' : 'raw';
  text(ctx, `${def.name} · ${state}`, x + 38, y + 22, '700 14px system-ui, sans-serif', '#2b2118');
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(20,14,10,0.62)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#fff8e8';
  rr(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawTitle(ctx, world) {
  dim(ctx);
  panel(ctx, 290, 96, 700, 528);
  text(ctx, 'SIZZLE & SERVE', 640, 182, '700 58px system-ui, sans-serif', '#5a3d24', 'center');
  text(ctx, 'A frantic little kitchen game', 640, 222, '400 24px system-ui, sans-serif', '#8a6d4a', 'center');
  const lines = [
    'Read the order board — serve each dish before its timer runs out.',
    'Keys 1-8 or click: pick up ingredients. Click the board to chop,',
    'the stove to cook. Stack the plate in the order the recipe asks for,',
    'then ring the bell. Burnt food goes in the trash.',
    '3 strikes end the shift. Fast, correct serves build combos and coins.',
  ];
  lines.forEach((line, i) => {
    text(ctx, line, 640, 286 + i * 30, '400 19px system-ui, sans-serif', '#4a3a28', 'center');
  });
  ctx.fillStyle = '#4caf50';
  rr(ctx, START_BUTTON.x, START_BUTTON.y, START_BUTTON.w, START_BUTTON.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#2f7d3d';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'START SHIFT', 640, START_BUTTON.y + 42, '700 26px system-ui, sans-serif', '#fff', 'center');
  text(ctx, 'Space / Click', 640, START_BUTTON.y + 92, '400 15px system-ui, sans-serif', '#8a6d4a', 'center');
  if (world.best > 0) {
    text(ctx, `Best score: ${world.best}`, 640, 596, '700 18px system-ui, sans-serif', '#8a6d4a', 'center');
  }
}

function drawPaused(ctx) {
  dim(ctx);
  text(ctx, 'PAUSED', 640, 330, '700 64px system-ui, sans-serif', '#fff8e8', 'center');
  text(ctx, 'Press P or Esc to keep cooking', 640, 380, '400 22px system-ui, sans-serif', '#e8dcc2', 'center');
}

function drawGameOver(ctx, world) {
  dim(ctx);
  panel(ctx, 290, 104, 700, 512);
  text(ctx, 'SHIFT OVER!', 640, 188, '700 56px system-ui, sans-serif', '#5a3d24', 'center');
  const rows = [
    ['Score', String(world.score)],
    ['Coins', String(world.coins)],
    ['Dishes served', String(world.dishesServed)],
    ['Best score', String(world.best)],
  ];
  rows.forEach(([label, value], i) => {
    const y = 258 + i * 44;
    text(ctx, label, 380, y, '400 22px system-ui, sans-serif', '#4a3a28');
    text(ctx, value, 900, y, '700 22px system-ui, sans-serif', '#2b2118', 'right');
  });
  const isBest = world.score > 0 && world.score >= world.best;
  if (isBest) {
    ctx.fillStyle = '#f2c94c';
    rr(ctx, 520, 440, 240, 40, 20);
    ctx.fill();
    text(ctx, 'NEW BEST!', 640, 468, '700 22px system-ui, sans-serif', '#5a3d24', 'center');
  }
  ctx.fillStyle = '#4caf50';
  rr(ctx, RESTART_BUTTON.x, RESTART_BUTTON.y, RESTART_BUTTON.w, RESTART_BUTTON.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#2f7d3d';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'PLAY AGAIN', 640, RESTART_BUTTON.y + 42, '700 26px system-ui, sans-serif', '#fff', 'center');
  text(ctx, 'R / Click', 640, RESTART_BUTTON.y + 92, '400 15px system-ui, sans-serif', '#8a6d4a', 'center');
}
