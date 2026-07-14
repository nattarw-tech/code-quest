import { bridge } from './pyodide-bridge.js';
import { GameEngine } from './game-engine.js';
import { LEVELS, getLevelById } from './levels-data.js';
import { MapUI } from './map-ui.js';
import { ChallengeUI } from './challenge-ui.js';
import { fireConfetti, fireBigConfetti, playApplause } from './celebrate.js';
import { initSyntaxPanel } from './syntax-panel.js';

const engine = new GameEngine(LEVELS);

const splash = document.getElementById('loading-splash');
const splashStatus = document.getElementById('splash-status');
const splashBarFill = document.getElementById('splash-bar-fill');
const app = document.getElementById('app');
const mapScreen = document.getElementById('map-screen');
const challengeScreen = document.getElementById('challenge-screen');
const modalRoot = document.getElementById('modal-root');

const streakCountEl = document.getElementById('streak-count');
const xpCountEl = document.getElementById('xp-count');
const rankNameEl = document.getElementById('rank-name');
const resetBtn = document.getElementById('reset-progress-btn');

const syntaxPanel = initSyntaxPanel(document.getElementById('syntax-panel-root'));
document.getElementById('syntax-panel-toggle').addEventListener('click', () => syntaxPanel.toggle());

function refreshHeader() {
  streakCountEl.textContent = engine.getStreak();
  xpCountEl.textContent = engine.getXp();
  rankNameEl.textContent = engine.getRank();
}

function showMap() {
  mapScreen.classList.remove('hidden');
  challengeScreen.classList.add('hidden');
  mapUI.render();
  refreshHeader();
}

function showChallenge(levelId) {
  const level = getLevelById(levelId);
  if (!level) return;
  mapScreen.classList.add('hidden');
  challengeScreen.classList.remove('hidden');
  challengeUI.open(level);
}

function findNextLevel(currentLevel) {
  const sorted = [...LEVELS].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((l) => l.id === currentLevel.id);
  if (idx === -1) return null;
  return sorted[idx + 1] || null;
}

function showCompletionModal(level, summary) {
  const badgesHtml = summary.newBadges.map((b) => `<div class="badge-earned">${b.icon} ${b.name}</div>`).join('');
  const nextLevel = findNextLevel(level);
  const isGameComplete = !nextLevel && !summary.alreadyCompleted;

  if (isGameComplete) {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <div class="big-icon trophy-spin">🏆</div>
          <h2>Code Quest Complete!</h2>
          <p>You finished every level — print statements to classes, all the way through. Great work!</p>
          <p class="xp-tick">+${summary.xpGained} XP · ${engine.getXp()} total XP</p>
          ${badgesHtml}
          <div class="modal-actions">
            <button class="btn btn-primary" id="modal-map-btn">🗺️ Back to Map</button>
          </div>
        </div>
      </div>
    `;
    fireBigConfetti();
    playApplause();
  } else {
    modalRoot.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-card">
          <div class="big-icon">${summary.alreadyCompleted ? '✅' : '🎉'}</div>
          <h2>${summary.alreadyCompleted ? 'Level Complete!' : 'Level Cleared!'}</h2>
          ${summary.alreadyCompleted ? '<p>Already completed — no extra XP this time.</p>' : `<p class="xp-tick">+${summary.xpGained} XP</p>`}
          ${badgesHtml}
          <div class="modal-actions">
            <button class="btn btn-secondary" id="modal-map-btn">🗺️ Map</button>
            ${nextLevel ? '<button class="btn btn-primary" id="modal-next-btn">Next Level ▶</button>' : ''}
          </div>
        </div>
      </div>
    `;
    if (!summary.alreadyCompleted) fireConfetti();
  }

  document.getElementById('modal-map-btn').addEventListener('click', () => {
    modalRoot.innerHTML = '';
    refreshHeader();
    showMap();
  }, { once: true });

  const nextBtn = document.getElementById('modal-next-btn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      modalRoot.innerHTML = '';
      refreshHeader();
      travelToNextLevel(level.id, nextLevel.id);
    }, { once: true });
  }
}

/** Shows the map, then animates a robot traveling from the just-completed
 * station to the next one before opening it — so advancing feels like moving
 * along the quest path rather than a jarring jump back to the map.
 *
 * Deliberately avoids requestAnimationFrame for sequencing: rAF can be
 * throttled or suspended entirely while a tab isn't actively rendering,
 * which would leave navigation stuck. Reading layout (getBoundingClientRect)
 * and forcing a reflow (reading offsetWidth) are both synchronous, and the
 * single setTimeout that follows is what actually drives navigation forward
 * regardless of rendering state. */
function travelToNextLevel(fromLevelId, toLevelId) {
  showMap();

  const fromEl = mapScreen.querySelector(`[data-level-id="${fromLevelId}"] .level-node`);
  const toEl = mapScreen.querySelector(`[data-level-id="${toLevelId}"] .level-node`);
  if (!fromEl || !toEl) {
    showChallenge(toLevelId);
    return;
  }

  toEl.scrollIntoView({ block: 'center', inline: 'center', behavior: 'auto' });

  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  const traveler = document.createElement('div');
  traveler.className = 'map-traveler';
  traveler.textContent = '🤖';
  traveler.style.left = `${fromRect.left + fromRect.width / 2}px`;
  traveler.style.top = `${fromRect.top + fromRect.height / 2}px`;
  document.body.appendChild(traveler);

  void traveler.offsetWidth; // force layout so the transition below actually animates

  traveler.style.left = `${toRect.left + toRect.width / 2}px`;
  traveler.style.top = `${toRect.top + toRect.height / 2}px`;
  traveler.style.transform = 'translate(-50%, -50%) scale(1.3)';

  setTimeout(() => {
    traveler.remove();
    showChallenge(toLevelId);
  }, 1350);
}

const mapUI = new MapUI(mapScreen, engine, LEVELS, (levelId) => showChallenge(levelId));

const challengeUI = new ChallengeUI(challengeScreen, bridge, {
  onBack: () => showMap(),
  onComplete: (level, hintsUsed) => {
    const summary = engine.completeLevel(level, { hintsUsed });
    refreshHeader();
    showCompletionModal(level, summary);
  },
});

resetBtn.addEventListener('click', () => {
  if (confirm('Reset all progress? This cannot be undone.')) {
    engine.resetProgress();
    refreshHeader();
    showMap();
  }
});

bridge.onStatus((status) => {
  if (status.state === 'loading') {
    splashStatus.textContent = 'Waking up the Python engine…';
    splashBarFill.style.width = '40%';
  } else if (status.state === 'ready') {
    splashStatus.textContent = 'Ready!';
    splashBarFill.style.width = '100%';
    setTimeout(() => {
      splash.style.opacity = '0';
      setTimeout(() => splash.classList.add('hidden'), 400);
      app.classList.remove('hidden');
      refreshHeader();
      showMap();
    }, 250);
  } else if (status.state === 'error') {
    splashStatus.textContent = 'Something went wrong loading the Python engine. Please refresh.';
  }
});
