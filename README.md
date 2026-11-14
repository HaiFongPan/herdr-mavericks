# Herdr · Mavericks

[English](README.en.md) · 中文

把 [Herdr](https://herdr.dev) 换成 OS X 10.9 Mavericks 时代的 macOS 应用外观：
一条统一工具栏（交通灯、侧栏开关、标签页、视图按钮同处一行）、Aqua 按钮、Finder 式侧栏、
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
| `layouts/mavericks.json` | 整窗结构：工具栏、侧栏、pane、状态栏；`titlebar: none`，系统交通灯画在 `traffic_lights [12, 13]` |
| `themes/mavericks.json` | 浅色主题：10.9 的灰阶 chrome、系统蓝强调色、Terminal.app Basic 的 16 色 |
| `themes/mavericks-dark.json` | 黑底变体：chrome 不变，终端换 Terminal.app Homebrew 的黑底配色 |
| `mods/mavericks/` | 自绘部件，按 `props.role` 分工：`chrome`（含标签页）、`pane`、`status`（含 Settings / Add machine） |
| `mods/mavericks-spaces/` | 侧栏空间列表（克隆自 Herdr 的 `spaces`，只改外观：字体、行高、圆角、系统蓝选中） |
| `mods/mavericks-agents/` | 侧栏 agent 列表（克隆自 `agents`，同上） |
| `mods/mavericks-menu/` | 10.9 式上下文菜单（22px 行、蓝色选中、快捷键右对齐） |
| `mods/mavericks-files/` | Files 面板（克隆 Herdr 的 `files`）：平直面板、30px 标题、24px 行 |
| `mods/mavericks-changes/` | Changes 面板（克隆 `changes`）：同上，提交栏也压到 24px |

字体：界面 Helvetica Neue，终端 Menlo 12。两者都是 macOS 自带；没有时 Herdr 回退到 Geist / JetBrains Mono。

## 交互

- 整条工具栏可拖动窗口；按钮和标签都做了 `stop_propagation`，不会误拖窗。
- 一行从左到右：交通灯位、侧栏开关、标签页（占满中间）、Files / Changes（布局里有面板时）、向右分屏、向下分屏、查找、新建标签页。
- 标签：点击切换、双击改名、拖动排序、右键菜单、滚轮切上下一个。关闭按钮和状态位固定占位，悬停时只变可见度，标签宽度不会跳。
- 底部状态栏最左边是 Settings 与 Add machine，然后是当前路径与分支、标签数、agent 状态。
- 侧栏空间：点击切换、右键菜单、拖动排序；agent 行点击跳到对应 pane。
- pane 标题：点击聚焦、双击缩放；悬停露出分屏 / 缩放 / 关闭。

## 已知边界

- Herdr 自带的部分弹层没法换皮：关闭确认、重命名输入、新建标签页菜单、picker、Settings 等仍用 Herdr 自己的 mod，只跟随主题色。右键菜单已换成 `mavericks-menu`。
- Files / Changes 面板默认隐藏，从工具栏打开；内容与交互逻辑来自 Herdr 的 `files` / `changes`，只换了外观。
- Herdr 内置的终端查找条（`terminal.search`）不是 mod，没有样式接口：`find` 输入框的内边距改不了。
- `mavericks-spaces` / `mavericks-agents` 是 Herdr 0.1.15 的克隆，Herdr 升级后如果内部数据或 API 变了，这两个要跟着更新（或重新 `mod.clone` 再套用本仓库的样式改动）。
- 没做 Dock、Launchpad、菜单栏、音效：它们和窗口内容无关，或需要额外的常驻悬浮块。
- 终端默认白底（Terminal.app Basic）。布局主题是 `{ light: "mavericks", dark: "mavericks-dark" }`：系统切到深色外观，或在上方主题菜单里选 `mavericks-dark`，终端就变黑底（Terminal.app Homebrew）。
