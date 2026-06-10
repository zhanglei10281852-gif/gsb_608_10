<template>
  <div class="menu-overlay">
    <div class="menu-container">
      <h1 class="title">⛏️ 黄金矿工</h1>
      <p class="subtitle">Gold Miner</p>
      
      <div class="menu-buttons">
        <button class="btn btn-primary" @click="$emit('start')">
          🎮 开始游戏
        </button>
        <button class="btn btn-secondary" @click="showInfo = true">
          📖 玩法说明
        </button>
      </div>
      
      <div class="records">
        <div class="record-item">
          <span class="record-label">🏆 最高分</span>
          <span class="record-value">{{ highScore }}</span>
        </div>
        <div class="record-item">
          <span class="record-label">📍 最远关卡</span>
          <span class="record-value">第 {{ highestLevel }} 关</span>
        </div>
      </div>
      
      <button class="sound-toggle" @click="$emit('toggle-sound')">
        {{ soundEnabled ? '🔊 音效开' : '🔇 音效关' }}
      </button>
      
      <div v-if="showInfo" class="info-modal" @click.self="showInfo = false">
        <div class="info-content">
          <h2>🎯 玩法说明</h2>
          
          <div class="info-section">
            <h3>基本操作</h3>
            <ul>
              <li>🖱️ <strong>鼠标点击</strong> 或 <strong>空格键</strong>：发射钩子</li>
              <li>⏸️ <strong>Esc 键</strong>：暂停游戏</li>
              <li>💣 <strong>D 键</strong>：使用炸药（需购买）</li>
            </ul>
          </div>
          
          <div class="info-section">
            <h3>游戏目标</h3>
            <p>在 60 秒内抓取矿物，达到目标金额即可过关。</p>
          </div>
          
          <div class="info-section">
            <h3>矿物图鉴</h3>
            <div class="mineral-list">
              <div class="mineral-item">
                <span class="mineral-icon">🟡</span>
                <span>小金块 - 价值 100</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">🌟</span>
                <span>大金块 - 价值 500</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">💎</span>
                <span>钻石 - 价值 800</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">📦</span>
                <span>宝箱 - 价值 50~300</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">🪨</span>
                <span>小石头 - 价值 20</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">🗿</span>
                <span>大石头 - 价值 50</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">🐀</span>
                <span>老鼠 - 价值 10</span>
              </div>
              <div class="mineral-item">
                <span class="mineral-icon">💀</span>
                <span>骷髅头 - 价值 -50</span>
              </div>
            </div>
          </div>
          
          <div class="info-section">
            <h3>道具说明</h3>
            <ul>
              <li>💣 <strong>炸药</strong>：按D键炸掉抓上来的石头</li>
              <li>🧤 <strong>强力手套</strong>：永久提升收回速度30%</li>
              <li>🍀 <strong>幸运三叶草</strong>：下一关钻石出现率提升</li>
              <li>🥤 <strong>力量饮料</strong>：下一关增加15秒游戏时间</li>
            </ul>
          </div>
          
          <button class="btn btn-primary" @click="showInfo = false">
            知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  highScore: {
    type: Number,
    default: 0
  },
  highestLevel: {
    type: Number,
    default: 1
  },
  soundEnabled: {
    type: Boolean,
    default: true
  }
});

defineEmits(['start', 'toggle-sound']);

const showInfo = ref(false);
</script>

<style scoped>
.menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%);
  backdrop-filter: blur(5px);
}

.menu-container {
  text-align: center;
  padding: 40px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.title {
  font-size: 56px;
  color: #FFD700;
  margin-bottom: 5px;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.5);
}

.subtitle {
  font-size: 18px;
  color: #B8860B;
  margin-bottom: 40px;
  letter-spacing: 3px;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
}

.btn {
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 250px;
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

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.records {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 30px;
}

.record-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.record-label {
  font-size: 14px;
  color: #888;
}

.record-value {
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
}

.sound-toggle {
  background: none;
  border: none;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.2s;
}

.sound-toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}

.info-modal {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 20px;
}

.info-content {
  background: linear-gradient(135deg, #2a2a4a, #1a1a2e);
  padding: 25px 35px;
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 100%;
  overflow-y: auto;
  text-align: left;
  color: #fff;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.info-content h2 {
  text-align: center;
  color: #FFD700;
  margin-bottom: 20px;
}

.info-section {
  margin-bottom: 20px;
}

.info-section h3 {
  color: #87CEEB;
  margin-bottom: 10px;
  font-size: 16px;
}

.info-section ul {
  list-style: none;
  padding: 0;
}

.info-section li {
  padding: 5px 0;
  color: #ddd;
  font-size: 14px;
}

.info-section p {
  color: #ddd;
  font-size: 14px;
}

.mineral-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.mineral-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ddd;
}

.mineral-icon {
  font-size: 18px;
}

.info-content .btn-primary {
  width: 100%;
  margin-top: 10px;
}
</style>
