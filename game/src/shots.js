// The screenshot scenes behind ?shot=start|play|serve|end. Each one builds a
// fixed, deterministic world state (seeded orders, set timers) and lets the
// real renderer paint it, so the frame is what the game really looks like.
import { DISH_BY_ID } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

function setOrders(world, specs) {
  world.orders = specs.map((s, i) => {
    const dish = DISH_BY_ID[s.dish];
    return {
      id: i + 1,
      seq: i + 1,
      dishId: dish.id,
      name: dish.name,
      recipe: [...dish.recipe],
      reward: dish.reward,
      coins: dish.coins,
      timeLeft: s.time,
      totalTime: dish.time,
    };
  });
  world.orderSeq = specs.length + 1;
}

export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    // Title over the kitchen, two orders waiting on the board.
    world.screen = SCREEN_TITLE;
    world.spawnOrder();
    world.spawnOrder();
    world.orders[0].timeLeft = 24;
    world.orders[1].timeLeft = 31;
    return { screen: SCREEN_TITLE };
  }
  if (name === 'play') {
    // Mid-assembly: a bun and a cooked patty on the plate, a patty sizzling,
    // lettuce being chopped, a tomato in hand, timers running.
    world.screen = SCREEN_PLAY;
    world.score = 320;
    world.coins = 12;
    world.combo = 2;
    world.comboTimer = 4;
    world.shiftTimer = 118;
    world.dishesServed = 3;
    setOrders(world, [
      { dish: 'classic', time: 18 },
      { dish: 'cheese', time: 26 },
      { dish: 'sunny', time: 31 },
    ]);
    world.plate = ['bun', 'patty'];
    world.pans[0] = { id: 'patty', progress: 2.2, state: 'cooking' };
    world.board = { id: 'lettuce', progress: 0.8, max: 2 };
    world.held = { id: 'tomato', prepped: false, state: 'raw' };
    return { screen: SCREEN_PLAY };
  }
  if (name === 'serve') {
    // A finished Classic Burger on the plate, its order still waiting.
    world.screen = SCREEN_PLAY;
    world.score = 480;
    world.coins = 21;
    world.combo = 3;
    world.comboTimer = 5;
    world.shiftTimer = 104;
    world.dishesServed = 4;
    setOrders(world, [
      { dish: 'classic', time: 21 },
      { dish: 'cheese', time: 30 },
    ]);
    world.plate = ['bun', 'patty', 'lettuce', 'bun'];
    world.servedFlash = 0.4;
    return { screen: SCREEN_PLAY };
  }
  // end: the shift is over, with a new best score.
  world.screen = SCREEN_OVER;
  world.score = 1230;
  world.coins = 85;
  world.dishesServed = 9;
  world.strikes = 1;
  world.shiftTimer = 0;
  world.best = 1230;
  setOrders(world, [{ dish: 'mega', time: 12 }]);
  return { screen: SCREEN_OVER };
}
