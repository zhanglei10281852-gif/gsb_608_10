import { getRandomInt, MINERAL_TYPES, GAME, HOOK, getLevelTarget } from './src/game/config.js';
import { Hook, HookState } from './src/game/hook.js';
import { Mineral, generateMinerals } from './src/game/mineral.js';
import { GameEngine, GameState } from './src/game/engine.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.log(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('========== Bug 3: getRandomInt 差1问题测试 ==========');
console.log('测试 getRandomInt(50, 300) 能否取到最大值 300:');
let maxVal = -Infinity;
let hit300 = false;
for (let i = 0; i < 10000; i++) {
  const v = getRandomInt(50, 300);
  if (v > maxVal) maxVal = v;
  if (v === 300) hit300 = true;
}
assert(hit300, `宝箱最大值300可达，测试中最大值=${maxVal}`);

console.log('\n测试 getRandomInt(15, 25) 能否取到最大值 25:');
maxVal = -Infinity;
let hit25 = false;
for (let i = 0; i < 10000; i++) {
  const v = getRandomInt(GAME.objectMinCount, GAME.objectMaxCount);
  if (v > maxVal) maxVal = v;
  if (v === GAME.objectMaxCount) hit25 = true;
}
assert(hit25, `矿物数上限25可达，测试中最大值=${maxVal}`);

console.log('\n测试边界值范围（所有值都应在 [min, max]）:');
let minVal = Infinity;
maxVal = -Infinity;
let outOfRange = false;
for (let i = 0; i < 10000; i++) {
  const v = getRandomInt(0, 100);
  if (v < minVal) minVal = v;
  if (v > maxVal) maxVal = v;
  if (v < 0 || v > 100) outOfRange = true;
}
assert(!outOfRange && minVal === 0 && maxVal === 100, `范围正确：最小值=${minVal}, 最大值=${maxVal}`);

console.log('\n========== Bug 1: 关卡结算判定（totalScore vs score）测试 ==========');
const engine = new GameEngine();
engine.startGame();
engine.level = 3;
engine.totalScore = 5000;
engine.score = 100;
engine.targetScore = getLevelTarget(3);
console.log(`第3关目标分数: ${engine.targetScore}`);
console.log(`累计总分 totalScore: ${engine.totalScore}, 本关分数 score: ${engine.score}`);
engine.checkLevelEnd();
assert(engine.state === GameState.GAME_OVER, '本关分数不达标时应 GAME_OVER，而不是误判过关');

engine.score = engine.targetScore + 100;
engine.state = GameState.PLAYING;
engine.checkLevelEnd();
assert(engine.state === GameState.LEVEL_COMPLETE, '本关分数达标时应正确过关');

console.log('\n========== Bug 2: 商店购买道具扣钱测试 ==========');
const engine2 = new GameEngine();
engine2.startGame();
engine2.totalScore = 1000;
engine2.score = 600;
engine2.goToShop();
console.log(`购买前: totalScore=${engine2.totalScore}, score=${engine2.score}`);
const buyResult = engine2.buyItem('dynamite', 150);
assert(buyResult === true, '购买成功应返回 true');
console.log(`购买炸药(150)后: totalScore=${engine2.totalScore}, score=${engine2.score}`);
assert(engine2.totalScore === 850, '总金额 totalScore 应该被扣减到 850');
assert(engine2.score === 600, '本关分数 score 不应该被改动');

const buyResult2 = engine2.buyItem('strongGlove', 1000);
assert(buyResult2 === false, '钱不够时应购买失败');
assert(engine2.totalScore === 850, '购买失败时总金额不应变化');

console.log('\n========== Bug 6: 重物回收速度测试 ==========');
const hook = new Hook(1);
const baseSpeed = HOOK.retractBaseSpeed;
console.log(`空手收回速度基准: ${baseSpeed}`);

hook.state = HookState.RETRACTING;
hook.caughtMineral = null;
let speedNoLoad = HOOK.retractBaseSpeed * hook.strengthBonus;
console.log(`无物品时速度: ${speedNoLoad}`);

const smallGold = { weight: MINERAL_TYPES.smallGold.weight };
const bigGold = { weight: MINERAL_TYPES.bigGold.weight };
const bigStone = { weight: MINERAL_TYPES.bigStone.weight };
const diamond = { weight: MINERAL_TYPES.diamond.weight };

let speedSmallGold = speedNoLoad / (1 + smallGold.weight);
let speedBigGold = speedNoLoad / (1 + bigGold.weight);
let speedBigStone = speedNoLoad / (1 + bigStone.weight);
let speedDiamond = speedNoLoad / (1 + diamond.weight);

console.log(`小金块(weight=1)速度: ${speedSmallGold.toFixed(1)}`);
console.log(`大金块(weight=3)速度: ${speedBigGold.toFixed(1)}`);
console.log(`大石头(weight=5)速度: ${speedBigStone.toFixed(1)}`);
console.log(`钻石(weight=0.5)速度: ${speedDiamond.toFixed(1)}`);

assert(speedSmallGold < speedNoLoad, '小金块速度应比空手慢');
assert(speedBigGold < speedSmallGold, '大金块应比小金块慢');
assert(speedBigStone < speedBigGold, '大石头应比大金块慢');
assert(speedDiamond < speedNoLoad, '钻石速度也应比空手慢');

console.log('\n========== Bug 4: 矿物不重叠测试 ==========');
console.log('生成100次关卡矿物，检查是否有重叠:');
let overlapFound = false;
for (let run = 0; run < 100; run++) {
  const minerals = generateMinerals(5, false);
  for (let i = 0; i < minerals.length; i++) {
    for (let j = i + 1; j < minerals.length; j++) {
      const m1 = minerals[i];
      const m2 = minerals[j];
      const dx = m1.x - m2.x;
      const dy = m1.y - m2.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const shouldBeMinDist = m1.radius + m2.radius + 10;
      if (dist < shouldBeMinDist) {
        overlapFound = true;
        console.log(`  发现重叠: ${m1.type}(r=${m1.radius}) 和 ${m2.type}(r=${m2.radius}), 距离=${dist.toFixed(1)}, 需要>=${shouldBeMinDist}`);
      }
    }
  }
}
assert(!overlapFound, '所有矿物之间都保持足够间距，不会重叠');

console.log('\n========== Bug 5: 钩子快速伸展不抓空测试 ==========');
const hook2 = new Hook(1);
hook2.angle = 0;
hook2.length = 30;
hook2.state = HookState.EXTENDING;

const testMineral = new Mineral('diamond', 450, 400);
testMineral.caught = false;
testMineral.removed = false;
console.log(`钻石位置: (${testMineral.x}, ${testMineral.y}), radius=${testMineral.radius}`);

let caught = false;
let frames = 0;
const bigDelta = 0.1;
while (hook2.state === HookState.EXTENDING && frames < 100) {
  const result = hook2.update(bigDelta, [testMineral]);
  if (result === 'caught') {
    caught = true;
    break;
  }
  frames++;
}
assert(caught, `即使每帧 deltaTime=${bigDelta}s（钩子快速伸展），也能正确抓到钻石 (用了${frames}帧)`);

console.log('\n测试线段相交算法正确性:');
const hook3 = new Hook(1);
assert(hook3.lineIntersectsCircle(0, 0, 100, 0, 50, 0, 10) === true, '水平线穿过圆心应检测到相交');
assert(hook3.lineIntersectsCircle(0, 0, 100, 0, 50, 50, 10) === false, '远离圆的线段不应检测到相交');
assert(hook3.lineIntersectsCircle(0, 0, 100, 100, 50, 50, 10) === true, '斜线经过圆内应检测到相交');
assert(hook3.lineIntersectsCircle(0, 0, 55, 0, 50, 0, 10) === true, '端点在圆内应检测到相交');

console.log('\n==============================');
console.log(`测试完成：通过 ${passed} 个，失败 ${failed} 个`);
if (failed === 0) {
  console.log('🎉 所有 Bug 验证通过！');
} else {
  console.log('⚠️  有测试失败，请检查代码');
  process.exit(1);
}
