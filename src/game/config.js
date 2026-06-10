export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 600;

export const GROUND_Y = 180;

export const MINER = {
  x: CANVAS_WIDTH / 2,
  y: 80,
  width: 60,
  height: 70,
};

export const HOOK = {
  baseLength: 30,
  extendSpeed: 500,
  retractBaseSpeed: 400,
  swingSpeed: 2.5,
  swingRange: Math.PI / 2.5,
  hookSize: 12,
};

export const GAME = {
  timeLimit: 60,
  objectMinCount: 15,
  objectMaxCount: 25,
};

export const MINERAL_TYPES = {
  smallGold: {
    name: "小金块",
    value: 100,
    weight: 1,
    radius: 15,
    color: "#FFD700",
    shadowColor: "#DAA520",
    rarity: 25,
    shape: "gold",
  },
  bigGold: {
    name: "大金块",
    value: 500,
    weight: 3,
    radius: 28,
    color: "#FFD700",
    shadowColor: "#DAA520",
    rarity: 10,
    shape: "gold",
  },
  smallStone: {
    name: "小石头",
    value: 20,
    weight: 2,
    radius: 18,
    color: "#808080",
    shadowColor: "#5A5A5A",
    rarity: 20,
    shape: "stone",
  },
  bigStone: {
    name: "大石头",
    value: 50,
    weight: 5,
    radius: 35,
    color: "#696969",
    shadowColor: "#4A4A4A",
    rarity: 12,
    shape: "stone",
  },
  diamond: {
    name: "钻石",
    value: 800,
    weight: 0.5,
    radius: 12,
    color: "#00CED1",
    shadowColor: "#008B8B",
    rarity: 3,
    shape: "diamond",
  },
  treasureChest: {
    name: "宝箱",
    valueMin: 50,
    valueMax: 300,
    weight: 2.5,
    radius: 22,
    color: "#8B4513",
    shadowColor: "#654321",
    rarity: 8,
    shape: "chest",
  },
  rat: {
    name: "老鼠",
    value: 10,
    weight: 0.8,
    radius: 16,
    color: "#8B7355",
    shadowColor: "#5C4A3A",
    rarity: 10,
    shape: "rat",
  },
  skull: {
    name: "骷髅头",
    value: -50,
    weight: 1,
    radius: 20,
    color: "#F5F5DC",
    shadowColor: "#D2D2B4",
    rarity: 5,
    shape: "skull",
  },
};

export const ITEM_TYPES = {
  dynamite: {
    name: "炸药",
    description: "下一关可以炸掉抓上来的不想要的石头",
    price: 150,
    icon: "💣",
  },
  strongGlove: {
    name: "强力手套",
    description: "收回速度提升30%",
    price: 250,
    icon: "🧤",
  },
  luckyClover: {
    name: "幸运三叶草",
    description: "钻石出现概率提升",
    price: 300,
    icon: "🍀",
  },
  energyDrink: {
    name: "力量饮料",
    description: "下一关增加15秒游戏时间",
    price: 200,
    icon: "🥤",
  },
};

export function getLevelTarget(level) {
  return Math.floor(650 + (level - 1) * 450 * Math.pow(1.15, level - 1));
}

export function getSwingSpeed(level) {
  return HOOK.swingSpeed + (level - 1) * 0.15;
}

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
