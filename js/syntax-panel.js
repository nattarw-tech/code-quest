// A global, always-accessible reference panel for the Python syntax taught
// across the game (loops, if/else, functions). Lives outside the per-level
// instructions panel so it never affects that panel's layout, and is
// reachable from both the map and challenge screens via a header button.

const SYNTAX_REFERENCE = [
  ['for loop', 'Repeat code a fixed number of times', 'for i in range(3):\n    robot.forward()'],
  ['while loop', 'Repeat while a condition stays True — remember to change something inside, or it never stops', 'count = 3\nwhile count > 0:\n    robot.forward()\n    count = count - 1'],
  ['if / elif / else', 'Run different code depending on a condition', 'if robot.is_blocked_ahead():\n    robot.turn_right()\nelse:\n    robot.forward()'],
  ['define a function', 'Name a block of code so you can reuse it', 'def go_forward_twice():\n    robot.forward()\n    robot.forward()\n\ngo_forward_twice()'],
  ['lists', 'Store multiple values in order, access with [index]', 'items = ["a", "b", "c"]\nfirst = items[0]\nfor item in items:\n    print(item)'],
  ['dictionaries', 'Store values by name (key) instead of position', 'prices = {"apple": 2}\nprint(prices["apple"])\nprices["banana"] = 1'],
];

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function initSyntaxPanel(rootEl) {
  rootEl.innerHTML = `
    <div class="syntax-panel" id="syntax-panel">
      <div class="syntax-panel-head">
        <h3>🧩 Python Syntax Guide</h3>
        <button class="btn btn-ghost btn-small" id="syntax-panel-close">✕</button>
      </div>
      <div class="syntax-panel-body">
        ${SYNTAX_REFERENCE.map(([name, desc, example]) => `
          <details class="syntax-item" open>
            <summary><strong>${escapeHtml(name)}</strong></summary>
            <div class="syntax-item-desc">${escapeHtml(desc)}</div>
            <div class="teach-example">${escapeHtml(example)}</div>
          </details>
        `).join('')}
      </div>
    </div>
  `;

  const panel = rootEl.querySelector('#syntax-panel');
  rootEl.querySelector('#syntax-panel-close').addEventListener('click', () => {
    panel.classList.remove('open');
  });

  return {
    toggle() { panel.classList.toggle('open'); },
    open() { panel.classList.add('open'); },
    close() { panel.classList.remove('open'); },
  };
}
