# Herdr · Mavericks

把 [Herdr](https://herdr.dev) 换成 OS X 10.9 Mavericks 时代的 macOS 应用外观：
一行式窗口 chrome（交通灯 + 视图按钮）、Safari 式标签栏、Aqua 工具栏按钮、Finder 式侧栏、
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
| `layouts/mavericks.json` | 整窗结构：chrome 条、侧栏、标签栏、pane、状态栏；`titlebar: none`，系统交通灯画在 `traffic_lights [12, 13]` |
| `themes/mavericks.json` | 浅色主题：10.9 的灰阶 chrome、系统蓝强调色、Terminal.app Basic 的 16 色 |
| `mods/mavericks/` | 自绘部件，按 `props.role` 分工：`chrome`、`tabs`、`pane`、`status` |
| `mods/mavericks-spaces/` | 侧栏空间列表（克隆自 Herdr 的 `spaces`，只改外观：字体、行高、圆角、系统蓝选中） |
| `mods/mavericks-agents/` | 侧栏 agent 列表（克隆自 `agents`，同上） |
| `mods/mavericks-menu/` | 10.9 式上下文菜单（无图标、22px 行、蓝色选中、快捷键右对齐） |

字体：界面 Helvetica Neue，终端 Menlo 12。两者都是 macOS 自带；没有时 Herdr 回退到 Geist / JetBrains Mono。

## 交互

- 整条 chrome 可拖动窗口；按钮都做了 `stop_propagation`，点按钮不会拖窗。
- 左边一组视图控件：侧栏开关、向右分屏、向下分屏、查找；中间居中窗口标题（`空间 — 标签`）；右边新建标签页。
- 标签：点击切换、双击改名、拖动排序、右键菜单、滚轮切上下一个。
- 侧栏空间：点击切换、右键菜单、拖动排序；agent 行点击跳到对应 pane。
- pane 标题：点击聚焦、双击缩放；悬停露出分屏 / 缩放 / 关闭。

## 已知边界

- Herdr 自带的部分弹层没法换皮：关闭确认、重命名输入、新建标签页菜单、picker、Settings 等仍用 Herdr 自己的 mod，只跟随主题色。右键菜单已换成 `mavericks-menu`。
- `mavericks-spaces` / `mavericks-agents` 是 Herdr 0.1.15 的克隆，Herdr 升级后如果内部数据或 API 变了，这两个要跟着更新（或重新 `mod.clone` 再套用本仓库的样式改动）。
- 没做 Dock、Launchpad、菜单栏、音效：它们和窗口内容无关，或需要额外的常驻悬浮块。
- 终端是白底（Terminal.app Basic）。想要黑底，把 `themes/mavericks.json` 的 `background` / `foreground` / `ansi` 换成深色即可。
