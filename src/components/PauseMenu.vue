<template>
  <div class="pause-overlay">
    <div class="pause-container">
      <h2>⏸️ 游戏暂停</h2>
      <p>按 Esc 键继续</p>
      
      <div class="pause-buttons">
        <button class="btn btn-primary" @click="$emit('resume')">
          ▶️ 继续游戏
        </button>
        <button class="btn btn-secondary" @click="$emit('quit')">
          🏠 返回主菜单
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['resume', 'quit']);
</script>

<style scoped>
.pause-overlay {
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

.pause-container {
  text-align: center;
  color: #fff;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.pause-container h2 {
  font-size: 36px;
  margin-bottom: 10px;
  color: #FFD700;
}

.pause-container p {
  color: #aaa;
  margin-bottom: 30px;
}

.pause-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.btn {
  padding: 12px 40px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 200px;
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
