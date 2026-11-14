# Herdr · Mavericks

把 Herdr 画成 OS X 10.9 Mavericks 的应用窗口：一条 40px 的统一工具栏里同时放交通灯、
侧栏开关、标签页和视图按钮；下面是 Finder 式侧栏与原生标题栏样式的 pane 标题，底部一条灰色状态条。

![Herdr · Mavericks](preview.png)

## 你看到什么

自上而下：

1. **统一工具栏，40px**：`#efefef → #d9d9d9` 的竖直渐变，底部 1px `#9a9a9a`。
   最左边 78px 留给 macOS 的系统交通灯（`traffic_lights [12, 13]`）。
   接着是 22px 高的侧栏开关按钮（选中时灰色按下态）和一条竖分隔线。
   中间是标签页：每个 26px 高、5px 圆角；活动标签 `#f6f6f6 → #ededed` 渐变 + 1px `#a5a5a5`
   描边 + 细阴影，其余透明、悬停变浅灰。每个标签有程序图标、名称（自动编号的显示程序名）、
   12px 的状态槽（转圈或状态点）和固定占位的 `×`；标签超出时横向滚动。
   最右依次是 Files / Changes（布局里有面板时）、向右分屏 / 向下分屏（相连的分段控件）、查找、`+`。
3. **侧栏，220px**：`#ededed → #e3e3e3`，右边 1px `#c5c5c5`。
   `SPACES` / `AGENTS` 是 11px 半粗 `#6f6f6f` 的分组标题。
   空间行 26px 高、5px 圆角：16px 彩色圆角方块 + 首字母、空间名 12.5px；
   右侧是仓库、分支、↑↓；选中行是系统蓝渐变（`#6fa8e8 → #2c62b8`）白字。
   agent 行同样是 26px：程序图标、名称、悬停时出现 pin，右侧是状态点或时长。
   侧栏窄于 160px 时整个变成 44/76px 的图标轨（Herdr 自带行为）。
4. **pane 区**：每个 pane 顶部 24px 的标题栏——聚焦时 `#f2f2f2 → #e4e4e4`、失焦时更淡；
   12px 程序图标、11.5px 标题、右侧 `~/…` 路径；悬停露出向右 / 向下分屏、缩放、关闭。
   pane 之间 1px 间隙（露 `work-body` 的 `#b8b8b8` 背景），pane 自己没有边框；聚焦时 1px `#9a9a9a`。
5. **状态栏，22px**：`#ededed → #dedede`，顶部 1px `#b0b0b0`。
   最左是 Settings 与 Add machine 两个 11px 图标，一条竖线，终端图标 + `~/路径 · 分支`；
   右边标签数，以及 working / blocked / done 的 agent 计数点。

终端本身是白底黑字（Terminal.app 的 Basic 配色），Menlo 12。

## 它怎么动

- 整条工具栏是窗口拖动区（`window_drag`）；按钮和标签都在 mouse down 时 `stop_propagation`，不会误拖窗。
- 工具栏：侧栏按钮 `layout.toggle {id: "sidebar"}`；Files / Changes 切 `layout.show|hide|select`
  并记住 `panel-body` 的当前子项；分屏 `pane.split {direction}`；查找 `terminal.search`；
  `+` 打开 Herdr 的 new-menu。
- 标签：单击 `tab.select`，双击 `tab.rename`，按住拖动 `tab.move`，右键打开 `mavericks-menu`，
  滚轮 `tab.prev` / `tab.next`。关闭按钮和 12px 状态槽始终占位，只在活动或悬停时显示，
  标签宽度不随指针跳动。
- 空间行：单击 `space.select`，拖动 `space.move`，右键 `mavericks-menu`（tab: "space"）；
  选中行随 `spaces()[i].active` 变化。
- agent 行：单击 `pane.focus {pane}`；悬停显示 pin（`terminal.pin`）。
- pane 标题：单击 `pane.focus`，双击 `pane.zoom`，右侧按钮分屏 / 缩放 / 关闭；
  agent 状态变化时显示转圈或状态点。
- 状态栏最左：Settings 跑 `app.settings`，Add machine 跑 `mod.open {name: "machine-add"}`。
- 状态栏随 `focused()`、`panes()`、`agents()` 更新，不轮询。

## 怎么搭的

- 布局 `layouts/mavericks.json`：`titlebar: "none"`、`traffic_lights: [12, 13]`、`theme: "mavericks"`、
  `font: Menlo`、`font_size: 12`、`ui_font: Helvetica Neue`。
  树：`column[ block(chrome, 40, window_drag) →
  row[ column(sidebar, 220)[spaces, agents] →
  row[ block(tab: active, pane: {gap: 1, header: 24}), column(panel, 300, hidden)[stack[files, changes]] ] ]
  → block(status, 22) ]`。标签页在 chrome 里，没有单独的标签栏。
- `mods/mavericks`：一个 mod 三个 role，`main.js` 按 `props.role` 分派到 `chrome.js`（含标签页）、
  `pane.js`、`status.js`（含 Settings / Add machine）。`kit.js` 是共用的 10.9 调色板、渐变层
  （`window.paint_path` + `Background.linear_gradient`）、1px 细线、Aqua 按钮、分段控件和图标。
  图标都是 16×16 的 `currentColor` 线稿，放在 `assets/icons/`。
- `mods/mavericks-spaces` / `mods/mavericks-agents`：Herdr 0.1.15 的 `spaces` / `agents` 克隆，
  只动外观（字体、行高、圆角、蓝色选中、分组标题）；worktree、机器分组、git 状态、拖拽、折叠等逻辑原样保留。
  渐变层用 `globalThis.window.paint_path`，因为这两个文件把 `window` 这个名字导入了 Herdr 的窗口状态。
- `mods/mavericks-files` / `mods/mavericks-changes`：Herdr 0.1.15 的 `files` / `changes` 克隆，
  只改 render 的样式（去掉圆角与边框、标题 30px、行 24px、Helvetica Neue 12、细线 `#b8b8b8`），
  图标仍引用 `mods/files/*.svg`。
- `mods/mavericks-menu`：复刻 `menu` 的 items（pane / tab / space / global，含 worktree 项），
  去掉图标，22px 行、4px 圆角、蓝色选中、快捷键右对齐；保留 ↑/↓/Enter/Esc 键盘导航。
- `themes/mavericks.json`：背景 `#fdfdfd`、前景 `#1b1b1b`、选中 `#b3d1ff`，
  ansi 0–15 是 Terminal.app Basic 的配色；`colors` 覆盖 Herdr 的 chrome / canvas / accent / 状态色。
- `themes/mavericks-dark.json`：chrome 色同浅色主题，终端换成 Terminal.app Homebrew 的黑底
  （`#000000` / `#ffffff` 与它的 16 色）。布局的 `theme` 是 `{ light, dark }`，跟随系统外观；
  也可以在主题菜单里手动选。
- 所有尺寸按 zoom 1 写；Herdr 自己缩放布局，字体大小由 `text_size` 跟随。

## 注意

- macOS 的系统交通灯由系统画在布局之上，`herdr-app shot` 不一定截得到；换成 Linux/Windows 要自己画按钮（`window().buttons`）。
- Herdr 自带的关闭确认、重命名输入、new-menu、picker、Settings 不能换皮（调用方写死 mod 名），只跟随主题色。
- `mavericks-spaces` / `mavericks-agents` 绑定 Herdr 0.1.15 的内部数据与 helper；升级 Herdr 后先跑
  `herdr-app check`，再对照新版 `spaces` / `agents` 更新。
- 分隔线只画一层：pane 之间靠 `work-body` 的 `background #b8b8b8` 加 1px `gap` 露出来，
  pane 自己的 `border` 是 0（聚焦时用 1px `focus` 覆盖），侧栏与工作区之间是侧栏右边线，
  工具栏、状态栏各有一条 1px 底线/顶线。不要再给相邻元素各加一条边。
- Herdr 的 find bar 是 app 内置，不是 mod，无法改内边距。
- `window.paint_path` 在 `mods/mavericks` 里能直接用；在导入了 Herdr `window` 的克隆 mod 里必须用 `globalThis.window`。
- 灰色按下态、1px 细线在 zoom 非 1 时可能落到半像素；这是 Herdr 布局缩放的结果，不是 mod 的 bug。
- 布局如果被 Herdr 重写成规范化树（root 字段可能被外层的 row 包住），
  `titlebar` / `traffic_lights` / 字体字段会丢；从仓库重新 `install.sh` 并 `layout.switch` 即可恢复。

## 完成标准

- `herdr-app check ~/.config/herdr-app/mods/mavericks` 通过；`mavericks-menu`、`mavericks-spaces`、`mavericks-agents` 同样通过。
- `herdr-app do layout.switch --name mavericks` 后，窗口是一条 40px 工具栏（交通灯位、侧栏开关、
  标签页、Files/Changes、分屏、查找、`+`），下面是 220px 侧栏与 24px pane 标题，底部 22px 状态栏
  （最左是 Settings / Add machine）。标签页与工具栏同一行，没有独立标签栏。
- 点侧栏按钮能隐藏/显示侧栏，点 `+` 能开新建菜单，右键标签和空间出现 10.9 式菜单，选中行是蓝色渐变白字。
- 切回 `main` 布局外观与安装前一致。
