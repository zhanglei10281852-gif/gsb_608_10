<template>
  <div class="game-wrapper">
    <div class="game-container" :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px' }">
      <canvas
        ref="canvasRef"
        :width="canvasWidth"
        :height="canvasHeight"
        @click="handleCanvasClick"
      ></canvas>
      
      <MainMenu
        v-if="gameState === 'menu'"
        :high-score="saveData.highScore"
        :highest-level="saveData.highestLevel"
        :sound-enabled="soundEnabled"
        @start="startGame"
        @toggle-sound="toggleSound"
      />
      
      <GameHUD
        v-if="gameState === 'playing' || gameState === 'paused'"
        :level="game.level"
        :score="game.score"
        :target-score="game.targetScore"
        :time-left="game.timeLeft"
        :total-score="game.totalScore"
        :dynamites="game.items.dynamite"
        :has-glove="game.items.strongGlove"
        :has-clover="game.items.luckyClover"
      />
      
      <PauseMenu
        v-if="gameState === 'paused'"
        @resume="resumeGame"
        @quit="quitToMenu"
      />
      
      <LevelComplete
        v-if="gameState === 'levelComplete'"
        :level="game.level"
        :score="game.score"
        :total-score="game.totalScore"
        @continue="goToShop"
      />
      
      <Shop
        v-if="gameState === 'shop'"
        :total-score="game.totalScore"
        :items="game.items"
        @buy="buyItem"
        @next-level="nextLevel"
      />
      
      <GameOver
        v-if="gameState === 'gameOver'"
        :level="game.level"
        :score="game.totalScore"
        :high-score="saveData.highScore"
        :is-new-record="isNewRecord"
        @restart="startGame"
        @menu="quitToMenu"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from 'vue';
import { GameEngine, GameState } from './game/engine.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './game/config.js';
import { soundManager } from './game/sound.js';
import { loadSave, updateHighScore, getSoundSetting, toggleSoundSetting, incrementTotalGames } from './game/storage.js';

import MainMenu from './components/MainMenu.vue';
import GameHUD from './components/GameHUD.vue';
import PauseMenu from './components/PauseMenu.vue';
import LevelComplete from './components/LevelComplete.vue';
import Shop from './components/Shop.vue';
import GameOver from './components/GameOver.vue';

const canvasRef = ref(null);
const canvasWidth = CANVAS_WIDTH;
const canvasHeight = CANVAS_HEIGHT;

const game = reactive(new GameEngine());
const gameState = computed(() => game.state);

const saveData = reactive(loadSave());
const soundEnabled = ref(getSoundSetting());
const isNewRecord = ref(false);

let animationId = null;
let lastTime = 0;

function gameLoop(timestamp) {
  if (!canvasRef.value) return;
  
  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
  lastTime = timestamp;
  
  const ctx = canvasRef.value.getContext('2d');
  
  if (game.state === GameState.PLAYING) {
    game.update(deltaTime);
  }
  
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  game.draw(ctx);
  
  animationId = requestAnimationFrame(gameLoop);
}

function handleCanvasClick() {
  if (game.state === GameState.PLAYING) {
    game.launchHook();
  }
}

function handleKeyDown(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    if (game.state === GameState.PLAYING) {
      game.launchHook();
    }
  } else if (e.code === 'Escape') {
    e.preventDefault();
    if (game.state === GameState.PLAYING || game.state === GameState.PAUSED) {
      game.togglePause();
    }
  } else if (e.code === 'KeyD') {
    if (game.state === GameState.PLAYING) {
      game.useDynamite();
    }
  }
}

function startGame() {
  soundManager.init();
  soundManager.enabled = soundEnabled.value;
  game.startGame();
  incrementTotalGames();
  isNewRecord.value = false;
}

function resumeGame() {
  game.togglePause();
}

function quitToMenu() {
  game.state = GameState.MENU;
}

function goToShop() {
  game.goToShop();
}

function buyItem(itemType, price) {
  return game.buyItem(itemType, price);
}

function nextLevel() {
  game.nextLevel();
}

function toggleSound() {
  soundEnabled.value = toggleSoundSetting();
  soundManager.enabled = soundEnabled.value;
}

function onGameStateChange() {
  if (game.state === GameState.GAME_OVER) {
    const newSave = updateHighScore(game.totalScore, game.level);
    Object.assign(saveData, newSave);
    isNewRecord.value = game.totalScore >= newSave.highScore && game.totalScore > 0;
  }
}

watch(
  () => game.state,
  () => {
    onGameStateChange();
  }
);

onMounted(() => {
  soundManager.enabled = soundEnabled.value;
  
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
  
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.game-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  padding: 20px;
}

.game-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
}

canvas {
  display: block;
  cursor: pointer;
}
</style>
