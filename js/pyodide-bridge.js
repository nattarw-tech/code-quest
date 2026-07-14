// Main-thread interface to the Pyodide Web Worker. Owns worker lifecycle,
// enforces a hard run timeout (kills + respawns the worker on timeout so a
// beginner's infinite loop can never freeze the page), and exposes a simple
// runCode() promise API.

const RUN_TIMEOUT_MS = 8000;

class PyodideBridge {
  constructor() {
    this._pending = new Map();
    this._onStatus = null;
    this._spawnWorker();
  }

  onStatus(cb) {
    this._onStatus = cb;
  }

  _emitStatus(status) {
    if (this._onStatus) this._onStatus(status);
  }

  _spawnWorker() {
    this.worker = new Worker('js/pyodide-worker.js');
    this.readyResolved = false;
    this.ready = new Promise((resolve, reject) => {
      this._readyResolve = resolve;
      this._readyReject = reject;
    });
    this.worker.addEventListener('message', (e) => this._handleMessage(e.data));
    this.worker.addEventListener('error', (e) => {
      this._emitStatus({ state: 'error', message: e.message });
    });
    this._emitStatus({ state: 'loading' });
    this.worker.postMessage({ type: 'init' });
  }

  _handleMessage(data) {
    if (data.type === 'ready') {
      this.readyResolved = true;
      this._readyResolve();
      this._emitStatus({ state: 'ready' });
      return;
    }
    if (data.type === 'init-error') {
      this._readyReject(new Error(data.message));
      this._emitStatus({ state: 'error', message: data.message });
      return;
    }
    if (data.type === 'result') {
      const pending = this._pending.get(data.runId);
      if (pending) {
        clearTimeout(pending.timer);
        this._pending.delete(data.runId);
        pending.resolve(data.payload);
      }
    }
  }

  /**
   * Runs Python code for a level. Resolves with a result payload:
   * { stdout, error: {type,message,line}|null, actions: [...], state: {...}, vars: {...}, timedOut }
   */
  async runCode(code, { initialState = {}, captureVars = [], apiTypes = [] } = {}) {
    await this.ready;
    const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this._pending.delete(runId);
        this.worker.terminate();
        this._spawnWorker();
        resolve({
          stdout: '',
          error: {
            type: 'Timeout',
            message: 'Your code took too long to run. Check for an infinite loop (e.g. a while loop that never stops)!',
            line: null,
          },
          actions: [],
          state: initialState,
          vars: {},
          timedOut: true,
        });
      }, RUN_TIMEOUT_MS);

      this._pending.set(runId, { resolve, timer });
      this.worker.postMessage({ type: 'run', runId, code, initialState, captureVars, apiTypes });
    });
  }
}

export const bridge = new PyodideBridge();
