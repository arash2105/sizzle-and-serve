# Sizzle & Serve

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/arash2105/sizzle-and-serve/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/arash2105/sizzle-and-serve/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete cooking game that runs offline in a desktop browser. Read the
order board, chop and cook the ingredients, stack the dish in the right order
and serve it before the customer's patience runs out. Three strikes end the
shift — fast, correct serves build combos and coins.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network request, no dependencies: plain static files under `game/`.

## How to play

- **1–8** or click an ingredient bin to pick up an ingredient.
- **Click the chopping board** (or press Space) to chop lettuce, tomato and
  onion. Each click chops a little more.
- **Click a pan on the stove** to start cooking a patty or an egg. Take it out
  when the bar turns green — leave it too long and it burns.
- **Click the plate** (or press Space) to add what you are holding, in the
  order the recipe asks for.
- **Click the serve bell** (or press S) to serve the finished plate. A burnt
  item goes in the trash instead of on the plate.
- **P** or **Esc** pauses. **R** restarts after the shift ends. **C** clears
  the plate, **T** throws away what you are holding.

Orders show their dish, the recipe in order, and a countdown bar. Serve
correctly to earn points and coins; a wrong or late order is a strike.

## Screenshots

The four screenshots under `screenshots/` are real renders of this code,
taken in a desktop browser at 1280x720 from the deterministic scenes
`?shot=start|play|serve|end&seed=1` (see `shots.json`).

## Files

- `main.ts` — copies `game/` and `screenshots/` to the output directory and
  writes `dossier.json` (Node 22, standard library only).
- `game/` — the game as static files (`index.html` plus ES modules).
- `vendor/makefun-game.ts` — the make.fun kit library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
