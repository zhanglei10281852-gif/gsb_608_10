import { Hook, HookState } from "./src/game/hook.js";
import { Mineral } from "./src/game/mineral.js";
import { MINER, HOOK, CANVAS_HEIGHT } from "./src/game/config.js";

console.log("=== Bug 5 详细测试：钩子抓空 ===");

function testTunneling(name, startY, diamondX, diamondY, deltaTime) {
  const hook = new Hook(1);
  hook.angle = 0;
  hook.state = HookState.EXTENDING;
  hook.length = startY - (MINER.y + 30);

  const diamond = new Mineral("diamond", diamondX, diamondY);
  diamond.caught = false;
  diamond.removed = false;
  const minerals = [diamond];

  let caught = false;
  let steps = 0;
  let maxSteps = 200;

  while (hook.length < CANVAS_HEIGHT && steps < maxSteps && hook.state === HookState.EXTENDING) {
    const result = hook.update(deltaTime, minerals);
    if (result === "caught") {
      caught = true;
      break;
    }
    steps++;
  }

  const status = caught ? "✅ 抓到了" : "❌ 没抓到";
  console.log(`${status} - ${name}`);
  console.log(`   钻石位置: (${diamondX}, ${diamondY})`);
  console.log(`   初始钩子长度: ${hook.length.toFixed(0)} (测试开始时)`);
  console.log(`   每帧delta: ${deltaTime}s, 步长约: ${(HOOK.extendSpeed * deltaTime).toFixed(0)}px`);
  console.log(`   执行步数: ${steps}`);

  return caught;
}

console.log("\n--- 测试1: 正对钻石，正常帧率 (delta=0.016, ~60fps) ---");
testTunneling("正对+正常帧率", 50, MINER.x, 200, 0.016);

console.log("\n--- 测试2: 正对钻石，低帧率 (delta=0.1, ~10fps) ---");
testTunneling("正对+低帧率", 100, MINER.x, 200, 0.1);

console.log("\n--- 测试3: 正对钻石，极低帧率 (delta=0.2, ~5fps) ---");
testTunneling("正对+极低帧率", 50, MINER.x, 200, 0.2);

console.log("\n--- 测试4: 稍微偏移一点，正常帧率 ---");
testTunneling("偏移10px+正常帧率", 50, MINER.x + 10, 200, 0.016);

console.log("\n--- 测试5: 稍微偏移一点，低帧率 ---");
testTunneling("偏移10px+低帧率", 100, MINER.x + 10, 200, 0.1);

console.log("\n--- 测试6: 边界检测 - 移动后出界 ---");
const hook = new Hook(1);
hook.angle = 0;
hook.state = HookState.EXTENDING;
hook.length = CANVAS_HEIGHT - (MINER.y + 30) - 10;
const beforeLen = hook.length;
const result = hook.update(0.05, []);
console.log(`   更新前长度: ${beforeLen.toFixed(0)}`);
console.log(`   更新后长度: ${hook.length.toFixed(0)}`);
console.log(`   返回结果: ${result}`);
console.log(`   当前状态: ${hook.state}`);
console.log(`   钩子Y位置: ${(MINER.y + 30 + hook.length).toFixed(0)}`);
console.log(`   画布高度: ${CANVAS_HEIGHT}`);
console.log(`   是否应该出界: ${hook.length + MINER.y + 30 > CANVAS_HEIGHT ? "是" : "否"}`);
console.log(`   状态是否正确: ${hook.state === HookState.RETRACTING ? "✅" : "❌"}`);
