import {
  MINERAL_TYPES,
  getRandomInt,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  GAME,
} from "./config.js";

export class Mineral {
  constructor(type, x, y) {
    const typeData = MINERAL_TYPES[type];
    this.type = type;
    this.x = x;
    this.y = y;
    this.radius = typeData.radius;
    this.weight = typeData.weight;
    this.color = typeData.color;
    this.shadowColor = typeData.shadowColor;
    this.shape = typeData.shape;
    this.name = typeData.name;
    this.caught = false;
    this.removed = false;

    if (type === "treasureChest") {
      this.value = getRandomInt(typeData.valueMin, typeData.valueMax);
    } else {
      this.value = typeData.value;
    }
  }

  draw(ctx) {
    if (this.removed) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    switch (this.shape) {
      case "gold":
        this.drawGold(ctx);
        break;
      case "stone":
        this.drawStone(ctx);
        break;
      case "diamond":
        this.drawDiamond(ctx);
        break;
      case "chest":
        this.drawChest(ctx);
        break;
      case "rat":
        this.drawRat(ctx);
        break;
      case "skull":
        this.drawSkull(ctx);
        break;
      default:
        this.drawStone(ctx);
    }

    ctx.restore();
  }

  drawGold(ctx) {
    const r = this.radius;

    const gradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    gradient.addColorStop(0, "#FFF8DC");
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(1, this.shadowColor);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.3, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fill();
  }

  drawStone(ctx) {
    const r = this.radius;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const variation = 0.85 + Math.sin(i * 1.5) * 0.15;
      const x = Math.cos(angle) * r * variation;
      const y = Math.sin(angle) * r * variation;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();

    const gradient = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r);
    gradient.addColorStop(0, "#A0A0A0");
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.shadowColor);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = this.shadowColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  drawDiamond(ctx) {
    const r = this.radius;

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, -r * 0.2);
    ctx.lineTo(r * 0.5, r * 0.8);
    ctx.lineTo(-r * 0.5, r * 0.8);
    ctx.lineTo(-r * 0.8, -r * 0.2);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(-r, -r, r, r);
    gradient.addColorStop(0, "#E0FFFF");
    gradient.addColorStop(0.5, this.color);
    gradient.addColorStop(1, this.shadowColor);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.2, -r * 0.1);
    ctx.lineTo(0, r * 0.3);
    ctx.lineTo(r * 0.2, -r * 0.1);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fill();

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.8, -r * 0.2);
    ctx.moveTo(0, -r);
    ctx.lineTo(-r * 0.8, -r * 0.2);
    ctx.moveTo(-r * 0.5, r * 0.8);
    ctx.lineTo(r * 0.5, r * 0.8);
    ctx.stroke();
  }

  drawChest(ctx) {
    const w = this.radius * 1.8;
    const h = this.radius * 1.4;

    ctx.fillStyle = this.shadowColor;
    ctx.fillRect(-w / 2, -h / 2, w, h * 0.6);

    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(-w / 2, -h / 2 + h * 0.5);
    ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + w * 0.1, -h / 2);
    ctx.lineTo(w / 2 - w * 0.1, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + h * 0.5);
    ctx.lineTo(w / 2, h / 2);
    ctx.lineTo(-w / 2, h / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#DAA520";
    ctx.fillRect(-w * 0.08, -h * 0.1, w * 0.16, h * 0.4);

    ctx.fillStyle = "#B8860B";
    ctx.beginPath();
    ctx.arc(0, h * 0.1, w * 0.06, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#DAA520";
    ctx.fillRect(-w / 2, h * 0.05, w, h * 0.08);
    ctx.fillRect(-w * 0.25, -h / 2, w * 0.05, h * 0.55);
    ctx.fillRect(w * 0.2, -h / 2, w * 0.05, h * 0.55);
  }

  drawRat(ctx) {
    const r = this.radius;

    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(r * 0.7, -r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(r * 0.55, -r * 0.5, r * 0.15, 0, Math.PI * 2);
    ctx.arc(r * 0.85, -r * 0.5, r * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "#FFC0CB";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(r * 0.85, -r * 0.2, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(r * 1.05, -r * 0.1, r * 0.06, 0, Math.PI * 2);
    ctx.fillStyle = "#FF69B4";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-r * 0.9, 0);
    ctx.quadraticCurveTo(-r * 1.4, -r * 0.3, -r * 1.3, r * 0.2);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  drawSkull(ctx) {
    const r = this.radius;

    ctx.beginPath();
    ctx.arc(0, -r * 0.1, r * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.fillStyle = this.color;
    ctx.fillRect(-r * 0.6, r * 0.4, r * 1.2, r * 0.4);

    ctx.beginPath();
    ctx.arc(-r * 0.3, -r * 0.15, r * 0.2, 0, Math.PI * 2);
    ctx.arc(r * 0.3, -r * 0.15, r * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "#2F2F2F";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, r * 0.1);
    ctx.lineTo(-r * 0.1, r * 0.3);
    ctx.lineTo(r * 0.1, r * 0.3);
    ctx.closePath();
    ctx.fillStyle = "#2F2F2F";
    ctx.fill();

    ctx.strokeStyle = "#2F2F2F";
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.18, r * 0.45);
      ctx.lineTo(i * r * 0.18, r * 0.7);
      ctx.stroke();
    }
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
}

export function generateMinerals(level, hasLuckyClover = false) {
  const minerals = [];
  const count = getRandomInt(GAME.objectMinCount, GAME.objectMaxCount);

  const availableTypes = Object.keys(MINERAL_TYPES);

  for (let i = 0; i < count; i++) {
    const type = selectMineralType(level, hasLuckyClover);
    const typeData = MINERAL_TYPES[type];

    let x, y;
    let valid = false;
    let attempts = 0;

    while (!valid && attempts < 100) {
      x = getRandomInt(
        typeData.radius + 20,
        CANVAS_WIDTH - typeData.radius - 20,
      );
      y = getRandomInt(
        GROUND_Y + typeData.radius + 30,
        CANVAS_HEIGHT - typeData.radius - 20,
      );

      valid = true;
      for (const mineral of minerals) {
        const dx = x - mineral.x;
        const dy = y - mineral.y;
        const minDist = typeData.radius + mineral.radius;
        if (Math.sqrt(dx * dx + dy * dy) < minDist) {
          valid = false;
          break;
        }
      }
      attempts++;
    }

    if (valid) {
      minerals.push(new Mineral(type, x, y));
    }
  }

  return minerals;
}

function selectMineralType(level, hasLuckyClover) {
  const types = Object.keys(MINERAL_TYPES);
  const totalRarity = types.reduce((sum, type) => {
    let rarity = MINERAL_TYPES[type].rarity;
    if (type === "diamond" && hasLuckyClover) {
      rarity *= 3;
    }
    return sum + rarity;
  }, 0);

  let random = Math.random() * totalRarity;

  for (const type of types) {
    let rarity = MINERAL_TYPES[type].rarity;
    if (type === "diamond" && hasLuckyClover) {
      rarity *= 3;
    }
    random -= rarity;
    if (random <= 0) {
      return type;
    }
  }

  return "smallStone";
}
