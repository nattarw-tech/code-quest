// XP, streaks, badges, level unlocking, and localStorage persistence.

const SAVE_KEY = 'codequest-save-v1';
const SAVE_VERSION = 1;

export const BADGES = [
  { id: 'badge-first-blood', name: 'First Steps', icon: '👣', description: 'Complete your first level.' },
  { id: 'badge-no-hints', name: 'Sharp Mind', icon: '🧠', description: 'Complete a level without using any hints.' },
  { id: 'badge-streak-3', name: 'On a Roll', icon: '🔥', description: 'Reach a 3-day streak.' },
  { id: 'badge-loops-world', name: 'Loop Master', icon: '🔁', description: 'Finish every level in the Loops world.' },
  { id: 'badge-conditionals-world', name: 'Decision Maker', icon: '🧭', description: 'Finish every level in the Conditionals world.' },
  { id: 'badge-lists-world', name: 'Collector', icon: '🎒', description: 'Finish every level in the Lists world.' },
  { id: 'badge-functions-world', name: 'Reuse Champion', icon: '🛠️', description: 'Finish every level in the Functions world.' },
  { id: 'badge-graduate', name: 'Code Quest Graduate', icon: '🎓', description: 'Complete every level, including the boss.' },
];

const RANKS = [
  { minXp: 0, name: 'Novice' },
  { minXp: 150, name: 'Apprentice' },
  { minXp: 350, name: 'Coder' },
  { minXp: 600, name: 'Debugger' },
  { minXp: 900, name: 'Engineer' },
  { minXp: 1300, name: 'Pythonista' },
];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultSave() {
  return {
    version: SAVE_VERSION,
    xp: 0,
    streak: { count: 0, lastPlayedDate: null },
    completedLevels: {},
    badges: [],
  };
}

export class GameEngine {
  constructor(levels) {
    this.levels = levels;
    this.state = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return defaultSave();
      const parsed = JSON.parse(raw);
      if (parsed.version !== SAVE_VERSION) return defaultSave();
      return parsed;
    } catch {
      return defaultSave();
    }
  }

  _save() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
  }

  resetProgress() {
    this.state = defaultSave();
    this._save();
  }

  getXp() {
    return this.state.xp;
  }

  getRank() {
    let rank = RANKS[0];
    for (const r of RANKS) {
      if (this.state.xp >= r.minXp) rank = r;
    }
    return rank.name;
  }

  getStreak() {
    return this.state.streak.count;
  }

  isCompleted(levelId) {
    return Boolean(this.state.completedLevels[levelId]);
  }

  isUnlocked(level) {
    if (!level.unlockRequires || level.unlockRequires.length === 0) return true;
    return level.unlockRequires.every((id) => this.isCompleted(id));
  }

  getBadges() {
    return this.state.badges;
  }

  hasBadge(id) {
    return this.state.badges.includes(id);
  }

  _touchStreak() {
    const today = todayStr();
    const { lastPlayedDate, count } = this.state.streak;
    if (lastPlayedDate === today) return;

    if (!lastPlayedDate) {
      this.state.streak = { count: 1, lastPlayedDate: today };
      return;
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (lastPlayedDate === yesterday) {
      this.state.streak = { count: count + 1, lastPlayedDate: today };
    } else {
      this.state.streak = { count: 1, lastPlayedDate: today };
    }
  }

  _worldLevels(unit) {
    return this.levels.filter((l) => l.unit === unit);
  }

  _worldComplete(unit) {
    return this._worldLevels(unit).every((l) => this.isCompleted(l.id));
  }

  /**
   * Records a level completion. Returns a summary of what was newly earned:
   * { alreadyCompleted, xpGained, newBadges: [badge,...], streak, rank }
   */
  completeLevel(level, { hintsUsed = 0 } = {}) {
    const alreadyCompleted = this.isCompleted(level.id);
    const newBadges = [];

    if (!alreadyCompleted) {
      this.state.completedLevels[level.id] = {
        completedAt: new Date().toISOString(),
        hintsUsed,
      };
      this.state.xp += level.xpReward || 0;

      if (level.badgeId && !this.hasBadge(level.badgeId)) {
        this.state.badges.push(level.badgeId);
        newBadges.push(level.badgeId);
      }
      if (Object.keys(this.state.completedLevels).length === 1 && !this.hasBadge('badge-first-blood')) {
        this.state.badges.push('badge-first-blood');
        newBadges.push('badge-first-blood');
      }
      if (hintsUsed === 0 && !this.hasBadge('badge-no-hints')) {
        this.state.badges.push('badge-no-hints');
        newBadges.push('badge-no-hints');
      }

      const worldBadgeMap = {
        Loops: 'badge-loops-world',
        Conditionals: 'badge-conditionals-world',
        Lists: 'badge-lists-world',
        Functions: 'badge-functions-world',
      };
      const badgeForWorld = worldBadgeMap[level.unit];
      if (badgeForWorld && !this.hasBadge(badgeForWorld) && this._worldComplete(level.unit)) {
        this.state.badges.push(badgeForWorld);
        newBadges.push(badgeForWorld);
      }

      if (this.levels.every((l) => this.isCompleted(l.id)) && !this.hasBadge('badge-graduate')) {
        this.state.badges.push('badge-graduate');
        newBadges.push('badge-graduate');
      }
    }

    this._touchStreak();
    if (this.state.streak.count >= 3 && !this.hasBadge('badge-streak-3')) {
      this.state.badges.push('badge-streak-3');
      newBadges.push('badge-streak-3');
    }

    this._save();

    return {
      alreadyCompleted,
      xpGained: alreadyCompleted ? 0 : (level.xpReward || 0),
      newBadges: newBadges.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean),
      streak: this.state.streak.count,
      rank: this.getRank(),
    };
  }
}
