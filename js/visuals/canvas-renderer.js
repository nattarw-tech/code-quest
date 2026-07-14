// <canvas> renderer for turtle-graphics drawing levels. Replays the action
// log (line/jump segments) as a paced drawing animation.

const STEP_DELAY_MS = 120;
const CANVAS_SIZE = 280;

export class CanvasRenderer {
  constructor(container) {
    this.container = container;
    this.canvas = null;
    this.ctx = null;
    this.originX = CANVAS_SIZE / 2;
    this.originY = CANVAS_SIZE / 2;
  }

  render(initialState) {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'turtle-canvas-wrap';
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    wrap.appendChild(this.canvas);
    this.container.appendChild(wrap);
    this.ctx = this.canvas.getContext('2d');
    this._clear();
  }

  _clear() {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    this.ctx.strokeStyle = '#7c5cff';
    this.ctx.lineWidth = 2.5;
    this.ctx.lineCap = 'round';
  }

  _toCanvas(x, y) {
    return { cx: this.originX + x, cy: this.originY - y };
  }

  _sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async replay(actions) {
    for (const action of actions) {
      if (action.type === 'line') {
        const p1 = this._toCanvas(action.x1, action.y1);
        const p2 = this._toCanvas(action.x2, action.y2);
        this.ctx.beginPath();
        this.ctx.moveTo(p1.cx, p1.cy);
        this.ctx.lineTo(p2.cx, p2.cy);
        this.ctx.stroke();
      }
      await this._sleep(STEP_DELAY_MS);
    }
  }
}
