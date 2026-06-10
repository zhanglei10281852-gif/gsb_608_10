import { GameEngine, GameState } from "./src/game/engine.js";
import { Hook, HookState } from "./src/game/hook.js";
import { Mineral, generateMinerals } from "./src/game/mineral.js";
import {
  getRandomInt,
  MINERAL_TYPES,
  GAME,
  getLevelTarget,
  HOOK,
  CANVAS_HEIGHT,
  MINER,
} from "./src/game/config.js";

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
  } catch (e) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   ${e.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || "断言失败");
  }
}

console.log("=".repeat(60));
console.log("黄金矿工 Bug 复现测试");
console.log("=".repeat(60));

// ============================================================
// Bug 1: 关卡结算判定错误（没挖够目标分也算过关）
// ============================================================
console.log("\n--- Bug 1: 关卡结算判定 ---");

test("时间到但分数不够时应该 gameOver 而不是 levelComplete", () => {
  const engine = new GameEngine();
  engine.startGame();
  engine.level = 5;
  engine.score = 100;
  engine.totalScore = 5000;
  engine.targetScore = getLevelTarget(5);

  assert(
    engine.score < engine.targetScore,
    "本关分数应小于目标分（用于测试）",
  );
  assert(
    engine.totalScore >= engine.targetScore,
    "累计总分应大于目标分（用于测试）",
  );

  engine.checkLevelEnd();

  assert(
    engine.state === GameState.GAME_OVER,
    `本关分数(${engine.score}) < 目标(${engine.targetScore})时应该 GAME_OVER，但实际是 ${engine.state}`,
  );
});

// ============================================================
// Bug 2: 商店购买后总金额没扣
// ============================================================
console.log("\n--- Bug 2: 商店购买扣钱 ---");

test("购买道具应该扣 totalScore 而不是 score", () => {
  const engine = new GameEngine();
  engine.startGame();
  engine.score = 0;
  engine.totalScore = 1000;

  const success = engine.buyItem("dynamite", 150);

  assert(success, "购买应该成功");
  assert(
    engine.totalScore === 850,
    `totalScore 应该减少到 850，实际是 ${engine.totalScore}`,
  );
  assert(
    engine.score === 0,
    `本关分数 score 不应该变化，实际是 ${engine.score}`,
  );
});

test("下一关开始时 score 应该从 0 开始（不受商店影响）", () => {
  const engine = new GameEngine();
  engine.startGame();
  engine.score = 500;
  engine.totalScore = 1000;
  engine.buyItem("dynamite", 150);

  const prevScore = engine.score;
  engine.nextLevel();

  assert(
    engine.score === 0,
    `下一关开始时 score 应该重置为 0，实际是 ${engine.score}`,
  );
});

// ============================================================
// Bug 3: 随机数总是差一点
// ============================================================
console.log("\n--- Bug 3: 随机数范围 ---");

test("getRandomInt 应该能取到最大值（闭区间）", () => {
  const results = new Set();
  for (let i = 0; i < 10000; i++) {
    results.add(getRandomInt(1, 10));
  }

  assert(results.has(1), "应该包含最小值 1");
  assert(results.has(10), `应该包含最大值 10，但实际最大值是 ${Math.max(...results)}`);
});

test("宝箱 value 应该能取到 valueMax", () => {
  const chestType = MINERAL_TYPES.treasureChest;
  const values = new Set();

  for (let i = 0; i < 10000; i++) {
    const m = new Mineral("treasureChest", 100, 100);
    values.add(m.value);
  }

  assert(
    values.has(chestType.valueMax),
    `宝箱应该能开出最大值 ${chestType.valueMax}，但实际最大值是 ${Math.max(...values)}`,
  );
  assert(
    values.has(chestType.valueMin),
    `宝箱应该能开出最小值 ${chestType.valueMin}，但实际最小值是 ${Math.min(...values)}`,
  );
});

test("每关矿物数量应该能达到 objectMaxCount", () => {
  const counts = new Set();
  for (let i = 0; i < 200; i++) {
    const minerals = generateMinerals(1, false);
    counts.add(minerals.length);
  }

  const maxObserved = Math.max(...counts);
  assert(
    maxObserved === GAME.objectMaxCount,
    `矿物数量应该能达到 ${GAME.objectMaxCount}，但实际观察到的最大值是 ${maxObserved}`,
  );
});

// ============================================================
// Bug 4: 矿物重叠显示
// ============================================================
console.log("\n--- Bug 4: 矿物重叠检测 ---");

test("生成的矿物之间不应该重叠（考虑双方半径）", () => {
  let overlapCount = 0;
  const totalRuns = 50;

  for (let run = 0; run < totalRuns; run++) {
    const minerals = generateMinerals(5, false);

    for (let i = 0; i < minerals.length; i++) {
      for (let j = i + 1; j < minerals.length; j++) {
        const a = minerals[i];
        const b = minerals[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = a.radius + b.radius;

        if (dist < minDist) {
          overlapCount++;
        }
      }
    }
  }

  assert(
    overlapCount === 0,
    `发现 ${overlapCount} 对重叠矿物（在 ${totalRuns} 次生成中），应该为 0`,
  );
});

// ============================================================
// Bug 5: 钩子抓空（小目标、快速伸出时）
// ============================================================
console.log("\n--- Bug 5: 钩子碰撞检测 ---");

test("钩子快速移动时不应错过小目标（隧道效应测试）", () => {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  hook.length = 50;

  const diamond = new Mineral("diamond", MINER.x, 200);
  diamond.caught = false;
  diamond.removed = false;
  const minerals = [diamond];

  let caught = false;
  let steps = 0;
  const largeDelta = 0.05;

  while (hook.length < CANVAS_HEIGHT && steps < 100) {
    const result = hook.update(largeDelta, minerals);
    if (result === "caught") {
      caught = true;
      break;
    }
    steps++;
  }

  assert(
    caught,
    `钩子正对钻石上下落应该能抓住，但没抓住（移动了 ${steps} 步）`,
  );
});

test("钩子超出边界后应该正确检测并返回 miss（边界检测用移动后位置）", () => {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  const startLen = CANVAS_HEIGHT - (MINER.y + 30) - 20;
  hook.length = startLen;

  const startY = MINER.y + 30 + hook.length;
  assert(startY < CANVAS_HEIGHT, "初始钩子应该在画布内");

  const result = hook.update(0.1, []);

  const endY = MINER.y + 30 + hook.length;
  assert(endY > CANVAS_HEIGHT, "移动后钩子应该超出画布");
  assert(result === "miss", "超出边界应该返回 'miss'");
  assert(hook.state === HookState.RETRACTING, "超出边界后状态应为 RETRACTING");
});

// ============================================================
// Bug 6: 重物回收速度没变慢
// ============================================================
console.log("\n--- Bug 6: 重物回收速度 ---");

test("抓重物的回收速度应该比空手慢", () => {
  const hook1 = new Hook(1);
  hook1.state = HookState.RETRACTING;
  hook1.length = 200;
  hook1.caughtMineral = null;

  const hook2 = new Hook(1);
  hook2.state = HookState.RETRACTING;
  hook2.length = 200;
  hook2.caughtMineral = { weight: 5, shape: "stone" };

  const dt = 0.1;
  hook1.update(dt, []);
  hook2.update(dt, []);

  const dist1 = 200 - hook1.length;
  const dist2 = 200 - hook2.length;

  assert(
    dist2 < dist1,
    `抓重物(weight=5)的回收距离(${dist2.toFixed(2)})应该小于空手(${dist1.toFixed(2)})`,
  );
});

test("越重的东西回收应该越慢", () => {
  const weights = [0.5, 1, 3, 5];
  const speeds = [];

  for (const w of weights) {
    const hook = new Hook(1);
    hook.state = HookState.RETRACTING;
    hook.length = 500;
    hook.caughtMineral = { weight: w, shape: "stone" };

    const startLen = hook.length;
    hook.update(0.1, []);
    const speed = startLen - hook.length;
    speeds.push(speed);
  }

  for (let i = 1; i < speeds.length; i++) {
    assert(
      speeds[i] < speeds[i - 1],
      `重量 ${weights[i]} 的速度(${speeds[i].toFixed(2)})应该小于重量 ${weights[i - 1]} 的速度(${speeds[i - 1].toFixed(2)})`,
    );
  }
});

console.log("\n" + "=".repeat(60));
console.log("测试完成");
console.log("=".repeat(60));
