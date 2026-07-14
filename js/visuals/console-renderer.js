// Simple styled output panel for print()/value-based levels — no animation,
// just shows the captured stdout as a "terminal".

export class ConsoleRenderer {
  constructor(container) {
    this.container = container;
    this.box = null;
  }

  render() {
    this.container.innerHTML = '';
    this.box = document.createElement('div');
    this.box.className = 'console-stage-box';
    this.box.textContent = 'Run your code to see the output here...';
    this.container.appendChild(this.box);
  }

  async replay(_actions, stdout) {
    this.box.textContent = stdout && stdout.length ? stdout : '(no output yet)';
  }
}
