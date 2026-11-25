// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between four screens: title,
// play, paused and game over.
//
// ?seed=N fixes the random pattern. ?shot=start|play|serve|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { STEP, VIEW } from './config.js';
import { World, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './world.js';
import { createInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const ctx = canvas.getContext('2d');

const world = new World(seed);
const pointer = { x: VIEW.width / 2, y: VIEW.height / 2, zone: null };
createInput(canvas, world, pointer, announce);

// Screen readers (and anyone watching the page's text) hear the screen changes.
function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  stageShot(name, world);
  // Put the held-item chip (play shot) over empty counter space, not the plate.
  if (name === 'play') {
    pointer.x = 900;
    pointer.y = 500;
  }
  let painted = 0;
  function paint() {
    render(ctx, world, pointer);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let accumulator = 0;
  let last = performance.now();
  let lastScreen = world.screen;
  announce('Sizzle and Serve. Press Space or click to start.');

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    if (world.screen === SCREEN_PLAY || world.screen === SCREEN_TITLE) {
      while (accumulator >= STEP) {
        world.update(STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
      world.processSound();
    }
    if (world.screen !== lastScreen) {
      if (world.screen === SCREEN_OVER) {
        announce(`Shift over. Score ${world.score}. Best ${world.best}. Press R to play again.`);
      } else if (world.screen === SCREEN_PAUSED) announce('Paused.');
      else if (world.screen === SCREEN_PLAY) announce('Playing.');
      lastScreen = world.screen;
    }
    render(ctx, world, pointer);
  }

  // Leaving the tab pauses a running game rather than letting orders expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && world.screen === SCREEN_PLAY) world.screen = SCREEN_PAUSED;
  });

  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
