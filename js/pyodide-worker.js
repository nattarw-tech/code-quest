// Runs inside a dedicated Web Worker. Loads Pyodide once, then executes user
// Python code on request. Never touches the DOM. A hard timeout + terminate/
// respawn is enforced by pyodide-bridge.js on the main thread.

importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');

let pyodideReadyPromise = null;

// Static Python wrapper source. Never string-interpolated with user input —
// the user's code and level data are passed in as separate global variables
// via pyodide.globals.set(), so there is no escaping/injection surface here.
const PY_RUNNER = `
import json, sys, io, traceback, math

class ActionLimitExceeded(Exception):
    pass

_MAX_ACTIONS = 500
_actions = []
_state = json.loads(_initial_state_json)
_capture_names = json.loads(_capture_names_json)
_api_types = json.loads(_api_types_json)

def _log_action(a):
    if len(_actions) >= _MAX_ACTIONS:
        raise ActionLimitExceeded("Too many actions - did you create an infinite loop?")
    _actions.append(a)

_DIRS = ['N', 'E', 'S', 'W']
_DELTA = {'N': (0, -1), 'E': (1, 0), 'S': (0, 1), 'W': (-1, 0)}

class Robot:
    def forward(self):
        r = _state['robot']
        dx, dy = _DELTA[r['dir']]
        nx, ny = r['x'] + dx, r['y'] + dy
        w, h = _state['gridSize']
        walls = _state.get('walls', [])
        blocked = nx < 0 or ny < 0 or nx >= w or ny >= h or [nx, ny] in walls
        if blocked:
            _log_action({'type': 'blocked', 'x': r['x'], 'y': r['y']})
        else:
            r['x'], r['y'] = nx, ny
            _log_action({'type': 'move', 'x': nx, 'y': ny, 'dir': r['dir']})
            self.collect()

    def turn_left(self):
        r = _state['robot']
        r['dir'] = _DIRS[(_DIRS.index(r['dir']) - 1) % 4]
        _log_action({'type': 'turn', 'dir': r['dir']})

    def turn_right(self):
        r = _state['robot']
        r['dir'] = _DIRS[(_DIRS.index(r['dir']) + 1) % 4]
        _log_action({'type': 'turn', 'dir': r['dir']})

    def say(self, text):
        _log_action({'type': 'say', 'text': str(text)})

    def is_blocked_ahead(self):
        r = _state['robot']
        dx, dy = _DELTA[r['dir']]
        nx, ny = r['x'] + dx, r['y'] + dy
        w, h = _state['gridSize']
        walls = _state.get('walls', [])
        return bool(nx < 0 or ny < 0 or nx >= w or ny >= h or [nx, ny] in walls)

    def collect(self):
        r = _state['robot']
        pos = [r['x'], r['y']]
        coins = _state.get('coins', [])
        if pos in coins:
            coins.remove(pos)
            _state.setdefault('collected', []).append(pos)
            _log_action({'type': 'collect', 'x': r['x'], 'y': r['y']})
            return True
        return False

class Turtle:
    def forward(self, distance=10):
        rad = math.radians(_state['heading'])
        x0, y0 = _state['x'], _state['y']
        x1 = x0 + distance * math.cos(rad)
        y1 = y0 - distance * math.sin(rad)
        if _state.get('penDown', True):
            _log_action({'type': 'line', 'x1': x0, 'y1': y0, 'x2': x1, 'y2': y1})
        else:
            _log_action({'type': 'jump', 'x1': x0, 'y1': y0, 'x2': x1, 'y2': y1})
        _state['x'], _state['y'] = x1, y1

    def left(self, degrees=90):
        _state['heading'] = (_state['heading'] + degrees) % 360

    def right(self, degrees=90):
        _state['heading'] = (_state['heading'] - degrees) % 360

    def pen_up(self):
        _state['penDown'] = False

    def pen_down(self):
        _state['penDown'] = True

if 'robot' in _api_types:
    robot = Robot()
if 'turtle' in _api_types:
    turtle = Turtle()

_error = None
_stdout_buf = io.StringIO()
_old_stdout = sys.stdout
sys.stdout = _stdout_buf
try:
    exec(compile(_user_code, '<your code>', 'exec'), globals())
except Exception as e:
    _line = getattr(e, 'lineno', None)
    _tb = traceback.extract_tb(sys.exc_info()[2])
    for _frame in _tb:
        if _frame.filename == '<your code>':
            _line = _frame.lineno
    _error = {'type': type(e).__name__, 'message': str(e), 'line': _line}
finally:
    sys.stdout = _old_stdout

_captured = {}
for _name in _capture_names:
    if _name in globals():
        try:
            json.dumps(globals()[_name])
            _captured[_name] = globals()[_name]
        except Exception:
            _captured[_name] = str(globals()[_name])
    else:
        _captured[_name] = None

json.dumps({
    'stdout': _stdout_buf.getvalue(),
    'error': _error,
    'actions': _actions,
    'state': _state,
    'vars': _captured,
})
`;

async function initPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const msg = event.data;

  if (msg.type === 'init') {
    try {
      await initPyodide();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'init-error', message: String(err) });
    }
    return;
  }

  if (msg.type === 'run') {
    const { runId, code, initialState, captureVars, apiTypes } = msg;
    try {
      const pyodide = await initPyodide();
      pyodide.globals.set('_user_code', code);
      pyodide.globals.set('_initial_state_json', JSON.stringify(initialState || {}));
      pyodide.globals.set('_capture_names_json', JSON.stringify(captureVars || []));
      pyodide.globals.set('_api_types_json', JSON.stringify(apiTypes || []));
      const resultJson = await pyodide.runPythonAsync(PY_RUNNER);
      const payload = JSON.parse(resultJson);
      self.postMessage({ type: 'result', runId, payload });
    } catch (err) {
      self.postMessage({
        type: 'result',
        runId,
        payload: {
          stdout: '',
          error: { type: 'InternalError', message: String(err && err.message || err), line: null },
          actions: [],
          state: initialState || {},
          vars: {},
        },
      });
    }
  }
};
