// DOM/CSS-grid based renderer for robot-on-a-grid levels. Renders the static
// board once, then replays a level run's action log as a paced animation.

const CELL = 38;
const GAP = 3;
const DIR_ROTATION = { E: 0, S: 90, W: 180, N: 270 };
const STEP_DELAY_MS = 300;

function cellPos(x, y) {
  return { left: x * (CELL + GAP) + GAP, top: y * (CELL + GAP) + GAP };
}

export class GridRenderer {
  constructor(container) {
    this.container = container;
    this.state = null;
    this.robotEl = null;
    this.stageEl = null;
  }

  render(initialState) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.container.innerHTML = '';

    const [w, h] = this.state.gridSize;
    const stage = document.createElement('div');
    stage.className = 'grid-stage';
    stage.style.position = 'relative';
    stage.style.gridTemplateColumns = `repeat(${w}, ${CELL}px)`;
    stage.style.gridTemplateRows = `repeat(${h}, ${CELL}px)`;
    stage.style.width = `${w * (CELL + GAP) + GAP}px`;
    stage.style.height = `${h * (CELL + GAP) + GAP}px`;

    const walls = new Set((this.state.walls || []).map(([x, y]) => `${x},${y}`));
    const coins = new Set((this.state.coins || []).map(([x, y]) => `${x},${y}`));
    const goal = this.state.goal;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.x = x;
        cell.dataset.y = y;
        if (walls.has(`${x},${y}`)) cell.classList.add('wall');
        if (goal && goal.x === x && goal.y === y) cell.classList.add('goal');
        if (coins.has(`${x},${y}`)) cell.classList.add('coin');
        stage.appendChild(cell);
      }
    }

    this.robotEl = document.createElement('div');
    this.robotEl.className = 'grid-robot';
    this.robotEl.textContent = '🤖';
    const { left, top } = cellPos(this.state.robot.x, this.state.robot.y);
    this.robotEl.style.left = `${left}px`;
    this.robotEl.style.top = `${top}px`;
    this.robotEl.style.transform = `rotate(${DIR_ROTATION[this.state.robot.dir] || 0}deg)`;
    stage.appendChild(this.robotEl);

    this.container.appendChild(stage);
    this.stageEl = stage;
  }

  _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  _bump() {
    this.robotEl.classList.remove('bump');
    // force reflow so the animation can restart if triggered twice quickly
    void this.robotEl.offsetWidth;
    this.robotEl.classList.add('bump');
  }

  _showBubble(text) {
    const bubble = document.createElement('div');
    bubble.className = 'speech-bubble';
    bubble.textContent = text;
    bubble.style.left = this.robotEl.style.left;
    bubble.style.top = this.robotEl.style.top;
    this.stageEl.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1600);
  }

  _removeCoin(x, y) {
    const cell = this.stageEl.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
    if (cell) cell.classList.remove('coin');
  }

  /** Replays an action log over the already-rendered initial board. */
  async replay(actions) {
    for (const action of actions) {
      if (action.type === 'move') {
        const { left, top } = cellPos(action.x, action.y);
        this.robotEl.style.left = `${left}px`;
        this.robotEl.style.top = `${top}px`;
        this.robotEl.style.transform = `rotate(${DIR_ROTATION[action.dir] || 0}deg)`;
      } else if (action.type === 'turn') {
        this.robotEl.style.transform = `rotate(${DIR_ROTATION[action.dir] || 0}deg)`;
      } else if (action.type === 'blocked') {
        this._bump();
      } else if (action.type === 'say') {
        this._showBubble(action.text);
      } else if (action.type === 'collect') {
        this._removeCoin(action.x, action.y);
      }
      await this._sleep(STEP_DELAY_MS);
    }
  }
}
