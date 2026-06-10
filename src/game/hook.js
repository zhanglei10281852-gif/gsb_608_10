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
    // Sweep the hook along the rope by 'extendSpeed * deltaTime' this tick.
    // Use a segment-vs-circle check (instead of point-vs-circle at the new
    // position) so fast hooks / small targets never tunnel through.
    const oldLength = this.length;
    const newLength = oldLength + HOOK.extendSpeed * deltaTime;
    const sa = Math.sin(this.angle);
    const ca = Math.cos(this.angle);
    const x0 = this.anchorX + sa * oldLength;
    const y0 = this.anchorY + ca * oldLength;
    const x1 = this.anchorX + sa * newLength;
    const y1 = this.anchorY + ca * newLength;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const segLen = Math.sqrt(dx * dx + dy * dy);

    let firstHit = null;
    let firstEntry = Infinity;

    if (segLen > 0) {
      const ux = dx / segLen;
      const uy = dy / segLen;
      for (const mineral of minerals) {
        if (mineral.caught || mineral.removed) continue;
        const r = mineral.radius + this.hookSize;
        const px = mineral.x - x0;
        const py = mineral.y - y0;
        const t = px * ux + py * uy; // projection along segment direction
        const perpX = px - t * ux;
        const perpY = py - t * uy;
        const perp2 = perpX * perpX + perpY * perpY;
        if (perp2 > r * r) continue; // ray never gets close enough
        const back = Math.sqrt(r * r - perp2);
        let entry = t - back;
        if (entry > segLen) continue; // contact happens after this tick
        if (entry < 0) entry = 0; // already overlapping at tick start
        if (entry < firstEntry) {
          firstEntry = entry;
          firstHit = mineral;
        }
      }
    } else {
      // segLen == 0: fall back to point check at current position
      for (const mineral of minerals) {
        if (mineral.caught || mineral.removed) continue;
        const ddx = x0 - mineral.x;
        const ddy = y0 - mineral.y;
        const r = mineral.radius + this.hookSize;
        if (ddx * ddx + ddy * ddy <= r * r) {
          firstHit = mineral;
          firstEntry = 0;
          break;
        }
      }
    }

    if (firstHit) {
      // Snap hook length to the contact point so the visual matches the catch.
      this.length = oldLength + firstEntry;
      this.caughtMineral = firstHit;
      firstHit.caught = true;
      this.state = HookState.RETRACTING;
      return "caught";
    }

    this.length = newLength;
    const hx = this.hookX;
    const hy = this.hookY;
    if (hx < 0 || hx > CANVAS_WIDTH || hy > CANVAS_HEIGHT) {
      this.state = HookState.RETRACTING;
      return "miss";
    }

    return null;
  }

  updateRetracting(deltaTime) {
    let retractSpeed = HOOK.retractBaseSpeed * this.strengthBonus;

    if (this.caughtMineral) {
      // Heavier loads must retract noticeably slower than light ones.
      // Speed is inversely proportional to weight; very light items (e.g.
      // diamonds, weight < 1) are clamped to the base speed so they don't
      // come back faster than empty.
      retractSpeed /= Math.max(1, this.caughtMineral.weight);
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
