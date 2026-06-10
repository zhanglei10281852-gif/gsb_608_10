<template>
  <div class="hud">
    <div class="hud-left">
      <div class="hud-item">
        <span class="hud-label">关卡</span>
        <span class="hud-value level">第 {{ level }} 关</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">目标</span>
        <span class="hud-value target">{{ targetScore }}</span>
      </div>
    </div>
    
    <div class="hud-center">
      <div class="time-display" :class="{ warning: timeLeft <= 10 }">
        <span class="time-icon">⏱️</span>
        <span class="time-value">{{ formattedTime }}</span>
      </div>
    </div>
    
    <div class="hud-right">
      <div class="hud-item">
        <span class="hud-label">当前金额</span>
        <span class="hud-value score">{{ score }}</span>
      </div>
      <div class="hud-item">
        <span class="hud-label">总金额</span>
        <span class="hud-value total">{{ totalScore }}</span>
      </div>
    </div>
    
    <div class="hud-items">
      <div v-if="dynamites > 0" class="item-badge" title="炸药 (按D使用)">
        💣 {{ dynamites }}
      </div>
      <div v-if="hasGlove" class="item-badge" title="强力手套">
        🧤
      </div>
      <div v-if="hasClover" class="item-badge" title="幸运三叶草">
        🍀
      </div>
    </div>
    
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      <div class="progress-text">{{ Math.min(100, progressPercent).toFixed(0) }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 0
  },
  targetScore: {
    type: Number,
    default: 650
  },
  timeLeft: {
    type: Number,
    default: 60
  },
  totalScore: {
    type: Number,
    default: 0
  },
  dynamites: {
    type: Number,
    default: 0
  },
  hasGlove: {
    type: Boolean,
    default: false
  },
  hasClover: {
    type: Boolean,
    default: false
  }
});

const formattedTime = computed(() => {
  const time = Math.max(0, Math.ceil(props.timeLeft));
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const progressPercent = computed(() => {
  return (props.score / props.targetScore) * 100;
});
</script>

<style scoped>
.hud {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), transparent);
  color: #fff;
  font-size: 14px;
  pointer-events: none;
}

.hud-left,
.hud-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hud-right {
  align-items: flex-end;
}

.hud-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.hud-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.hud-value {
  font-size: 18px;
  font-weight: bold;
}

.hud-value.level {
  color: #87CEEB;
}

.hud-value.target {
  color: #FFA500;
}

.hud-value.score {
  color: #FFD700;
  font-size: 22px;
}

.hud-value.total {
  color: #90EE90;
  font-size: 16px;
}

.hud-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.5);
  padding: 8px 20px;
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.time-display.warning {
  background: rgba(255, 0, 0, 0.5);
  border-color: #FF6666;
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

.time-icon {
  font-size: 18px;
}

.time-value {
  font-size: 24px;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.hud-items {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 55px;
  display: flex;
  gap: 8px;
}

.item-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 14px;
  backdrop-filter: blur(5px);
}

.progress-bar {
  position: absolute;
  top: 155px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  height: 18px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 9px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.3);
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD700, #FFA500);
  transition: width 0.3s ease-out;
  border-radius: 8px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
