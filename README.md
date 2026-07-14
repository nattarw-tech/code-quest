# Code Quest — Learn Python by Playing

A browser game that teaches Python from scratch. Program a little robot to escape mazes,
collect coins, and draw shapes — using **real Python** running in your browser (via [Pyodide](https://pyodide.org)).

## How to run

Double-click **`run.bat`** (Windows) or run **`./run.sh`** (Mac/Linux). It starts a tiny local
web server and opens the game in your browser automatically.

> Why not just double-click `index.html`? Browsers block the Python engine from loading
> when a page is opened directly from disk (`file://...`). Running a local server (which
> `run.bat`/`run.sh` do for you) fixes this. Nothing is sent over the network — it's all
> running on your own machine.

To stop the server, close the "Python Quest Server" window or press any key in the launcher window.

## Project structure

```
index.html            App shell — loads everything else
css/styles.css         All styling
js/main.js              Boots the app, switches between screens
js/pyodide-worker.js     Runs Python (in a Web Worker) — sandboxed, has a timeout
js/pyodide-bridge.js     Main-thread <-> worker messaging, timeout/restart handling
js/editor.js             CodeMirror 6 code editor setup
js/game-engine.js        XP, streaks, badges, save/load (localStorage)
js/map-ui.js             Level map screen
js/challenge-ui.js       Challenge screen (editor + visual + instructions)
js/error-messages.js     Turns Python exceptions into beginner-friendly text
js/levels-data.js        All level content
js/visuals/grid-renderer.js     Robot-on-a-grid animation
js/visuals/canvas-renderer.js   Turtle-graphics drawing animation
js/visuals/console-renderer.js  Plain output panel
```

## Adding a new level

Levels live in `js/levels-data.js` as plain objects in the `LEVELS` array. Shape:

```js
{
  id: 'lvl-06-loop-steps',      // unique, stable id
  order: 6,                      // position in the path
  unit: 'Loops',                 // groups levels into "worlds" on the map
  title: 'Step Counter',
  concept: 'for loops / range()',
  visualType: 'grid',            // 'grid' | 'canvas' | 'console'
  unlockRequires: ['lvl-05-comments'], // level id(s) that must be completed first

  teachingContent: {
    explanation: 'A for loop lets you repeat an action a set number of times.',
    example: 'for i in range(3):\n    print(i)',
  },

  storyText: 'Your robot is stuck 5 steps from the recharge station...',
  apiTypes: ['robot'],           // which Python API objects to expose: 'robot', 'turtle', or []
  commandsUsed: ['forward'],     // which of that API's methods to list in the "Commands you can use" box
  starterCode: '# move the robot 5 steps forward\n',
  initialState: { gridSize: [6, 1], robot: { x: 0, y: 0, dir: 'E' }, walls: [], goal: { x: 5, y: 0 } },
  captureVars: [],               // variable names to read back after running (for console/value levels)

  hints: [
    'Try using range(5) inside a for loop.',
    'Each loop iteration should call robot.forward() once.',
  ],

  checkSolution: (result) => {
    // result = { stdout, error, actions, state, vars, timedOut }
    const passed = !result.error && result.state.robot.x === 5;
    return { passed, message: passed ? 'You reached the station!' : 'Not quite — check your loop range.' };
  },

  xpReward: 50,
  badgeId: null,
}
```

`checkSolution` is a real JS function, so it can check anything in the result payload:
final robot/turtle position, captured variable values, or the exact stdout text.

### The Python API available to user code

- **`robot`** (grid levels): `forward()`, `turn_left()`, `turn_right()`, `say(text)`,
  `is_blocked_ahead()`, `collect()`
- **`turtle`** (canvas levels): `forward(distance)`, `left(degrees)`, `right(degrees)`,
  `pen_up()`, `pen_down()`
- Plain `print()` always works and is captured into `result.stdout`.

User code runs in a fresh, isolated Python namespace on every run (no leftover state between
attempts), inside a Web Worker with a timeout — an infinite loop shows a friendly message
instead of freezing the page.
