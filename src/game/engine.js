import {
  MINER,
  GROUND_Y,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GAME,
  getLevelTarget,
} from "./config.js";
import { Hook, HookState } from "./hook.js";
import { generateMinerals } from "./mineral.js";
import { soundManager } from "./sound.js";

export const GameState = {
  MENU: "menu",
  PLAYING: "playing",
  PAUSED: "paused",
  SHOP: "shop",
  GAME_OVER: "gameOver",
  LEVEL_COMPLETE: "levelComplete",
};

export class GameEngine {
  constructor() {
    this.state = GameState.MENU;
    this.level = 1;
    this.score = 0;
    this.totalScore = 0;
    this.timeLeft = GAME.timeLimit;
    this.targetScore = getLevelTarget(1);

    this.hook = new Hook(1);
    this.minerals = [];
    this.lastTime = 0;
    this.animationId = null;
    this.minerShakeTime = 0;

    this.items = {
      dynamite: 0,
      strongGlove: false,
      luckyClover: false,
      energyDrink: 0,
    };

    this.floatingTexts = [];
  }

  startGame() {
    this.level = 1;
    this.score = 0;
    this.totalScore = 0;
    this.targetScore = getLevelTarget(1);
    this.items = {
      dynamite: 0,
      strongGlove: false,
      luckyClover: false,
      energyDrink: 0,
    };
    this.startLevel();
  }

  startLevel() {
    this.state = GameState.PLAYING;
    this.timeLeft = GAME.timeLimit;
    this.score = 0;
    this.targetScore = getLevelTarget(this.level);

    this.hook = new Hook(this.level);

    if (this.items.strongGlove) {
      this.hook.strengthBonus = 1.3;
    }

    this.hook.dynamites = this.items.dynamite;

    if (this.items.energyDrink > 0) {
      this.timeLeft += this.items.energyDrink * 15;
      this.items.energyDrink = 0;
    }

    this.minerals = generateMinerals(this.level, this.items.luckyClover);
    this.floatingTexts = [];

    this.items.luckyClover = false;
  }

  addFloatingText(x, y, text, color = "#FFD700") {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -2,
      life: 1.5,
    });
  }

  update(deltaTime) {
    if (this.state !== GameState.PLAYING) return;

    this.timeLeft -= deltaTime;

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.checkLevelEnd();
      return;
    }

    const hookResult = this.hook.update(deltaTime, this.minerals);

    if (hookResult === "caught") {
      soundManager.playGrab();
      if (this.hook.isHeavyLoad()) {
        this.minerShakeTime = 0.1;
      }
    } else if (hookResult && hookResult !== "miss") {
      this.collectMineral(hookResult);
    }

    if (this.minerShakeTime > 0) {
      this.minerShakeTime -= deltaTime;
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= deltaTime;
      ft.alpha = Math.max(0, ft.life / 1.5);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  collectMineral(mineral) {
    if (!mineral || mineral.removed) return;

    const value = mineral.value;
    this.score += value;
    this.totalScore += value;

    if (mineral.type === "diamond") {
      soundManager.playDiamond();
    } else if (value > 0) {
      soundManager.playGold();
    }

    const text = value >= 0 ? `+${value}` : `${value}`;
    const color = value >= 0 ? "#FFD700" : "#FF4444";
    this.addFloatingText(mineral.x, mineral.y, text, color);

    mineral.removed = true;

    if (this.score >= this.targetScore) {
      this.levelComplete();
    }
  }

  checkLevelEnd() {
    if (this.totalScore >= this.targetScore) {
      this.levelComplete();
    } else {
      this.gameOver();
    }
  }

  levelComplete() {
    this.state = GameState.LEVEL_COMPLETE;
    soundManager.playLevelUp();
  }

  gameOver() {
    this.state = GameState.GAME_OVER;
    soundManager.playGameOver();
  }

  goToShop() {
    this.state = GameState.SHOP;
  }

  buyItem(itemType, price) {
    if (this.totalScore < price) return false;

    this.score -= price;

    switch (itemType) {
      case "dynamite":
        this.items.dynamite++;
        break;
      case "strongGlove":
        this.items.strongGlove = true;
        break;
      case "luckyClover":
        this.items.luckyClover = true;
        break;
      case "energyDrink":
        this.items.energyDrink++;
        break;
    }

    soundManager.playClick();
    return true;
  }

  nextLevel() {
    this.level++;
    this.startLevel();
  }

  useDynamite() {
    const result = this.hook.useDynamite();
    if (result) {
      soundManager.playBomb();
      this.items.dynamite = this.hook.dynamites;
      this.addFloatingText(result.x, result.y, "💥", "#FF6600");
    }
    return result;
  }

  launchHook() {
    if (this.state === GameState.PLAYING) {
      if (this.hook.launch()) {
        soundManager.playClick();
      }
    }
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  draw(ctx) {
    this.drawBackground(ctx);
    this.drawGround(ctx);

    for (const mineral of this.minerals) {
      mineral.draw(ctx);
    }

    this.drawMiner(ctx);
    this.hook.draw(ctx);

    this.drawFloatingTexts(ctx);

    if (this.minerShakeTime > 0 && this.hook.caughtMineral) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.globalAlpha = 1;
    }
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    gradient.addColorStop(0, "#87CEEB");
    gradient.addColorStop(1, "#B0E0E6");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    ctx.fillStyle = "#FFFFFF";
    this.drawCloud(ctx, 100, 50, 1);
    this.drawCloud(ctx, 400, 30, 0.8);
    this.drawCloud(ctx, 700, 60, 1.2);
  }

  drawCloud(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.arc(25, -5, 20, 0, Math.PI * 2);
    ctx.arc(50, 0, 25, 0, Math.PI * 2);
    ctx.arc(25, 10, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawGround(ctx) {
    const gradient = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#8B4513");
    gradient.addColorStop(0.1, "#A0522D");
    gradient.addColorStop(0.5, "#654321");
    gradient.addColorStop(1, "#3D2914");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    ctx.fillStyle = "#228B22";
    ctx.fillRect(0, GROUND_Y - 10, CANVAS_WIDTH, 15);

    ctx.fillStyle = "#32CD32";
    for (let i = 0; i < CANVAS_WIDTH; i += 8) {
      const height = 5 + Math.sin(i * 0.3) * 3;
      ctx.fillRect(i, GROUND_Y - 10 - height, 4, height);
    }
  }

  drawMiner(ctx) {
    const mx = MINER.x;
    const my = MINER.y;
    const shakeOffset = this.minerShakeTime > 0 ? (Math.random() - 0.5) * 4 : 0;

    ctx.save();
    ctx.translate(mx + shakeOffset, my);

    ctx.fillStyle = "#4169E1";
    ctx.fillRect(-20, 15, 40, 40);

    ctx.fillStyle = "#FFDAB9";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#DAA520";
    ctx.beginPath();
    ctx.ellipse(0, -15, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-15, -25, 30, 12);

    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(-7, -2, 3, 0, Math.PI * 2);
    ctx.arc(7, -2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (this.hook.caughtMineral && this.hook.isHeavyLoad()) {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(10, 10);
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 5, 5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }

    ctx.fillStyle = "#FFDAB9";
    ctx.fillRect(-30, 18, 12, 25);
    ctx.fillRect(18, 18, 12, 25);

    ctx.fillStyle = "#8B4513";
    ctx.fillRect(-18, 52, 15, 20);
    ctx.fillRect(3, 52, 15, 20);

    ctx.restore();
  }

  drawFloatingTexts(ctx) {
    ctx.font = "bold 20px Microsoft YaHei";
    ctx.textAlign = "center";

    for (const ft of this.floatingTexts) {
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;
  }
}
