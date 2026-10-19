# scripts/legacy/ — 一次性数据修复脚本（已熔断，禁止在 main 执行）

> ⚠️ **本目录下的脚本全部是一次性数据修复脚本，已于 v1.4 加入熔断保护。**

## 为什么移到 legacy/

这些脚本会**重写 1MB 的 `1.2/data/exam-bank.json`**，且它们的修复目标大多已被后续门禁固化。
留着它们有三个具体危害（见 `docs/DEV-PLAN.md` T0-4 / P1-9）：

|脚本 | 危害 |
| --- | --- |
| `fix-phase-a-data.mjs` | **硬编码覆写 `PHY_2018_01` 的 options/answer/analysis**。若被重跑，会把 P0-1 已修好的答案键 `D` 改回 `A`，并还原旧选项顺序 —— 即**重新引入 161 道题的解析/答案矛盾** |
| `fix-no-options.mjs` | 补选项。若在 T0-8 已补齐主观题输入分支后重跑，会覆盖新逻辑的输入 |
| `fix-duplicate-question-ids.mjs` | 给重复 id 追加 `_dup2` 后缀。**改名而非删除**，这正是 P0-4「552 条副本」的成因；重跑会二次污染 |
| `enrich-short-analyses.mjs` | 批量生成模板化解析 —— 正是 P1-7「105 道模板解析」的成因 |
| `polish-analyses.mjs` | 解析润色。批量改写解析正文，可能破坏 P0-1 已修好的答案字母引用 |

## 熔断保护

所有脚本均已改造为：

```bash
node scripts/legacy/<name>.mjs            # dry-run：只打印将要做的改动，绝不写文件
node scripts/legacy/<name>.mjs --apply    # 真正写入
```

不带 `--apply` 时会打印 `[DRY-RUN]` 前缀的差异摘要并以 exit 0 退出。
同时统一了 `questions || exams` 的读取顺序（与 `validate-data.mjs` 对齐，消除 P1-10）。

## 如果确实需要重跑

1. 先 `git status` 确认工作区干净
2. 先跑 `npm run verify` 确认基线绿
3. 执行 `node scripts/legacy/<name>.mjs --apply`
4. **必须立刻重跑 `npm run verify`**，特别是：
   - `npm run check:data`（解析/答案冲突必须为 0）
   - `npm run check:content`（C10 会独立交叉验证同一件事）
5. 在提交信息中写明为何需要重跑，以及它是否会让某个门禁的基线计数上升

> 如果你只是想让 `npm run verify` 通过 —— 不要重跑这些脚本。门禁变红说明**发现了真实缺陷**，
> 应该修缺陷，而不是让脚本把它盖回去。