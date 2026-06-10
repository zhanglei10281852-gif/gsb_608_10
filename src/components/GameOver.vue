<template>
  <div class="gameover-overlay">
    <div class="gameover-container">
      <h2>💔 游戏结束</h2>
      
      <div v-if="isNewRecord" class="new-record">
        🏆 新纪录！
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">到达关卡</span>
          <span class="stat-value level">第 {{ level }} 关</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">最终得分</span>
          <span class="stat-value score">{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">历史最高</span>
          <span class="stat-value high">{{ highScore }}</span>
        </div>
      </div>
      
      <div class="buttons">
        <button class="btn btn-primary" @click="$emit('restart')">
          🔄 再来一局
        </button>
        <button class="btn btn-secondary" @click="$emit('menu')">
          🏠 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  level: {
    type: Number,
    default: 1
  },
  score: {
    type: Number,
    default: 0
  },
  highScore: {
    type: Number,
    default: 0
  },
  isNewRecord: {
    type: Boolean,
    default: false
  }
});

defineEmits(['restart', 'menu']);
</script>

<style scoped>
.gameover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 50;
}

.gameover-container {
  text-align: center;
  color: #fff;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.gameover-container h2 {
  font-size: 42px;
  margin-bottom: 20px;
  color: #FF6B6B;
}

.new-record {
  font-size: 28px;
  color: #FFD700;
  margin-bottom: 25px;
  animation: pulse 1s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  }
  to {
    transform: scale(1.1);
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  gap: 50px;
  align-items: center;
}

.stat-label {
  color: #aaa;
  font-size: 14px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
}

.stat-value.level {
  color: #87CEEB;
}

.stat-value.score {
  color: #FFD700;
  font-size: 28px;
}

.stat-value.high {
  color: #FFA500;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 220px;
}

.btn-primary {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
