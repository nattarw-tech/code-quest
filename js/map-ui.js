// Renders the level map screen: worlds, winding node paths, locked/available/
// completed states.

const WORLD_ICONS = {
  Basics: '🌱',
  Loops: '🔁',
  Conditionals: '🧭',
  Lists: '🎒',
  Functions: '🛠️',
  Dictionaries: '🔑',
  Classes: '🏗️',
  Boss: '👑',
};

export class MapUI {
  constructor(container, engine, levels, onSelectLevel) {
    this.container = container;
    this.engine = engine;
    this.levels = levels;
    this.onSelectLevel = onSelectLevel;
  }

  render() {
    this.container.innerHTML = '';

    const intro = document.createElement('div');
    intro.className = 'map-intro';
    intro.innerHTML = `<h2>Your Quest</h2><p>Complete levels to earn XP, unlock new worlds, and level up your Python skills.</p>`;
    this.container.appendChild(intro);

    const units = [...new Set(this.levels.map((l) => l.unit))];

    units.forEach((unit) => {
      const levelsInUnit = this.levels.filter((l) => l.unit === unit).sort((a, b) => a.order - b.order);
      const block = document.createElement('div');
      block.className = 'world-block';

      const title = document.createElement('div');
      title.className = 'world-title';
      title.textContent = `${WORLD_ICONS[unit] || '⭐'} ${unit}`;
      block.appendChild(title);

      const trackWrap = document.createElement('div');
      trackWrap.className = 'world-track-wrap';

      const track = document.createElement('div');
      track.className = `world-track ${levelsInUnit.length <= 1 ? 'world-track--single' : ''}`;

      levelsInUnit.forEach((level) => {
        const station = document.createElement('div');
        station.className = 'station';
        station.dataset.levelId = level.id;

        const node = document.createElement('button');
        const completed = this.engine.isCompleted(level.id);
        const unlocked = this.engine.isUnlocked(level);
        const isBoss = unit === 'Boss';

        node.className = `level-node ${completed ? 'completed' : unlocked ? 'available' : 'locked'} ${isBoss ? 'boss' : ''}`;
        node.innerHTML = `${isBoss ? '👑' : this._nodeIcon(level)}${completed ? '<span class="node-check">✅</span>' : ''}`;
        node.disabled = !unlocked;
        node.title = unlocked ? level.title : 'Complete earlier levels to unlock';
        node.addEventListener('click', () => {
          if (unlocked) this.onSelectLevel(level.id);
        });

        const label = document.createElement('div');
        label.className = 'node-label';
        label.textContent = level.title;

        station.appendChild(node);
        station.appendChild(label);
        track.appendChild(station);
      });

      trackWrap.appendChild(track);
      block.appendChild(trackWrap);
      this.container.appendChild(block);
    });
  }

  _nodeIcon(level) {
    if (level.visualType === 'canvas') return '🎨';
    if (level.visualType === 'console') return '💬';
    return '🤖';
  }
}
