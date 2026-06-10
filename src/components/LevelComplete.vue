<template>
  <div class="level-complete-overlay">
    <div class="level-complete-container">
      <h2>🎉 第 {{ level }} 关完成！</h2>
      
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">本关得分</span>
          <span class="stat-value gold">+{{ score }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">累计总金额</span>
          <span class="stat-value total">{{ totalScore }}</span>
        </div>
      </div>
      
      <button class="btn btn-primary" @click="$emit('continue')">
        🛒 进入商店
      </button>
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
  totalScore: {
    type: Number,
    default: 0
  }
});

defineEmits(['continue']);
</script>

<style scoped>
.level-complete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(3px);
  z-index: 50;
}

.level-complete-container {
  text-align: center;
  color: #fff;
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.95);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.level-complete-container h2 {
  font-size: 36px;
  margin-bottom: 30px;
  color: #FFD700;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  gap: 30px;
}

.stat-label {
  color: #aaa;
  font-size: 14px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-value.gold {
  color: #FFD700;
}

.stat-value.total {
  color: #90EE90;
}

.btn {
  padding: 15px 50px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.6);
}
</style>
