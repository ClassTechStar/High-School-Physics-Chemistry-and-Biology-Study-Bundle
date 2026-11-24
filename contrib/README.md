# 贡献题目（Community Contributions）

本项目欢迎补充题目、修正解析、报告错题。目标是把"加题 = 提 PR"的门槛降到
"填一份 JSON + 跑一条命令"。

## 目录约定

```
contrib/
├── README.md                      本文件
├── schema/question.schema.json    单题 JSON Schema（字段与约束）
└── submissions/                   投稿目录：一个文件一道题（或一组题）
    └── example-physics-001.json   示例（可直接复制改名）
```

## 投稿流程

1. 复制 `contrib/submissions/example-physics-001.json`，改名为
   `<学科>-<年份>-<序号>.json`（如 `physics-2024-017.json`）。
2. 按 Schema 填写题目。必填字段：`id`、`subject`、`year`、`type`、
   `question`、`answer`；选择题另需 `options`（≥2 项）与 `analysis`。
3. 本地校验：

   ```bash
   node scripts/validate-contrib.mjs
   ```

   脚本会做三层检查：JSON Schema 结构 → 与现有 1,198 题的 **id / 题干去重** →
   答案与选项域一致性。全部通过才允许合并。
4. 提 PR（或 Issue 附 JSON）。维护者合并后由 `scripts/merge-contrib.mjs`
   写入 `1.2/data/exam/{subject}.json` 并重跑全量门禁。

## 内容要求

- **解析要有实质内容**：写清"为什么"，不要只复述题干或报答案字母
  （`check:content` 会把模板化解析判红）。
- **不要放草稿标记**：`analysis` 里禁止出现「修正后」「TODO」「待补充」。
- **答案与解析必须自洽**：解析里提到的选项字母必须与 `answer` 一致
  （`check:data` 会交叉核对）。
- **版权**：只提交你自行整理或已获授权的题目；题目原文版权归原命题机构。
  提交即表示同意以 **ODbL 1.0** 发布你贡献的编排与元数据
  （见 [`../1.2/data/DATA-LICENSE`](../1.2/data/DATA-LICENSE)）。

## 字段速查

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✓ | 全局唯一，建议 `<学科前缀>_<年份>_<序号>` |
| `subject` | ✓ | `physics` / `chemistry` / `biology` / `math` / `chinese` / `english` |
| `year` | ✓ | 2018–2026 的整数 |
| `type` | ✓ | 题型文案（选择题 / 计算题 / 作文题 …） |
| `question` | ✓ | 题干；英语阅读题可另带 `passage` |
| `options` | 选择题必填 | 字符串数组，≥2 项 |
| `answer` | ✓ | 选择题填选项字母；主观题填参考答案文本 |
| `analysis` | 强烈建议 | 解析正文 |
| `knowledgePoints` | 建议 | 知识点数组，供错题归因与学习路径 |
| `difficulty` | 建议 | `easy` / `medium` / `hard` |
| `category` | 建议 | 章节/板块名 |
| `points` | 建议 | 分值数字 |
