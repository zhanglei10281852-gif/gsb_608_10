import { Hook, HookState } from "./src/game/hook.js";
import { MINER, CANVAS_HEIGHT, CANVAS_WIDTH, HOOK } from "./src/game/config.js";

console.log("=== 边界检测验证 ===");

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
  } catch (e) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "断言失败");
}

test("移动后出界应该检测到并返回 miss", () => {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  const startLen = CANVAS_HEIGHT - (MINER.y + 30) - 20;
  hook.length = startLen;

  const startY = MINER.y + 30 + hook.length;
  assert(startY < CANVAS_HEIGHT, `初始钩子Y(${startY})应该在画布内`);

  const result = hook.update(0.1, []);

  const endY = MINER.y + 30 + hook.length;
  assert(endY > CANVAS_HEIGHT, `移动后钩子Y(${endY.toFixed(0)})应该超出画布`);
  assert(result === "miss", `应该返回 "miss"，实际是 "${result}"`);
  assert(hook.state === HookState.RETRACTING, `状态应该是 RETRACTING，实际是 ${hook.state}`);
});

test("初始已经出界也应该在第一步检测到", () => {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  hook.length = CANVAS_HEIGHT - (MINER.y + 30) + 50;

  const startY = MINER.y + 30 + hook.length;
  assert(startY > CANVAS_HEIGHT, `初始钩子Y(${startY})应该已超出画布`);

  const result = hook.update(0.01, []);

  assert(result === "miss", `应该返回 "miss"，实际是 "${result}"`);
  assert(hook.state === HookState.RETRACTING, `状态应该是 RETRACTING`);
});

test("正常范围内移动不会出界", () => {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  hook.length = 50;

  const result = hook.update(0.05, []);

  assert(result === null, `不应该返回任何结果，实际是 "${result}"`);
  assert(hook.state === HookState.EXTENDING, `状态应该还是 EXTENDING`);
});

test("左右边界也能正确检测", () => {
  const hook = new Hook(1);
  hook.angle = Math.PI / 2;
  hook.state = HookState.EXTENDING;
  hook.length = CANVAS_WIDTH - MINER.x - 20;

  const startX = MINER.x + Math.sin(hook.angle) * hook.length;
  assert(startX < CANVAS_WIDTH, `初始钩子X(${startX.toFixed(0)})应该在画布内`);

  const result = hook.update(0.1, []);

  assert(result === "miss", `超出右边界应该返回 "miss"`);
  assert(hook.state === HookState.RETRACTING, `状态应该是 RETRACTING`);
});

console.log("\n=== 验证完成 ===");
