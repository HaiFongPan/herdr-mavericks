# Herdr · Mavericks

[中文](README.md) · English

Turn [Herdr](https://herdr.dev) into an OS X 10.9 Mavericks app: a single-row window chrome
(traffic lights plus view controls), Safari-style tabs, Aqua toolbar buttons, a Finder-style
sidebar, native-looking pane title bars, system-blue selection and Helvetica Neue.

![Herdr · Mavericks](preview.png)

## Install

```sh
./install.sh            # copy into ~/.config/herdr-app
./install.sh --link     # symlink instead; edits here apply live (development)
herdr-app do layout.switch --name mavericks
```

Back to your old layout: `herdr-app do layout.switch --name main`.
The `mavericks` theme only appears in Settings while this layout is shown (a theme named
like a layout belongs to it).

## What is in here

| Path | Purpose |
|---|---|
| `layouts/mavericks.json` | The whole window: chrome bar, sidebar, tab bar, panes, status bar. `titlebar: none`; the system traffic lights sit at `traffic_lights [12, 13]` |
| `themes/mavericks.json` | Light theme: 10.9 chrome greys, system-blue accent, Terminal.app Basic 16 colors |
| `mods/mavericks/` | Hand-drawn parts, dispatched by `props.role`: `chrome`, `tabs`, `pane`, `status` |
| `mods/mavericks-spaces/` | Spaces sidebar (cloned from Herdr's `spaces`, looks only: font, row height, radius, system-blue selection) |
| `mods/mavericks-agents/` | Agents sidebar (cloned from `agents`, same treatment) |
| `mods/mavericks-menu/` | 10.9 context menu: no icons, 22px rows, blue selection, right-aligned shortcuts |

Fonts: Helvetica Neue for UI, Menlo 12 for terminals. Both ship with macOS; without them
Herdr falls back to Geist / JetBrains Mono.

## Interactions

- The whole chrome drags the window; every button stops propagation on mouse-down.
- Left group: sidebar toggle, split right, split down, find. Center: window title
  (`space — tab`). Right: new tab.
- Tabs: click to select, double-click to rename, drag to reorder, right-click for the menu,
  scroll to switch.
- Spaces: click to select, right-click for the menu, drag to reorder. An agent row focuses
  its pane.
- Pane title: click to focus, double-click to zoom; hovering reveals split / zoom / close.

## Known limits

- Some Herdr overlays cannot be reskinned: the close confirmation, rename prompts, the
  new-tab menu, the picker and Settings still use Herdr's own mods and only follow theme
  colors. The context menu has been replaced by `mavericks-menu`.
- `mavericks-spaces` / `mavericks-agents` are clones of Herdr 0.1.15. When Herdr's internals
  or APIs change, re-clone and re-apply the styling from this repo.
- No Dock, Launchpad, menu bar or sounds: they are outside the window content, or need an
  extra always-on floating block.
- The terminal is light (Terminal.app Basic). For a dark terminal, change `background`,
  `foreground` and the `ansi` palette in `themes/mavericks.json`.
- `herdr-app shot` does not include the macOS system traffic lights (the system draws them
  above the layout), so they are missing from `preview.png`.
