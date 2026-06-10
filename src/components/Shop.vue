<template>
  <div class="shop-overlay">
    <div class="shop-container">
      <h2>🛒 道具商店</h2>
      
      <div class="shop-balance">
        <span>💰 当前金额：</span>
        <span class="balance-value">{{ totalScore }}</span>
      </div>
      
      <div class="shop-items">
        <div
          v-for="(item, key) in shopItems"
          :key="key"
          class="shop-item"
          :class="{ disabled: !canAfford(item.price) || (key === 'strongGlove' && items.strongGlove) }"
        >
          <div class="item-icon">{{ item.icon }}</div>
          <div class="item-info">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description }}</p>
            <div class="item-price">💰 {{ item.price }}</div>
          </div>
          <button
            class="buy-btn"
            :disabled="!canAfford(item.price) || (key === 'strongGlove' && items.strongGlove)"
            @click="handleBuy(key, item.price)"
          >
            {{ key === 'strongGlove' && items.strongGlove ? '已拥有' : '购买' }}
          </button>
        </div>
      </div>
      
      <div class="owned-items">
        <span>已拥有：</span>
        <span v-if="items.dynamite > 0" class="owned-badge">💣 × {{ items.dynamite }}</span>
        <span v-if="items.strongGlove" class="owned-badge">🧤 强力手套</span>
        <span v-if="items.luckyClover" class="owned-badge">🍀 幸运三叶草</span>
        <span v-if="items.energyDrink > 0" class="owned-badge">🥤 × {{ items.energyDrink }}</span>
        <span v-if="!hasAnyItem" class="no-items">暂无</span>
      </div>
      
      <button class="continue-btn" @click="$emit('next-level')">
        ➡️ 进入下一关
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { ITEM_TYPES } from '../game/config.js';

const props = defineProps({
  totalScore: {
    type: Number,
    default: 0
  },
  items: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['buy', 'next-level']);

const shopItems = ITEM_TYPES;

function canAfford(price) {
  return props.totalScore >= price;
}

function handleBuy(itemType, price) {
  if (canAfford(price)) {
    emit('buy', itemType, price);
  }
}

const hasAnyItem = computed(() => {
  return props.items.dynamite > 0 ||
         props.items.strongGlove ||
         props.items.luckyClover ||
         props.items.energyDrink > 0;
});
</script>

<style scoped>
.shop-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
  backdrop-filter: blur(5px);
  z-index: 50;
}

.shop-container {
  width: 90%;
  max-width: 600px;
  max-height: 90%;
  padding: 30px;
  color: #fff;
  overflow-y: auto;
  animation: fadeIn 0.3s ease-out;
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

.shop-container h2 {
  text-align: center;
  font-size: 32px;
  color: #FFD700;
  margin-bottom: 20px;
}

.shop-balance {
  text-align: center;
  font-size: 20px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 25px;
  border: 2px solid rgba(255, 215, 0, 0.3);
}

.balance-value {
  font-size: 28px;
  font-weight: bold;
  color: #FFD700;
}

.shop-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.shop-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.shop-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 215, 0, 0.3);
}

.shop-item.disabled {
  opacity: 0.5;
}

.item-icon {
  font-size: 40px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  font-size: 16px;
  margin-bottom: 5px;
  color: #fff;
}

.item-info p {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 5px;
}

.item-price {
  font-size: 14px;
  color: #FFD700;
  font-weight: bold;
}

.buy-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #333;
  transition: all 0.3s;
  flex-shrink: 0;
}

.buy-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.5);
}

.buy-btn:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
}

.owned-items {
  text-align: center;
  padding: 10px;
  margin-bottom: 20px;
  color: #aaa;
  font-size: 14px;
}

.owned-badge {
  display: inline-block;
  padding: 4px 10px;
  margin: 0 5px;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  color: #FFD700;
  font-size: 13px;
}

.no-items {
  color: #666;
}

.continue-btn {
  width: 100%;
  padding: 15px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 30px;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: #fff;
  transition: all 0.3s;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.5);
}
</style>
