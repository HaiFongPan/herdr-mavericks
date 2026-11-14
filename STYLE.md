# Mavericks 样式规范

本仓库所有 **Mavericks 族**布局与皮肤的硬性约定。目标不是"灰一点的深色主题"，而是
OS X 10.9 那个窗口：Aqua 渐变、1px 细描边、系统蓝选中、Helvetica Neue，没有扁平、没有
圆角卡片、没有皮革和亚麻纹理（那些是 10.9 之前的时代）。

新建 layout 时按这个顺序做：**结构骨架 → 尺寸基线 → 色板 → 绘制 → 交互 → 深浅两套 →
检查清单**。规范里没写的细节，先按现有代码（`mods/mavericks/kit.js`）取值，不要另起一套。

## 1. 结构骨架

窗口只有一种骨架，横向切成两块，两块都贯通到窗口上下边缘：

```
row[ sidebar(column: brand / spaces / agents / footer) | work(column: chrome / 内容 / status) ]
```

- 侧栏在左、贯通到底；**不要**做成"工作区顶栏 + 下面再分侧栏"的三段式。
- 交通灯落在侧栏的 brand 行（`titlebar: none` + `traffic_lights`），宽度变化时由 brand 留白。
- 内容区是 `row[ 主区 | 可选面板 ]`，主区内部再分 pane。

固定高度（布局 px，zoom 1）：

| 区域 | 高度 | 说明 |
|---|---|---|
| `brand` 侧栏顶行 | 40 | 交通灯留白 + 靠右的侧栏开关，`window_drag` |
| `chrome` 工具栏 | 40 | 标签页 + 视图按钮，`window_drag` |
| pane 标题栏 | 24 | `header.position: top`、`reveal: always` |
| `status` 状态栏 | 22 | 与侧栏 `footer` 同高 |
| `sidebar` 底行 | 22 | Settings / Add machine |

宽度：侧栏默认 220，`min 40 / max 480`；窄于 **160** 收成图标轨，轨宽 **68**（macOS，交通灯
64 + 4 余量）或 44（其它平台）。面板默认 300，`min 220 / max 560`，默认 `hidden`。

分隔线**只画一层**，这是最容易出错的地方：

- 侧栏与工作区之间：root 的 `divider: { width: 1, color: "border" }`。
- pane 之间、pane 与面板之间：`work-body` 上 `gap: 1` + `background: "border"`，
  同时 pane 的 `border.width` 与 `focus.width` 都是 **0**、`radius: 0`。
- 相邻元素各加一条 1px 就会变成 2px 粗线；聚焦用标题栏深浅表达，不用焦点框。

## 2. 字体与字号

界面 Helvetica Neue，终端 Menlo 12。只允许这两族：不引第三方字体文件。

| 用途 | 字号 |
|---|---|
| 正文、列表、面板行 | 12 |
| 工具栏按钮、标签、pane 标题 | 11.5 |
| 状态栏 | 10.5 |
| 分组标题、次级标签 | 11（分组标题半粗） |
| space / agent 行名 | 12.5 |

层级靠**颜色和字重**区分，不靠字号跳两级：正文之外只允许 11.5 / 11 / 10.5 三档。

## 3. 色板

两套同 key 的调色板（`LIGHT` / `DARK`），只在 `kit.js` 里各写一份，由 `palette()` 按
`theme().chrome` 的感知亮度切换（> 0.5 用浅色）。**不要**在组件里判断外观。

| 层 | 浅色 | 深色 |
|---|---|---|
| 工具栏 `title*` | `#efefef → #d9d9d9`，描边 `#9a9a9a` | `#424242 → #353535`，描边 `#1f1f1f` |
| 侧栏 `sidebar*` | `#ededed → #e3e3e3` | `#3a3a3a → #323232` |
| 活动标签 `tabActive*` | `#f6f6f6 → #ededed`，描边 `#a5a5a5` | `#4c4c4c → #424242`，描边 `#5e5e5e` |
| pane 标题（聚焦） | `#f2f2f2 → #e4e4e4` | `#4a4a4a → #3f3f3f` |
| pane 标题（失焦） | `#f5f5f5 → #ededed` | `#3f3f3f → #363636` |
| 状态栏 | `#ededed → #dedede` | `#3a3a3a → #2f2f2f` |
| 正文 / 次级 / 弱 | `#262626` / `#5f5f5f` / `#8d8d8d` | `#eaeaea` / `#b3b3b3` / `#838383` |
| 强调（系统蓝） | `#3f7fd6`，深 `#2c62b8`，浅 `#6fa8e8` | `#4a86d8`，深 `#2b5cae`，浅 `#5f97e4` |

规则：

1. **布局 JSON 里不写死颜色**，只用主题 token（`canvas`、`border`、`background`）。写死一个
   `#e9e9e9` 就会在深色外观里露出一块浅色。
2. 窗口 chrome 的灰阶放 `kit.js`，不进主题；主题只负责终端配色和 Herdr 自带弹层的颜色。
3. 灰阶差：浅色相邻层 2–6 级；深色 6–8 级，描边比底色更深，不用浅灰描边（会显脏）。
4. 强调色只有系统蓝一个色相。选中是蓝渐变 + 白字（`#6fa8e8 → #2c62b8`）。
5. Herdr 自带、无法换皮的弹层用 `colors.selected: #6fa8e8`（系统蓝的浅端）：这些弹层用
   `colors.foreground` 画行文字，深蓝底上的深字看不清。
6. 深色不是纯黑：canvas 从 `#262626` 起，终端 `#1f1f1f`。纯黑挨着 `#3a3a3a` 的侧栏像个洞。

## 4. 绘制

- **渐变**：`gradient(from, to, 180)` 满铺父级，必须是区域里的第一个 child（压在内容下面），
  父级 `relative`。相邻两层色差小，靠渐变本身分层，不靠阴影。
- **1px 线**：统一用 `hairline(color, side)`，画在区域边界内侧；一条边只画一条。
- **圆角**：按钮、行、标签 4–5px；pane 和面板 0。不出现 8px 以上的圆角。
- **按钮**：工具栏 22px 高、图标按钮 18px；4px 圆角、1px 描边、顶部 1px `#ffffffcc` 内高光；
  选中/按下用 `btnOn*`，禁用 `opacity 0.45`，`cursor_pointer` 只在可点时给。
- **不做连体分段控件**：每个动作一颗独立胶囊。`segment()` 留着但新布局不用。
- **图标**：16×16 `currentColor` 线稿，按 9 / 12 / 13 / 14px 使用，颜色取 `textMuted` /
  `textDim` / `text`。除程序图标（`image()`）外不混彩色图标。
- **状态点**：5–7px 圆，颜色只取主题的 `working` / `blocked` / `done` 加灰 `idle`，不自定义；
  轨道里图标、状态点共用一套格子，三类行必须上下对齐。

## 5. 交互

- 可拖动区域：`brand` / `chrome` 上 `window_drag: true`；其中的按钮、标签、行在 `mouse down`
  一律 `cx.stop_propagation()`，否则点按钮会拖窗。
- 点击 = 选中 / 聚焦；双击 = 改名或缩放；右键 = 10.9 菜单（`mavericks-menu`，
  `props.tab` 指定 `pane|tab|space|global`）；拖动 = 排序。四件事在同一元素上不能冲突。
- 悬停才出现的控件必须**固定占位**（`opacity` 或固定宽高），否则标签和行宽会跳。
- 标签条溢出：`overflow_x_scroll` 平移，不接 `tab.prev/next`，不画横向滚动条。
- 尺寸变化用 `on_size_change` + `ScrollHandle` 重排、滚动到选中项；不用定时器假装响应式。
- 状态一律现读 `spaces()` / `panes()` / `agents()` / `focused()`，不缓存、不轮询。唯一允许的
  定时器是外观签名比对（见下）。

## 6. 深浅两套

- 布局的 `theme` 必须写成 `{ light, dark }` 两份，且主题名与布局同名（同名主题只在该布局下出现）。
- Herdr 切外观时**不会重绘布局里的 mod**：每个 mod 的 `init` 里调 `watchAppearance(cx)`，
  每秒比对 `chrome|foreground` 签名，变了才 `cx.notify()`。没有这一步，切外观只有终端变色。
- 克隆出来的内置 mod（`spaces` / `agents` / `files` / `changes`）在 `init` 里内联同样的签名判断，
  并且必须用 `globalThis.window.paint_path`——它们把 Herdr 的窗口状态导入成了 `window`。
- 深色外观下终端配色要重新取值，不直接复用浅色 ANSI：`#990000`、`#0000b2` 这类在石墨底上
  对比度不到 2:1，抬亮后再用。

## 7. 文件与命名

- 一个部件一个目录 `mods/<name>/`，`mod.json` 至少写 `title`、`place`；克隆必须记
  `cloned_from: { name, version }`。
- 同一套外观的多个部件用 `props.role` 在一个 mod 里分派（`brand` / `chrome` / `pane` /
  `status` / `footer`），不要复制五份 `main.js`。
- 资源放 `mods/<name>/assets/`，引用写全路径 `mods/<name>/assets/...`。
- 图片：`layouts/<name>.png` 是布局选择器的缩略图（520×338），仓库根 `preview.png` / `preview-dark.png`
  是 Gallery 与 README 用的浅色 / 深色截图（缩到 1600 宽）。界面改了三个都要跟着换。
- `install.sh` 里逐个列出的目录必须与 `mods/` 同步；新增 mod 忘了加，装完就是空白区域。
- 生成物不提交：`gpui-kit.d.ts`、`jsconfig.json`（Herdr 自己生成），已写进 `.gitignore`。

## 8. 与灵感源的差异

[multica-mavericks](https://github.com/forrestchang/multica-mavericks) 用 Lucida Grande 13px、
蓝灰 Finder source list、纯 Mac 应用的窗口结构。这里刻意不同的地方：

| 项 | multica-mavericks | 本仓库 | 原因 |
|---|---|---|---|
| 界面字体 | Lucida Grande 13px | Helvetica Neue 12px | Herdr 的 `ui_font` 与终端字号 12 对齐，13px 会挤掉标签与行高 |
| 侧栏 | 蓝灰 source list | 中性灰 `#ededed` | Herdr 侧栏要放机器、space、agent 三层信息，蓝灰底压不住状态色 |
| 终端 | 主题不涉及 | Terminal.app Basic / 石墨 | Herdr 是真终端，配色必须自己给全 16 色 |
| 弹层 | 可整套换皮 | 只能跟随主题色 | Herdr 部分弹层写死 mod 名，见 RECIPE 的 Watch out |

## 9. 新布局检查清单

- [ ] `herdr-app check` 通过（每个新 mod 单独跑）。
- [ ] `herdr-app status` 无 `errors`，布局名与预期一致。
- [ ] `herdr-app shot` 目视：结构骨架、固定高度、字号、色板与本文一致。
- [ ] 侧栏与工作区、pane 之间都只有 1px；没有 2px 叠线。
- [ ] 侧栏拖宽/拖窄时标签起点跟着走；收成图标轨后图标与状态点同列，标签不压交通灯。
- [ ] 标签溢出时滚轮平移、不切标签、无滚动条；关闭与状态槽固定占位，标签不抖。
- [ ] 点击 / 双击 / 右键 / 拖动四种操作互不抢事件。
- [ ] 浅色、深色都看过一遍：整窗（含面板、菜单、终端）在一秒内一起变。
- [ ] 切回 `main` 后与原样一致，本布局主题从 Settings 消失。
- [ ] `install.sh` 能装到干净目录，装完 `layout.switch` 正常。

## 10. 不要做

- 不给 pane 同时加 `border` 和 `focus`，不靠焦点框表达聚焦。
- 不在布局 JSON 里写死颜色，不在组件里判断当前是深色还是浅色。
- 不引入自定义字体、位图皮肤、常驻动画定时器。
- 不用 8px 以上圆角、卡片阴影、毛玻璃、扁平无描边的"现代"样式。
- 不伪造 Dock、Launchpad、菜单栏、音效：它们不在窗口内容里，或需要额外常驻悬浮块。
- 不为了好看改克隆 mod 的逻辑（数据、拖拽、git 状态）：只改外观，逻辑跟着上游版本走。
- 不把 Herdr 自带 mod 的克隆当作长期方案：升级后先 `herdr-app check`，再对照新版重新套样式。
