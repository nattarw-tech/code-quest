import { CodeEditor } from './editor.js';
import { GridRenderer } from './visuals/grid-renderer.js';
import { CanvasRenderer } from './visuals/canvas-renderer.js';
import { ConsoleRenderer } from './visuals/console-renderer.js';
import { friendlyError } from './error-messages.js';
import { primeAudio } from './celebrate.js';

// Reference table shown in the instructions panel so a level's exact API
// syntax is never hidden behind a hint click. Each entry is keyed by the
// bare method name so a level can opt into showing only the methods it
// actually needs via its `commandsUsed` field, rather than the whole API.
const API_REFERENCE = {
  robot: [
    ['forward', 'robot.forward()', "Move ONE step forward. Takes no number — call it again to go further, e.g. robot.forward() twice moves 2 steps."],
    ['turn_left', 'robot.turn_left()', 'Turn 90° left. Only changes direction — does not move the robot.'],
    ['turn_right', 'robot.turn_right()', 'Turn 90° right. Only changes direction — does not move the robot.'],
    ['say', 'robot.say("text")', 'Show a speech bubble above the robot'],
    ['is_blocked_ahead', 'robot.is_blocked_ahead()', 'Returns True or False — is there a wall directly ahead?'],
    ['collect', 'robot.collect()', 'Pick up a coin on the robot\'s current cell'],
  ],
  turtle: [
    ['forward', 'turtle.forward(distance)', 'Move forward by "distance" pixels in one call, drawing a line if the pen is down'],
    ['left', 'turtle.left(degrees)', 'Turn left by the given angle'],
    ['right', 'turtle.right(degrees)', 'Turn right by the given angle'],
    ['pen_up', 'turtle.pen_up()', 'Stop drawing while moving'],
    ['pen_down', 'turtle.pen_down()', 'Resume drawing while moving'],
  ],
};

function commandsBoxHtml(apiTypes, commandsUsed) {
  const allRows = (apiTypes || []).flatMap((type) => API_REFERENCE[type] || []);
  const rows = commandsUsed ? allRows.filter(([key]) => commandsUsed.includes(key)) : allRows;
  if (rows.length === 0) return '';
  const items = rows.map(([, sig, desc]) => `<div class="command-row"><code>${escapeHtml(sig)}</code><span>${escapeHtml(desc)}</span></div>`).join('');
  return `<details class="commands-box" open><summary>🔧 Commands you can use</summary>${items}</details>`;
}

function rendererFor(visualType, container) {
  if (visualType === 'grid') return new GridRenderer(container);
  if (visualType === 'canvas') return new CanvasRenderer(container);
  return new ConsoleRenderer(container);
}

export class ChallengeUI {
  constructor(container, bridge, callbacks) {
    this.container = container;
    this.bridge = bridge;
    this.callbacks = callbacks; // { onComplete(level, hintsUsed), onBack() }
    this.level = null;
    this.editor = null;
    this.renderer = null;
    this.hintsRevealed = 0;
    this.running = false;
  }

  async open(level) {
    this.level = level;
    this.hintsRevealed = 0;
    this.running = false;
    this._buildLayout();
    this.editor = new CodeEditor(this.editorHost);
    await this.editor.mount(level.starterCode || '');
    this.renderer = rendererFor(level.visualType, this.visualStage);
    this.renderer.render(level.initialState);
    this._updateHintsPanel();
  }

  _buildLayout() {
    this.container.innerHTML = `
      <div class="challenge-topbar">
        <button class="btn btn-ghost btn-small" id="back-btn">← Map</button>
        <h2>${this.level.title}</h2>
        <div></div>
      </div>

      <div class="challenge-tabs">
        <button data-tab="instructions" class="active">Instructions</button>
        <button data-tab="code">Code</button>
        <button data-tab="visual">Visual</button>
      </div>

      <div class="challenge-grid">
        <div class="panel tab-active" data-panel="instructions">
          <h3>📖 ${this.level.concept}</h3>
          <div class="story-text">${this.level.storyText}</div>
          <div class="teach-box">
            <div>${this.level.teachingContent.explanation}</div>
            <div class="teach-example">${escapeHtml(this.level.teachingContent.example)}</div>
          </div>
          ${commandsBoxHtml(this.level.apiTypes, this.level.commandsUsed)}
          <div class="hints-list" id="hints-list"></div>
          <button class="btn btn-secondary btn-small hint-reveal-btn" id="hint-btn">💡 Show a hint</button>
        </div>

        <div class="panel editor-panel" data-panel="code">
          <div class="editor-toolbar">
            <button class="btn btn-primary" id="run-btn">▶ Run</button>
            <button class="btn btn-secondary" id="reset-btn">↺ Reset</button>
          </div>
          <div class="cm-host" id="editor-host"></div>
          <div class="console-output" id="console-output">Run your code to see output here...</div>
          <div class="feedback-banner" id="feedback-banner"></div>
        </div>

        <div class="panel visual-panel" data-panel="visual">
          <h3>🖥️ Live View</h3>
          <div class="visual-stage" id="visual-stage"></div>
        </div>
      </div>
    `;

    this.editorHost = this.container.querySelector('#editor-host');
    this.visualStage = this.container.querySelector('#visual-stage');
    this.consoleOutput = this.container.querySelector('#console-output');
    this.feedbackBanner = this.container.querySelector('#feedback-banner');
    this.hintsListEl = this.container.querySelector('#hints-list');

    this.container.querySelector('#back-btn').addEventListener('click', () => this.callbacks.onBack());
    this.container.querySelector('#run-btn').addEventListener('click', () => this._runCode());
    this.container.querySelector('#reset-btn').addEventListener('click', () => this._resetCode());
    this.container.querySelector('#hint-btn').addEventListener('click', () => this._revealHint());

    this.container.querySelectorAll('.challenge-tabs button').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.challenge-tabs button').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.container.querySelectorAll('.panel').forEach((p) => p.classList.remove('tab-active'));
        this.container.querySelector(`[data-panel="${btn.dataset.tab}"]`).classList.add('tab-active');
      });
    });
  }

  _updateHintsPanel() {
    this.hintsListEl.innerHTML = '';
    for (let i = 0; i < this.hintsRevealed; i++) {
      const div = document.createElement('div');
      div.className = 'hint-item';
      div.textContent = `💡 ${this.level.hints[i]}`;
      this.hintsListEl.appendChild(div);
    }
    const btn = this.container.querySelector('#hint-btn');
    if (this.hintsRevealed >= this.level.hints.length) {
      btn.disabled = true;
      btn.textContent = 'No more hints';
    }
  }

  _revealHint() {
    if (this.hintsRevealed < this.level.hints.length) {
      this.hintsRevealed += 1;
      this._updateHintsPanel();
    }
  }

  _resetCode() {
    this.editor.setCode(this.level.starterCode || '');
    this.renderer.render(this.level.initialState);
    this.consoleOutput.textContent = 'Run your code to see output here...';
    this._clearFeedback();
  }

  _clearFeedback() {
    this.feedbackBanner.className = 'feedback-banner';
    this.feedbackBanner.textContent = '';
  }

  _showFeedback(kind, text) {
    this.feedbackBanner.className = `feedback-banner show ${kind}`;
    this.feedbackBanner.textContent = text;
  }

  async _runCode() {
    if (this.running) return;
    this.running = true;
    // Primed here (synchronously, still inside this click handler) rather than
    // when the celebration actually fires — by then we're well past the worker
    // roundtrip and replay animation, and browser autoplay policy can silently
    // suspend audio created that far from the original user gesture.
    primeAudio();
    const runBtn = this.container.querySelector('#run-btn');
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running...';
    this._clearFeedback();

    const code = this.editor.getCode();
    const result = await this.bridge.runCode(code, {
      initialState: this.level.initialState,
      captureVars: this.level.captureVars,
      apiTypes: this.level.apiTypes,
    });

    this.consoleOutput.textContent = result.stdout && result.stdout.length ? result.stdout : '(no output)';
    if (result.error) {
      const fe = friendlyError(result.error);
      this.consoleOutput.textContent += `\n${fe.raw}`;
    }

    this.renderer.render(this.level.initialState);
    await this.renderer.replay(result.actions, result.stdout);

    if (result.error) {
      const fe = friendlyError(result.error);
      this._showFeedback('error', `❌ ${fe.friendly}`);
    } else {
      const outcome = this.level.checkSolution(result);
      if (outcome.passed) {
        this._showFeedback('success', `✅ ${outcome.message}`);
        this.callbacks.onComplete(this.level, this.hintsRevealed);
      } else {
        this._showFeedback('error', `❌ ${outcome.message}`);
      }
    }

    runBtn.disabled = false;
    runBtn.textContent = '▶ Run';
    this.running = false;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
