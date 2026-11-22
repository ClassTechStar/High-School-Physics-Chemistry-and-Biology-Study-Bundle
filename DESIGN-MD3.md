# MD3 设计规范（本项目强制）

> 依据：Material Design 3 规范 + `C:/Users/18948/Documents/GitHub/mochi-compose` 的设计体系。
> 令牌由 `scripts/check-md3.mjs` 强制校验，不合规的提交会被 CI 拦下。

## 0. 一句话规则

**新建页面/组件一律用 `--md3-*` 令牌和 `.md3-*` 组件类，不得硬编码颜色、圆角、字号。**

现有页面（`index.html` / `promo.html` / `presentation.html` / `showcase.html`）保留各自的原生设计，
不在本规范强制范围内——它们用的是 `tokens.css` 的 `--primary` 一套，与 MD3 层**并存不冲突**（命名空间隔离）。

---

## 1. 令牌从哪里来（可追溯）

| 类别 | 来源 | 说明 |
| --- | --- | --- |
| 色彩 37 角色 | `material-color-utilities` 官方算法 | 种子色 `#2B6A5A`，即 mochi 的 `DefaultKeyColor`（`MochiColorScheme.kt:73`）；方案 `SchemeTonalSpot`，与 mochi 的 MD3 取色同源 |
| 字阶 20 级 | `MochiTextStyles.kt` `defaultTextStyles()` | MD3 标准 15 级 + mochi 额外 5 级 iOS 字阶（largeTitle/navTitle/body/subhead/footnote） |
| 形状 9 档 | `MochiShapes.kt` | 4/8/12/16/20/28/32/48 + 胶囊 |
| 阴影 6 档 | `MochiShadows.kt` | 双层（ambient + key）结构，`elevation(e)` 线性插值；CSS 用双层 `box-shadow` 近似 |
| 动效 8 档 | `MochiMotionTokens.kt` | 弹簧参数 `(response, damping)` 数学采样为 CSS `linear()` |
| 间距 | 4dp 基准 | xs/sm/md/lg/xl/2xl/3xl = 4/8/12/16/24/32/48 |
| 组件尺寸 | `MochiButtonDefaults.kt` | 按钮高 48、内边距 24×12、触控项 44 |

生成脚本的思路写在 `md3-tokens.css` 头部注释里；令牌一条条手抄容易错，所以用脚本从源码参数算。

---

## 2. 色彩

37 个角色，明暗双套，全部以 `--md3-<role>` 命名（kebab-case）：

```
primary / on-primary / primary-container / on-primary-container / inverse-primary
secondary / on-secondary / secondary-container / on-secondary-container
tertiary / on-tertiary / tertiary-container / on-tertiary-container
surface / on-surface / surface-variant / on-surface-variant / surface-tint
surface-container-lowest / -low / (default) / -high / -highest
surface-bright / surface-dim
background / on-background / inverse-surface / inverse-on-surface
error / on-error / error-container / on-error-container
outline / outline-variant / scrim / shadow
```

**用法规则**：

- 文字颜色只用 `on-*` 系列，不要用 `primary` 当正文色（对比度不够）
- 容器底色用 `surface-container-*`，按层级从 lowest 到 highest 递进
- **禁止**在 `.md3-*` 组件的 CSS 里写 `#hex` / `rgb()` / `hsl()`——门禁会拦

**明暗切换**（三种方式，任选其一）：

```html
<!-- 1. 跟随系统（默认，不加属性） -->
<html>

<!-- 2. 强制浅色 -->
<html data-md3-theme="light">

<!-- 3. 强制深色 -->
<html data-md3-theme="dark">
```

JS 侧：`MD3.initTheme()` 读已保存选择，`MD3.applyTheme('dark' | 'light' | 'auto')` 切换。

---

## 3. 字阶

20 级，命名 `--md3-type-<level>-{size,line,weight,tracking}`，配套工具类 `.md3-<level>`：

| MD3 15 级 | 尺寸/行高 | 用途 |
| --- | --- | --- |
| display-large / medium / small | 57/64 · 45/52 · 36/44 | 首屏主视觉（慎用） |
| headline-large / medium / small | 32/40 · 28/36 · 24/32 | 页面区块标题 |
| title-large / medium / small | 22/28 · 16/24 · 14/20 | 卡片标题、列表主文案 |
| body-large / medium / small | 16/24 · 14/20 · 12/16 | 正文 |
| label-large / medium / small | 14/20 · 12/16 · 11/16 | 按钮、芯片、辅助标签 |

| iOS 5 级（mochi 补充） | 尺寸/行高 |
| --- | --- |
| large-title | 34/41 Bold |
| nav-title | 17/22 SemiBold |
| body | 17/22 |
| subhead | 15/20 |
| footnote | 13/18 |

**规则**：正文最小 12px（body-small）；移动端不要用 display 级做正文。

---

## 4. 形状

```css
--md3-shape-extra-small: 4px;    /* 输入框、Snackbar */
--md3-shape-small: 8px;          /* 芯片 */
--md3-shape-medium: 12px;        /* 卡片 */
--md3-shape-large: 16px;         /* FAB、列表容器 */
--md3-shape-large-increased: 20px;
--md3-shape-extra-large: 28px;   /* 对话框 */
--md3-shape-extra-large-increased: 32px;
--md3-shape-extra-extra-large: 48px;
--md3-shape-full: 9999px;        /* 按钮、头像、徽标 */
--md3-shape-checkbox: 2px;       /* MD3 复选框规范值 */
```

**规则**：`border-radius` 只能取上面这些变量、或 `0` / `1px`（分隔线）/ `50%`（圆点）。
写 `7px`、`13px` 这类凭感觉的数值会被门禁拦下。

---

## 5. 阴影

6 档，双层结构（key 阴影贴边 + ambient 环境光），明暗各一套：

```css
--md3-elevation-rest-shadow       /* 静止，几乎不可见 */
--md3-elevation-low-shadow        /* 卡片静态 */
--md3-elevation-raised-shadow     /* 悬停、FAB */
--md3-elevation-lifted-shadow     /* 拖拽中 */
--md3-elevation-floating-shadow   /* 对话框、Snackbar */
--md3-elevation-contact-shadow    /* 贴地接触（按钮按下前） */
--md3-elevation-contact-pressed-shadow
```

**规则**：交互抬升只跳一档，不要从 rest 直接跳到 floating。

---

## 6. 动效

8 档弹簧，参数来自 mochi 的 `(response, damping)`，已数学采样成 CSS `linear()`：

| 令牌 | 原始参数 | 用在 |
| --- | --- | --- |
| `--md3-motion-page` | 0.42s / ζ=1.0 | 页面切换、侧推 |
| `--md3-motion-present` | 0.42s / ζ=0.86 | 浮层出现、Snackbar |
| `--md3-motion-pop` | 0.36s / ζ=0.78 | 对话框、弹层 |
| `--md3-motion-control` | 0.34s / ζ=0.86 | 控件位移、开关 |
| `--md3-motion-settle` | 0.28s / ζ=1.0 | 收起、高度变化 |
| `--md3-motion-bounce` | 0.34s / ζ=0.55 | 角标、选中框 |
| `--md3-motion-press-down` | 0.22s / ζ=0.62 | 按下 |
| `--md3-motion-press-release` | 0.38s / ζ=0.62 | 松开回弹 |
| `--md3-motion-fade` | 150ms | 透明度淡入 |
| `--md3-motion-fade-out` | 120ms | 透明度淡出 |

**规则**：
- 一次变化里的所有参与者用**同一档**，才能同时起步同时停
- 位置/尺寸走弹簧，透明度走 fade（看清了还在落位会显得拖沓）
- `prefers-reduced-motion: reduce` 时全部退化为瞬时——已内置，不用自己再加

**关于按下缩放**：mochi 的 `pressScale=1.08` 是 iOS 交互。MD3 用状态层（颜色叠加）而非缩放。
本项目默认走 MD3（`--md3-press-scale` 默认 1）；确实要 iOS 手感时，在容器上加 `--md3-press-scale: 1.04` 覆盖。

---

## 7. 状态层

MD3 的交互反馈靠**叠加色**而非改底色，`.md3-btn` 已内置 `::before` 状态层：

| 状态 | 透明度令牌 |
| --- | --- |
| hover | `--md3-state-hover` = 0.08 |
| focus | `--md3-state-focus` = 0.12 |
| pressed | `--md3-state-pressed` = 0.12 |
| dragged | `--md3-state-dragged` = 0.16 |

禁用态：`--md3-disabled-alpha` = 0.4。

---

## 8. 组件清单

样式在 `css/md3-components.css`，构造器在 `js/md3.js`（`window.MD3`）。

| 组件 | CSS 类 | JS | 变体 |
| --- | --- | --- | --- |
| 按钮 | `.md3-btn` | `MD3.button({label, variant, size, icon, onClick})` | filled / tonal / elevated / outlined / text；sm / 默认 / lg |
| 图标按钮 | `.md3-icon-btn` | `MD3.iconButton({icon, label})` | 44px 触控 |
| FAB | `.md3-fab` | `MD3.fab({icon, label})` | — |
| 卡片 | `.md3-card` | `MD3.card({title, body, variant, interactive})` | elevated / filled / outlined |
| 输入 | `.md3-field` | `MD3.field({placeholder, variant, multiline})` | outlined / filled |
| 芯片 | `.md3-chip` | `MD3.chip({label, selected, variant})` | assist / filter |
| 开关 | `.md3-switch` | `MD3.toggle({label, checked, onChange})` | — |
| 复选/单选 | `.md3-check` | `MD3.check({label, type, name})` | checkbox / radio |
| 列表 | `.md3-list` | `MD3.list([{text, support, trail, selected, onClick}])` | — |
| 对话框 | `.md3-dialog` | `MD3.dialog({title, body, actions})` | — |
| Snackbar | `.md3-snackbar` | `MD3.snackbar({message, action, onAction})` | — |
| 进度 | `.md3-progress` | `MD3.progress({value})` | 确定 / 不确定 |
| 标签栏 | `.md3-navbar` | `MD3.navbar([{icon, label, active}])` | — |
| 徽标 | `.md3-badge` | `MD3.badge(text)` | — |
| 头像 | `.md3-avatar` | `MD3.avatar(text)` | — |
| 分隔线 | `.md3-divider` | `MD3.divider()` | — |

**组件完整性**：全部组件见 `1.2/md3.html`（可交互目录，深浅色都能切）。

---

## 9. 无障碍与响应式（强制）

- 所有可点击元素触控区 ≥ 44×44（`--md3-touch-target`）
- 交互元素必须有可见焦点环（`:focus-visible` 3px `--md3-secondary`）——组件已内置
- 图标按钮必须有 `aria-label`
- 对话框 `role="dialog"` + `aria-modal="true"` + Esc 关闭——`MD3.dialog` 已处理
- 状态提示用 `role="status"` + `aria-live="polite"`
- 窄屏（≤600px）自动收拢间距与按钮高度——已内置媒体查询

---

## 10. 怎么校验

```bash
npm run check:md3     # 令牌完整性 + 组件不硬编码 + 圆角不越界 + 组件族覆盖 + 页面结构
npm run verify        # 全套 14 道门禁（check:md3 已并入）
```

门禁检查五件事：

- **A 令牌完整性**：37 色彩角色必须有明暗两套；20 级字阶、9 档形状、5 档阴影、10 档动效一个不能少
- **B 不硬编码**：`md3-components.css` 里出现 `#hex` / `rgb()` / `hsl()` 就失败
- **C 圆角不越界**：只能用形状令牌或 0/1px/50%
- **D 组件族覆盖**：19 个组件类必须存在（防止改着改着删没了）
- **E 页面结构**：`md3.html` 不许有内联 `<style>` 或 `style` 属性（CSP 会拦，样式静默失效）

---

## 11. 加新组件时的流程

1. 先确认 MD3 规范里有这个组件（没有就别加，用最接近的现有组件组合）
2. 在 `md3-components.css` 里只引用 `--md3-*` 令牌
3. 在 `md3.js` 里加构造器（ES5、IIFE、零依赖、不写 inline style）
4. 在 `md3.html` + `md3-demo.js` 里加入目录
5. 跑 `npm run check:md3`
6. 如果要扩组件白名单，同步改 `scripts/check-md3.mjs` 的 `REQUIRED`

---

## 附：与既有设计系统的关系

项目原有两套视觉：

| 体系 | 令牌前缀 | 用在 |
| --- | --- | --- |
| 原有 | `--primary` / `--bg-*` / `--ink-*` | `index.html` 及其全部功能页、`promo` / `showcase` / `presentation` |
| MD3（本规范） | `--md3-*` | 新建页面与组件，起点是 `md3.html` |

两者**互不覆盖**：MD3 层只定义 `--md3-*`，不改 `--primary` 等既有变量；反之亦然。
若将来要把现有页面迁到 MD3，按页迁移、逐页验收，不要一次性替换。

### 已迁移页面登记表

迁一个登记一个（同步到 `scripts/check-md3.mjs` 的 `MIGRATED_PAGES`，门禁会守住不回退）：

| 页面 | 迁移日期 | 旧样式（已弃用） | 现状 |
| --- | --- | --- | --- |
| `showcase.html` | 2026-11-22 | `css/showcase.css` + `css/craft.css` | MD3 令牌 + 组件层 + `css/showcase-md3.css` 版面骨架 |

登记后门禁会校验：必须继续引用 MD3 令牌与组件层、不得再引旧样式、不得有内联样式。

**迁移后仍在用 `craft.css` 的页面**（未迁移，不受影响）：`index.html`、`presentation.html`、`promo.html`。

### 试跑结论（showcase.html）

用最小页面先试，结果：**MD3 层与既有门禁体系不冲突**——`check:version` / `check:theme` / `check:csp` / `check:anchors` / `check:md3` / `check:content` / `check:lint` 七道全过，E2E 5/5。

踩到的两个真问题，迁移其余页面时会重复遇到，记在这里：

1. **响应式不能被字阶吃掉**。原版 `h1` 是 `clamp(26px,5vw,44px)`，直接用 `--md3-type-headline-large-size`（固定 32px）会在大屏缩水。
   正确写法是让 clamp 的两端都落在 MD3 字阶上：
   `font-size: clamp(var(--md3-type-headline-medium-size), 5vw, var(--md3-type-display-medium-size))`。
2. **旧样式必须整份移除**，不能「新旧都引着」。同名元素上两套规则会互相覆盖，症状是「改了没生效」，排查成本极高。门禁的 `retired` 列表就是防这个。

