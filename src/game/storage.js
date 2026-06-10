const STORAGE_KEY = "gold_miner_save";

const defaultSave = {
  highScore: 0,
  highestLevel: 1,
  soundEnabled: true,
  totalGames: 0,
};

export function loadSave() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...defaultSave, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load save:", e);
  }
  return { ...defaultSave };
}

export function saveSave(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save:", e);
  }
}

export function updateHighScore(score, level) {
  const save = loadSave();
  let updated = false;

  if (score > save.highScore) {
    save.highScore = score;
    updated = true;
  }
  if (level > save.highestLevel) {
    save.highestLevel = level;
    updated = true;
  }

  if (updated) {
    saveSave(save);
  }

  return save;
}

export function incrementTotalGames() {
  const save = loadSave();
  save.totalGames++;
  saveSave(save);
  return save;
}

export function toggleSoundSetting() {
  const save = loadSave();
  save.soundEnabled = !save.soundEnabled;
  saveSave(save);
  return save.soundEnabled;
}

export function getSoundSetting() {
  const save = loadSave();
  return save.soundEnabled;
}
