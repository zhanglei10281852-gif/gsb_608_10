import {
  HOOK,
  MINER,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  getSwingSpeed,
} from "./config.js";

export const HookState = {
  SWINGING: "swinging",
  EXTENDING: "extending",
  RETRACTING: "retracting",
};

export class Hook {
  constructor(level = 1) {
    this.anchorX = MINER.x;
    this.anchorY = MINER.y + 30;
    this.angle = 0;
    this.angularVelocity = getSwingSpeed(level);
    this.swingRange = HOOK.swingRange;
    this.length = HOOK.baseLength;
    this.baseLength = HOOK.baseLength;
    this.state = HookState.SWINGING;
    this.hookSize = HOOK.hookSize;
    this.caughtMineral = null;
    this.strengthBonus = 1;
    this.dynamites = 0;
    this.level = level;
  }

  setLevel(level) {
    this.level = level;
    this.angularVelocity = getSwingSpeed(level);
  }

  reset() {
    this.angle = 0;
    this.length = this.baseLength;
    this.state = HookState.SWINGING;
    this.caughtMineral = null;
  }

  get hookX() {
    return this.anchorX + Math.sin(this.angle) * this.length;
  }

  get hookY() {
    return this.anchorY + Math.cos(this.angle) * this.length;
  }

  launch() {
    if (this.state === HookState.SWINGING) {
      this.state = HookState.EXTENDING;
      return true;
    }
    return false;
  }

  useDynamite() {
    if (
      this.dynamites > 0 &&
      this.state === HookState.RETRACTING &&
      this.caughtMineral
    ) {
      if (this.caughtMineral.shape === "stone") {
        this.dynamites--;
        this.caughtMineral.removed = true;
        const mineral = this.caughtMineral;
        this.caughtMineral = null;
        return mineral;
      }
    }
    return null;
  }

  update(deltaTime, minerals) {
    switch (this.state) {
      case HookState.SWINGING:
        this.updateSwinging(deltaTime);
        return null;
      case HookState.EXTENDING:
        return this.updateExtending(deltaTime, minerals);
      case HookState.RETRACTING:
        return this.updateRetracting(deltaTime);
    }
  }

  updateSwinging(deltaTime) {
    this.angle += this.angularVelocity * deltaTime;

    if (this.angle > this.swingRange) {
      this.angle = this.swingRange;
      this.angularVelocity = -Math.abs(this.angularVelocity);
    } else if (this.angle < -this.swingRange) {
      this.angle = -this.swingRange;
      this.angularVelocity = Math.abs(this.angularVelocity);
    }
  }

  updateExtending(deltaTime, minerals) {
    const hx = this.hookX;
    const hy = this.hookY;

    for (const mineral of minerals) {
      if (mineral.caught || mineral.removed) continue;

      const dx = hx - mineral.x;
      const dy = hy - mineral.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mineral.radius + this.hookSize) {
        this.caughtMineral = mineral;
        mineral.caught = true;
        this.state = HookState.RETRACTING;
        return "caught";
      }
    }

    this.length += HOOK.extendSpeed * deltaTime;

    if (hx < 0 || hx > CANVAS_WIDTH || hy > CANVAS_HEIGHT) {
      this.state = HookState.RETRACTING;
      return "miss";
    }

    return null;
  }

  updateRetracting(deltaTime) {
    let retractSpeed = HOOK.retractBaseSpeed * this.strengthBonus;

    if (this.caughtMineral) {
      retractSpeed /= this.caughtMineral.weight * 0.08 + 0.5;
    }

    this.length -= retractSpeed * deltaTime;

    if (this.caughtMineral) {
      this.caughtMineral.x = this.hookX;
      this.caughtMineral.y = this.hookY;
    }

    if (this.length <= this.baseLength) {
      this.length = this.baseLength;
      const caught = this.caughtMineral;
      this.caughtMineral = null;
      this.state = HookState.SWINGING;
      return caught;
    }

    return null;
  }

  draw(ctx, minerShaking = false) {
    const hx = this.hookX;
    const hy = this.hookY;

    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.anchorX, this.anchorY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(-this.angle);

    ctx.fillStyle = "#C0C0C0";
    ctx.strokeStyle = "#808080";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, this.hookSize * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, this.hookSize * 0.3);
    ctx.quadraticCurveTo(
      this.hookSize * 0.8,
      this.hookSize * 0.5,
      this.hookSize,
      this.hookSize * 1.2,
    );
    ctx.quadraticCurveTo(
      this.hookSize * 0.7,
      this.hookSize * 0.8,
      this.hookSize * 0.3,
      this.hookSize * 0.5,
    );
    ctx.closePath();
    ctx.fillStyle = "#A9A9A9";
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, this.hookSize * 0.3);
    ctx.quadraticCurveTo(
      -this.hookSize * 0.8,
      this.hookSize * 0.5,
      -this.hookSize,
      this.hookSize * 1.2,
    );
    ctx.quadraticCurveTo(
      -this.hookSize * 0.7,
      this.hookSize * 0.8,
      -this.hookSize * 0.3,
      this.hookSize * 0.5,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  isHeavyLoad() {
    return this.caughtMineral && this.caughtMineral.weight >= 3;
  }
}
