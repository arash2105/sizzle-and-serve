// The game state and rules: orders, chopping, cooking, plating and serving.
// No randomness here except through this.rng, so a seeded world replays the
// same way every time.
import {
  BEST_KEY, BURN_AFTER, CHOP_PER_CLICK, CHOP_TIME, COMBO_BONUS, COMBO_WINDOW,
  DISHES, INGREDIENT_BY_ID, MAX_ORDERS, MAX_STRIKES, ORDER_SPAWN_EVERY,
  SHIFT_TIME,
} from './config.js';
import { pick } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'playing';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'gameover';

export class World {
  constructor(rng) {
    this.rng = rng;
    this.best = 0;
    try {
      this.best = Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      this.best = 0;
    }
    this.reset();
  }

  reset() {
    this.screen = SCREEN_TITLE;
    this.score = 0;
    this.coins = 0;
    this.shiftTimer = SHIFT_TIME;
    this.strikes = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.dishesServed = 0;
    this.orders = [];
    this.orderSeq = 1;
    this.spawnTimer = 0;
    this.held = null; // { id, prepped, state: 'raw' | 'ready' | 'cooked' | 'burnt' }
    this.board = null; // { id, progress, max }
    this.pans = [null, null]; // each { id, progress, state: 'cooking' | 'cooked' | 'burnt' }
    this.plate = []; // ingredient ids, in the order they were stacked
    this.toasts = []; // { text, x, y, life }
    this.soundQueue = [];
    this.audioCtx = null;
    this.servedFlash = 0; // seconds the serve bell glows after a serve
  }

  startShift() {
    this.reset();
    this.screen = SCREEN_PLAY;
    this.spawnOrder();
    this.spawnOrder();
    this.initAudio();
    this.playSound('click');
  }

  gameOver() {
    this.screen = SCREEN_OVER;
    if (this.score > this.best) {
      this.best = this.score;
      try {
        window.localStorage.setItem(BEST_KEY, String(this.best));
      } catch {
        // Storage can be off (private windows): the best then lasts this visit only.
      }
    }
    this.playSound('fail');
  }

  spawnOrder() {
    if (this.orders.length >= MAX_ORDERS) return;
    const dish = pick(this.rng, DISHES);
    this.orders.push({
      id: this.orderSeq,
      seq: this.orderSeq,
      dishId: dish.id,
      name: dish.name,
      recipe: [...dish.recipe],
      reward: dish.reward,
      coins: dish.coins,
      timeLeft: dish.time,
      totalTime: dish.time,
    });
    this.orderSeq += 1;
  }

  update(dt) {
    if (this.screen !== SCREEN_PLAY) return;
    this.processSound();

    // Toasts fade.
    for (let i = this.toasts.length - 1; i >= 0; i -= 1) {
      this.toasts[i].life -= dt;
      this.toasts[i].y -= 24 * dt;
      if (this.toasts[i].life <= 0) this.toasts.splice(i, 1);
    }
    if (this.servedFlash > 0) this.servedFlash -= dt;

    // Shift timer.
    this.shiftTimer -= dt;
    if (this.shiftTimer <= 0) {
      this.shiftTimer = 0;
      this.gameOver();
      return;
    }

    // New orders arrive on a timer.
    this.spawnTimer += dt;
    if (this.spawnTimer >= ORDER_SPAWN_EVERY && this.orders.length < MAX_ORDERS) {
      this.spawnTimer = 0;
      this.spawnOrder();
    }

    // Order countdowns.
    for (let i = this.orders.length - 1; i >= 0; i -= 1) {
      const order = this.orders[i];
      order.timeLeft -= dt;
      if (order.timeLeft <= 0) {
        this.orders.splice(i, 1);
        this.strikes += 1;
        this.combo = 0;
        this.toast('Too slow! Order lost.', 640, 210, '#ff6b5e');
        this.playSound('fail');
        if (this.strikes >= MAX_STRIKES) {
          this.gameOver();
          return;
        }
        this.spawnOrder();
      }
    }

    // Combo window.
    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }

    // Pans cook; food burns if left too long.
    for (const pan of this.pans) {
      if (!pan) continue;
      const def = INGREDIENT_BY_ID[pan.id];
      if (!def || !def.cook) continue;
      pan.progress += dt;
      if (pan.state !== 'burnt' && pan.progress >= def.cook * BURN_AFTER) {
        pan.state = 'burnt';
        this.toast('Burnt!', 640, 300, '#ff6b5e');
        this.playSound('fail');
      } else if (pan.state === 'cooking' && pan.progress >= def.cook) {
        pan.state = 'cooked';
        this.playSound('ding');
      }
    }
  }

  toast(text, x, y, color) {
    this.toasts.push({ text, x, y, life: 1.6, color: color ?? '#fff' });
    if (this.toasts.length > 5) this.toasts.shift();
  }

  // ---- actions ----

  pickIngredient(id) {
    const def = INGREDIENT_BY_ID[id];
    if (!def) return;
    // 'raw' means it still needs work (chopping, cooking, or both);
    // 'ready' means it can go straight on the plate.
    this.held = {
      id: def.id,
      prepped: !def.prep,
      state: def.prep || def.cook > 0 ? 'raw' : 'ready',
    };
    this.playSound('click');
  }

  interactBoard() {
    if (!this.board && this.held) {
      const def = INGREDIENT_BY_ID[this.held.id];
      if (def && def.prep === 'chop' && !this.held.prepped) {
        this.board = { id: this.held.id, progress: 0, max: CHOP_TIME };
        this.held = null;
        this.playSound('chop');
      }
      return;
    }
    if (this.board) {
      this.board.progress += CHOP_PER_CLICK;
      this.playSound('chop');
      if (this.board.progress >= this.board.max) {
        this.held = { id: this.board.id, prepped: true, state: 'ready' };
        this.board = null;
        this.playSound('ding');
      }
    }
  }

  interactPan(index) {
    const pan = this.pans[index];
    if (!pan && this.held) {
      const def = INGREDIENT_BY_ID[this.held.id];
      if (def && def.cook > 0 && this.held.state === 'raw') {
        this.pans[index] = { id: this.held.id, progress: 0, state: 'cooking' };
        this.held = null;
        this.playSound('sizzle');
      }
      return;
    }
    if (pan && !this.held) {
      if (pan.state === 'cooked' || pan.state === 'burnt') {
        this.held = { id: pan.id, prepped: true, state: pan.state };
        this.pans[index] = null;
        this.playSound('click');
      }
    }
  }

  addToPlate() {
    if (!this.held) return;
    if (this.held.state === 'burnt') {
      // Burnt food goes in the trash, never on the plate.
      this.held = null;
      this.toast('Burnt — trashed.', 840, 300, '#ff6b5e');
      this.playSound('fail');
      return;
    }
    // The plate only takes the next ingredient the orders ask for, prepared
    // the way the recipe needs it.
    if (this.plateMatchesOrder()) {
      this.toast('Plate is ready — ring the bell!', 840, 300, '#7be495');
      this.playSound('click');
      return;
    }
    const nextNeeded = this.nextNeededId();
    if (nextNeeded === null) {
      this.toast('No order needs that.', 840, 300, '#ffd166');
      this.playSound('click');
      return;
    }
    if (this.held.id !== nextNeeded) {
      const def = INGREDIENT_BY_ID[nextNeeded];
      this.toast(`Next: ${def.name}.`, 840, 300, '#ffd166');
      this.playSound('click');
      return;
    }
    const def = INGREDIENT_BY_ID[this.held.id];
    if (def.prep === 'chop' && !this.held.prepped) {
      this.toast('Chop it first.', 840, 300, '#ffd166');
      this.playSound('click');
      return;
    }
    if (def.cook > 0 && this.held.state !== 'cooked') {
      this.toast('Cook it first.', 840, 300, '#ffd166');
      this.playSound('click');
      return;
    }
    if (this.plate.length >= 8) return;
    this.plate.push(this.held.id);
    this.held = null;
    this.playSound('click');
  }

  // The order whose recipe the plate already matches exactly, or null.
  plateMatchesOrder() {
    for (const order of this.orders) {
      if (order.recipe.length !== this.plate.length) continue;
      let match = true;
      for (let j = 0; j < order.recipe.length; j += 1) {
        if (order.recipe[j] !== this.plate[j]) {
          match = false;
          break;
        }
      }
      if (match) return order;
    }
    return null;
  }

  // The ingredient the topmost order still waits for, or null when no order
  // can take another ingredient right now.
  nextNeededId() {
    if (this.plateMatchesOrder()) return null;
    for (const order of this.orders) {
      if (this.plate.length < order.recipe.length) return order.recipe[this.plate.length];
    }
    return null;
  }

  clearPlate() {
    if (this.plate.length === 0) return;
    this.plate = [];
    this.playSound('click');
  }

  trashHeld() {
    if (!this.held) return;
    this.held = null;
    this.playSound('click');
  }

  serveDish() {
    if (this.plate.length === 0) return;
    let matchedIndex = -1;
    for (let i = 0; i < this.orders.length; i += 1) {
      const order = this.orders[i];
      if (order.recipe.length !== this.plate.length) continue;
      let match = true;
      for (let j = 0; j < order.recipe.length; j += 1) {
        if (order.recipe[j] !== this.plate[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        matchedIndex = i;
        break;
      }
    }
    if (matchedIndex !== -1) {
      const order = this.orders.splice(matchedIndex, 1)[0];
      this.combo += 1;
      this.comboTimer = COMBO_WINDOW;
      const earned = order.reward + (this.combo - 1) * COMBO_BONUS;
      this.score += earned;
      this.coins += order.coins;
      this.dishesServed += 1;
      this.plate = [];
      this.servedFlash = 0.8;
      this.toast(`+${earned}  ${order.name} served!`, 1090, 280, '#7be495');
      this.playSound('success');
      this.spawnOrder();
      return;
    }
    // Wrong dish: a strike, the plate is cleared, the combo is lost.
    this.strikes += 1;
    this.combo = 0;
    this.plate = [];
    this.toast('Wrong dish!', 1090, 280, '#ff6b5e');
    this.playSound('fail');
    if (this.strikes >= MAX_STRIKES) this.gameOver();
  }

  // ---- sound (tiny synthesized blips, no audio files) ----

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        try {
          this.audioCtx = new AudioContext();
        } catch {
          this.audioCtx = null;
        }
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  playSound(type) {
    this.soundQueue.push(type);
    if (this.soundQueue.length > 8) this.soundQueue.shift();
  }

  processSound() {
    if (!this.audioCtx || this.soundQueue.length === 0) return;
    const type = this.soundQueue.shift();
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      const now = this.audioCtx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(760, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'chop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.setValueAtTime(110, now + 0.04);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'sizzle') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'ding') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(783.99, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Audio can be unavailable: the game plays on silently.
    }
  }
}
