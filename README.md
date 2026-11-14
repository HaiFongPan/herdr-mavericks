# Herdr · Mavericks

[English](README.en.md) · 中文

把 [Herdr](https://herdr.dev) 换成 OS X 10.9 Mavericks 时代的 macOS 应用外观：
贯通到底的 Finder 式侧栏、工作区顶部一条统一工具栏（标签页与视图按钮同处一行）、
原生窗口标题栏样式的 pane 标题、系统蓝选中与 Helvetica Neue。

![Herdr · Mavericks](preview.png)

## 安装

```sh
./install.sh            # 复制到 ~/.config/herdr-app
./install.sh --link     # 软链，改仓库即生效（开发用）
herdr-app do layout.switch --name mavericks
```

切回原来的布局：`herdr-app do layout.switch --name main`。
主题 `mavericks` 只在这个布局的 Settings 里出现（与布局同名）。

## 结构

| 文件 | 作用 |
|---|---|
| `layouts/mavericks.json` | 整窗结构：贯通到底的侧栏（顶部 brand 行留交通灯位）+ 工作区（工具栏、pane、状态栏）；`titlebar: none`，系统交通灯画在 `traffic_lights [12, 13]` |
| `themes/mavericks.json` | 浅色主题：10.9 的灰阶 chrome、系统蓝强调色、Terminal.app Basic 的 16 色 |
| `themes/mavericks-dark.json` | 深色外观：同一个 10.9 结构换成深灰阶 chrome（侧栏、工具栏、标签、pane 标题、状态栏、面板、菜单），终端换成石墨底 `#1f1f1f` 与配得上它的 16 色（Homebrew 色相，暗色抬亮到石墨底上可读） |
| `mods/mavericks/` | 自绘部件，按 `props.role` 分工：`brand`（侧栏顶部）、`chrome`（标签页）、`pane`、`status`、`footer`（Settings / Add machine） |
| `mods/mavericks-spaces/` | 侧栏空间列表（克隆自 Herdr 的 `spaces`，只改外观：字体、行高、圆角、系统蓝选中） |
| `mods/mavericks-agents/` | 侧栏 agent 列表（克隆自 `agents`，同上） |
| `mods/mavericks-menu/` | 10.9 式上下文菜单（22px 行、蓝色选中、快捷键右对齐） |
| `mods/mavericks-files/` | Files 面板（克隆 Herdr 的 `files`）：平直面板、30px 标题、24px 行 |
| `mods/mavericks-changes/` | Changes 面板（克隆 `changes`）：同上，提交栏也压到 24px |

字体：界面 Helvetica Neue，终端 Menlo 12。两者都是 macOS 自带；没有时 Herdr 回退到 Geist / JetBrains Mono。

## 交互

- 侧栏贯通到窗口顶部与底部：顶部 brand 行留出交通灯位，靠右是侧栏收缩按钮；底部是 Settings 与 Add machine。
- 侧栏窄于 160px 收成图标轨：每行一个 16px 图标，后面跟一颗 5px 状态点（机器连接、space 状态、agent 状态同一列），选中行的高亮铺满整行。图标轨里不放开侧栏按钮，用 `cmd-b` 收回完整侧栏。
- 侧栏与工作区共用一条 1px 分隔线，拖动侧栏边界时工具栏里的标签页一起跟着动。
- 工作区工具栏一行：标签页（从侧栏右边缘开始）、Files / Changes（布局里有面板时）、向右分屏、向下分屏、查找、新建标签页；每个按钮都是独立的 Aqua 胶囊，不再用连体分段控件。整条可拖动窗口，按钮和标签都做了 `stop_propagation`。
- 侧栏收起（`cmd-b`）后工具栏贴到窗口左边，左边自动留出交通灯的位置（`traffic_lights[0] + 64`，侧栏拖窄时按剩余宽度补），标签不会和交通灯叠在一起。
- 标签：点击切换、双击改名、拖动排序、右键菜单；标签多到一行放不下时，滚轮左右平移标签条
  （露出被挡住的标签，不再切换标签；切标签用 `cmd-shift-[` / `cmd-shift-]` 或点选）。
  关闭按钮和状态位固定占位，悬停时只变可见度，标签宽度不会跳。
- 工作区底部状态栏：终端图标、当前路径与分支、标签数、agent 状态计数。
- 分隔线只画一层：侧栏与工作区之间是一条 root `divider`；pane 没有边框，pane 之间、pane 与 Files 面板之间靠 1px 间隙露出主题的 `border` 色（浅色 `#b8b8b8` / 深色 `#1d1d1d`）；聚焦用 pane 标题栏的深浅表示。
- 侧栏空间：点击切换、右键菜单、拖动排序；agent 行点击跳到对应 pane。
- pane 标题：点击聚焦、双击缩放；悬停露出分屏 / 缩放 / 关闭。
- 外观跟随系统：浅色用 `mavericks`、深色用 `mavericks-dark`，侧栏、工具栏、终端、面板一起切，一秒内生效。
  主题菜单只换当前外观那一半（浅色外观下看到 `mavericks`，深色下看到 `mavericks-dark`），要手动换色就切外观。

## 已知边界

- Herdr 的弹层外框只给自己的 1px 描边做圆角，不裁 mod 的方形背景，所以弹层四角会漏出一小块浅色方块（`popover` 压在调暗的背景上看得更清楚）：按键列表、picker、new-menu、Settings 都有。这是 Herdr 侧的绘制问题，主题改不了；克隆内置 mod 自己裁圆角能盖住，但升级 Herdr 后克隆会落后，所以没有这么做。
- Herdr 自带的部分弹层没法换皮：关闭确认、重命名输入、新建标签页菜单、picker、Settings、命令面板（`cmd-shift-p`）等仍用 Herdr 自己的 mod，只跟随主题色。右键菜单已换成 `mavericks-menu`。
  这些弹层用 `colors.foreground` 画行文字，所以选中底色不能是侧栏那种深系统蓝（蓝底深字看不清）；
  `colors.selected` 用系统蓝的浅端 `#6fa8e8`，蓝底深字仍然读得清。
- Files / Changes 面板默认隐藏，从工具栏打开；内容与交互逻辑来自 Herdr 的 `files` / `changes`，只换了外观。
- Herdr 内置的终端查找条（`terminal.search`）不是 mod，没有样式接口：`find` 输入框的内边距改不了。
- `mavericks-spaces` / `mavericks-agents` 是 Herdr 0.1.15 的克隆，Herdr 升级后如果内部数据或 API 变了，这两个要跟着更新（或重新 `mod.clone` 再套用本仓库的样式改动）。
- 没做 Dock、Launchpad、菜单栏、音效：它们和窗口内容无关，或需要额外的常驻悬浮块。
- 终端浅色外观是白底（Terminal.app Basic），深色外观是石墨底 `#1f1f1f`（16 色沿用 Homebrew 色相，
  暗色抬亮，`#0000b2`、`#990000` 这类在石墨底上会糊掉）。布局主题是
  `{ light: "mavericks", dark: "mavericks-dark" }`：跟随系统外观，也可以在上方主题菜单里手动选。
- Herdr 换外观时不会重绘布局里的 mod，所以各个 mod 每秒比对一次主题签名，变了才重绘；
  从切外观到整窗变色最多晚约一秒。
