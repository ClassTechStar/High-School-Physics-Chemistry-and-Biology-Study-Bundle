/**
 * legacy-guard.mjs — 一次性数据脚本的熔断保护
 *
 * 背景（DEV-PLAN ）：
 * 仓库里有一批一次性修复脚本会重写 1MB 的 exam-bank.json，且修复目标早已被门禁固化。
 * 其中 fix-phase-a-data.mjs 硬编码覆写 PHY_2018_01 的 options/answer/analysis ——
 * 重跑会把 已修好的答案键 D 改回 A，重新引入 161 道题的解析/答案矛盾。
 *
 * 用法：
 * import { guard } from './legacy-guard.mjs';
 * guard('fix-no-options.mjs'); // 不带 --apply 时直接 return，不写任何文件
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const BANK = join(ROOT, '1.2', 'data', 'exam-bank.json');

const BANNER = `
════════════════════════════════════════════════════════════════════════
 ⚠️  一次性数据脚本（已熔断）
════════════════════════════════════════════════════════════════════════
 这次运行是 **DRY-RUN**：不会写入任何文件。
 本目录下的脚本修复目标均已被 npm run verify 门禁固化，重跑可能把已修复的数据改回错误状态。
 详见 scripts/legacy/README.md。

 如果门禁变红，请修缺陷，而不是重跑本脚本把它盖回去。
 只有在你明确知道自己在做什么、且已确认 git 工作区干净时，才加 --apply。
════════════════════════════════════════════════════════════════════════
`;

/**
 * @param {string} scriptName
 * @param {{json?: boolean}} [opts] json=true 时以 JSON 摘要输出，便于人工比对
 * @returns {boolean} true = 允许继续执行；false = dry-run，应当立即 return
 */
export function guard(scriptName, opts = {}) {
  if (process.argv.includes('--apply')) {
    console.error(`[${scriptName}] --apply 已启用：将写入 ${BANK}`);
    return true;
  }

  console.error(BANNER);
  const bank = existsSync(BANK) ? readFileSync(BANK, 'utf8') : '';
  const sha = createHash('sha256').update(bank).digest('hex').slice(0, 16);
  const size = (bank.length / 1024).toFixed(0);
  console.error(`  目标文件 : 1.2/data/exam-bank.json (${size}KB, sha256:${sha})`);
  console.error(`  当前题量 : ${countQuestions(bank)}`);
  console.error('');
  console.error('  加 --apply 生效，例如：');
  console.error(`    node scripts/legacy/${scriptName} --apply`);
  console.error('');
  return false;
}

function countQuestions(bank) {
  if (!bank) return 'N/A';
  try {
    const d = JSON.parse(bank);
    let n = 0;
    for (const k of Object.keys(d)) {
      if (k === 'meta') continue;
      const list = d[k] && (d[k].questions || d[k].exams);
      if (Array.isArray(list)) n += list.length;
    }
    return `${n} 题`;
  } catch {
    return '解析失败';
  }
}