# 数据契约（DATA-SCHEMA）

改 `1.2/data/` 下任何 JSON 之前先读这一页。字段名拼错不会让 JSON 失效，
却会让对应功能**静默丢数据**，而页面不会报错——这类问题靠肉眼 diff 很难发现。

## 1. 数据文件地图

| 路径 | 作用 | 体量 |
| --- | --- | --- |
| `1.2/data/exam/index.json` | 题库清单：总题数、六科分类、年份范围 | ~1.7 KB |
| `1.2/data/exam/{subject}.json` | 六科分文件题库（按科懒加载） | 单科 180–220 题 |
| `1.2/data/{subject}/knowledge.json` | 知识点树：章节 → 专题 | 单科 40–60 专题 |
| `1.2/data/cross-subject.json` | 跨学科关联 | — |
| `1.2/data/knowledgePoints-thesaurus.json` | 考点同义词表（搜索/归因用） | — |
| `1.2/data/schedules/*.json` | 作息表（受 `check:schedule` 校验） | — |

## 2. 题库字段契约

`exam/{subject}.json` 的 `questions[]` 每项：

| 字段 | 必填 | 类型 | 说明 |
| --- | --- | --- | --- |
| `id` | ✅ | string | 全局唯一，形如 `PHY_2018_01` |
| `year` | ✅ | number | 2018–2026 |
| `type` | ✅ | string | 选择题 / 填空题 / 解答题 等 |
| `difficulty` | ✅ | string | `easy` / `medium` / `hard` |
| `points` | ✅ | number | 分值 |
| `category` | ✅ | string | 必须属于该科 `categories` 数组 |
| `question` | ✅ | string | 题干，可含 `\n` |
| `answer` | ✅ | string \| string[] | 选择题为选项字母；答案域受校验 |
| `analysis` | ✅ | string | 解析。含选项字母引用时会校验是否与 answer 冲突 |
| `knowledgePoints` | ⭕ | string[] | 考点名数组，用于错题归因与搜索 |
| `options` | ⭕ | string[] | 选择题必填，2–6 项 |
| `passage` | ⭕ | string | 语文/英语的阅读材料 |

**字段名是硬契约**。写中文键（如 `知识要点`）不会被 JSON 拒绝，但
`knowledgePoints` 就变成 undefined：该题的考点关联、错题归因、搜索索引
全部落空。`scripts/validate-data.mjs` 现在会对白名单外的字段报 `未知字段` 警告。

## 3. 知识点结构

```jsonc
// data/{subject}/knowledge.json
{
  "subject": "physics",
  "chapters": [
    { "id": "mechanics", "name": "力学", "topics": [ /* 专题 */ ] }
  ],
  "experiments": [],
  "testPapers": []
}
```

## 4. 改完数据必须跑

```bash
npm run check:data      # 题库/知识点结构与质检（含未知字段守卫）
npm run verify          # 全套 13 道门禁 + 单测 + 冒烟
```

改完还要注意两件事：

1. **`1.2/sw.js` 的 `CACHE_NAME` 必须递增**，否则存量用户读到的是旧缓存。
   `check:version` 会校验格式与头注释一致。
2. **安卓资产副本**：仓库不再入库存副本，`build-apk.sh` 第 0 步从 `1.2/` 同步；
   `check:asset-sync` 会做同步演练比对，防止 APK 内容陈旧。

## 5. 已知陷阱

| 陷阱 | 后果 | 防线 |
| --- | --- | --- |
| 中文/错拼字段名 | 字段静默失效，功能缺数据 | `check:data` 未知字段守卫 |
| 选择题 answer 不在选项域 | 判分永远错 | `check:data` 答案域校验 |
| 改数据不升 `CACHE_NAME` | 用户看到旧题 | `check:version` |
| 改 `1.2/` 忘了同步安卓 | APK 内容陈旧 | `check:asset-sync` 演练 |
| 页内锚点指向已合并的 section | 点击不滚动、控制台无报错 | `check:anchors` |
| 跨页 `?goto=` 用了已改名的路由 | 打开停在首页 | `check:anchors` |
