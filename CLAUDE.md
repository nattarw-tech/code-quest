# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Code Quest — a browser game that teaches Python from scratch. The player writes real Python
in an in-page editor to move a robot around a grid, draw shapes with a turtle, or solve
console/value puzzles, progressing through a Duolingo-style level map with XP, streaks, and
badges. Python runs client-side via [Pyodide](https://pyodide.org) (WASM CPython) — there is
no backend, no database, no build step, and no package.json. It's plain HTML/CSS/JS loaded
as native ES modules directly by the browser.

## Commands

There is no build, lint, or test tooling in this repo (no package.json, no test framework).
The only thing you ever need to do is serve the static files and reload the browser.

**Run/preview the app:**
- Windows: double-click `run.bat` (or run it from a shell)
- Mac/Linux: `./run.sh`
- Either script starts a local static server and opens the browser to it automatically.

`run.bat` tries `python -m http.server`, then `npx serve`, then falls back to the
dependency-free `server.ps1` (a hand-rolled `System.Net.HttpListener` static file server) if
neither Python nor Node is available — don't assume Python/Node exist on the dev machine.

**Why a server is required at all:** Pyodide loads its interpreter/stdlib via `fetch()`,
which browsers block under the `file://` origin. `index.html` cannot simply be double-clicked
open — it must be served over `http://localhost`. If you need to preview changes yourself,
start one of the servers above (or `python -m http.server 8000` / `server.ps1`) and load
`http://localhost:8000/`.

**No lint/test/build commands exist.** Verify changes by loading the page and exercising the
feature in a browser (see the Pyodide/worker gotchas below before assuming something is broken).

## Architecture

### Execution flow: editor → worker → replay

This is the core mechanic and the most important thing to understand before touching anything
Python-related:

1. `js/editor.js` wraps CodeMirror 6 (loaded from esm.sh as native ES modules — see the CDN
   gotcha below) and exposes `getCode()`/`setCode()`.
2. `js/pyodide-bridge.js` (main thread) owns a dedicated Web Worker running
   `js/pyodide-worker.js`. **Pyodide never runs on the main thread.** This is deliberate:
   beginners write infinite loops (`while True` with no break), and running Python in a
   Worker lets the bridge enforce a hard timeout (`RUN_TIMEOUT_MS`, 8s) — if it fires, the
   worker is `.terminate()`d and a fresh one spawned, so a beginner's mistake can never freeze
   the tab.
3. Inside the worker, user code is never string-interpolated into a Python source string
   (`pyodide.globals.set('_user_code', code)` instead) and is run through a static wrapper
   (`PY_RUNNER`) that: defines the `robot`/`turtle` API objects, executes the user's code
   inside a `try/except` that maps Python exceptions to `{type, message, line}`, and returns a
   single JSON payload: `{ stdout, error, actions, state, vars }`.
4. **The "log, then replay" model**: `robot`/`turtle` methods don't touch the DOM — they just
   append action records (`{type: 'move', x, y, dir}`, `{type: 'line', ...}`, etc.) to a plain
   Python list and mutate a plain `state` dict. Only after the whole script finishes does the
   worker hand back the full action log, and `js/challenge-ui.js` replays it as a paced
   animation via one of the `js/visuals/*-renderer.js` classes (`render(initialState)` +
   `async replay(actions, stdout)`). This keeps "did the code work" (fast, safe, worker-side)
   completely decoupled from "make it fun to watch" (main-thread animation).
5. `js/error-messages.js` maps raw Python exception types (`NameError`, `IndentationError`,
   `SyntaxError`, `Timeout`, `ActionLimitExceeded`, ...) to beginner-friendly copy — never show
   a raw traceback as the primary message.
6. A fresh Python namespace is built on every "Run" click (never reused) so leftover state
   from a previous attempt can't cause false passes.

### Level content model

Every level is a plain object literal in the `LEVELS` array in `js/levels-data.js` — see the
schema and field-by-field docs in `README.md`. Key points not obvious from a single file:

- **Grading is outcome-based, not implementation-based.** `checkSolution(result)` is a real JS
  closure that inspects `result.state`/`result.actions`/`result.vars`/`result.stdout` — it
  checks *where the robot ended up* or *what got printed*, not *how* the player got there.
  Any valid approach passes; this is intentional so hints can suggest an idiomatic solution
  (loops, functions) without that being enforced by the grader.
- `apiTypes` (`['robot']`, `['turtle']`, or `[]`) controls which Python objects
  `pyodide-worker.js` exposes to that level's code. `commandsUsed` (short method names, e.g.
  `['forward', 'turn_right']`) controls which of that API's methods get listed in the
  "Commands you can use" box in `challenge-ui.js` — keep this to just what the level actually
  needs, not the whole API, or it defeats the point.
- `order` is a plain sort key, not a stable identifier — it's fine (and expected) to insert a
  new level with a fractional order (e.g. `10.5`) between two existing levels rather than
  renumbering everything. `id` and `unlockRequires` form the actual unlock graph and must stay
  stable once a level ships (they're used as keys in the player's localStorage save).
- The general Python syntax reference (for/while/if-elif-else/functions/lists/dicts) lives
  separately in `js/syntax-panel.js`, not per-level — it's a global slide-in panel reachable
  from the header on any screen, intentionally decoupled from any single level's instructions
  panel (see the CSS layout gotcha below for why).

### Screens and state

`js/main.js` is the composition root: it owns the `GameEngine` instance, wires `MapUI` and
`ChallengeUI` together, and is the only place that toggles the `map-screen`/`challenge-screen`
`hidden` classes. `js/game-engine.js` owns XP/streak/badge logic and localStorage
persistence under a single versioned key (`codequest-save-v1`); bump `SAVE_VERSION` and handle
migration in `_load()` if the save shape ever changes. `js/map-ui.js` renders each world as a
horizontal scrollable "train track" of stations (not a vertical zigzag — that was the original
design and was deliberately replaced, see CSS gotcha below).

### Known gotchas (learned the hard way while building this)

- **Don't add `?bundle` to esm.sh CodeMirror imports.** `js/editor.js` imports `codemirror`,
  `@codemirror/state`, `@codemirror/lang-python`, `@codemirror/language` as separate,
  non-bundled esm.sh URLs on purpose. Adding `?bundle` makes esm.sh inline each package's deps
  into an isolated copy, so `EditorState` ends up as a different class instance than the one
  `codemirror` uses internally, producing "Unrecognized extension value in extension set"
  errors. Without `?bundle`, esm.sh dedupes shared deps by version across imports and
  `instanceof` checks line up.
- **CSS layout must stay height-bounded, not content-grown.** `html, body { overflow: hidden }`
  plus `.app { height: 100vh }` (not `min-height`) plus `min-height: 0` chained down through
  `.screen-root` → `.screen` → `#challenge-screen` → `.challenge-grid` → `.panel` is what makes
  each panel scroll independently via its own `overflow-y: auto`. If any link in that chain
  goes back to `min-height`/no `min-height:0`, expanding something like a `<details>` box grows
  the whole page instead of scrolling within its own panel — this actually happened and is why
  the syntax reference was pulled out into a separate global side panel rather than living
  inline per-level.
- **Don't gate functionally-important navigation on `requestAnimationFrame`.** `rAF` can be
  throttled or fully suspended when a tab isn't actively rendering/focused. The "travel to next
  level" animation in `main.js` (`travelToNextLevel`) deliberately uses synchronous
  `getBoundingClientRect()` + a forced reflow (`void el.offsetWidth`) + a single `setTimeout`
  instead of the more obvious double-`rAF` pattern, specifically because the rAF version was
  observed to leave navigation stuck when the tab wasn't in the foreground. CSS `transition`s
  for purely cosmetic animation are fine (they degrade gracefully to an instant jump if a
  browser stalls them) — just don't make anything user-facing *depend* on a transition or rAF
  callback actually firing.
- Confetti (`js/celebrate.js`) and the game-completion applause sound are generated with zero
  external assets — confetti is plain divs with CSS keyframe animations, and applause is
  synthesized noise bursts + a short oscillator chime via the Web Audio API. Keep it that way;
  don't introduce image/audio file dependencies for effects like this.
