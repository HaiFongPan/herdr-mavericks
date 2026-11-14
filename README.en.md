# Herdr · Mavericks

[中文](README.md) · English

Turn [Herdr](https://herdr.dev) into an OS X 10.9 Mavericks app: a full-height Finder-style
sidebar, one unified toolbar across the work area (tabs and view controls in a single row),
Aqua buttons, native-looking pane title bars, system-blue selection and Helvetica Neue.

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
| `layouts/mavericks.json` | The whole window: a full-height sidebar (its brand row leaves room for the traffic lights) plus the work area (toolbar, panes, status bar). `titlebar: none`; the traffic lights sit at `traffic_lights [12, 13]` |
| `themes/mavericks.json` | Light theme: 10.9 chrome greys, system-blue accent, Terminal.app Basic 16 colors |
| `themes/mavericks-dark.json` | Dark terminal variant: same chrome, Terminal.app Homebrew colors |
| `mods/mavericks/` | Hand-drawn parts, dispatched by `props.role`: `brand` (sidebar top), `chrome` (tabs), `pane`, `status`, `footer` (Settings / Add machine) |
| `mods/mavericks-spaces/` | Spaces sidebar (cloned from Herdr's `spaces`, looks only: font, row height, radius, system-blue selection) |
| `mods/mavericks-agents/` | Agents sidebar (cloned from `agents`, same treatment) |
| `mods/mavericks-menu/` | 10.9 context menu: 22px rows, blue selection, right-aligned shortcuts |
| `mods/mavericks-files/` | Files panel (clone of `files`): flat panel, 30px header, 24px rows |
| `mods/mavericks-changes/` | Changes panel (clone of `changes`): same, plus a 24px commit bar |

Fonts: Helvetica Neue for UI, Menlo 12 for terminals. Both ship with macOS; without them
Herdr falls back to Geist / JetBrains Mono.

## Interactions

- The sidebar runs the full height of the window: its brand row leaves room for the traffic
  lights with the collapse button on the right; Settings and Add machine sit at its bottom.
- Narrowed below 160px the sidebar becomes an icon rail: one 16px icon per row, a 5px status dot
  after it (machine connection, space state and agent state share the column), and the selected
  row's highlight spans the whole rail. The rail has no expand button; `cmd-b` brings the sidebar back.
- Sidebar and work area share one 1px divider; dragging the sidebar edge moves the tabs with it.
- The work-area toolbar is one row: tabs (starting at the sidebar's right edge), Files / Changes
  (when the layout has the panel), split right, split down, find, new tab — each a separate Aqua
  capsule, no joined segmented control. It drags the window; buttons and tabs stop propagation on
  mouse-down. With the sidebar hidden (`cmd-b`) the toolbar sits at the window's left edge and
  reserves the traffic lights' space (`traffic_lights[0] + 64`, topped up when the sidebar is
  dragged narrow), so tabs never end up under them.
- Tabs: click to select, double-click to rename, drag to reorder, right-click for the menu.
  When they overflow the row, the wheel scrolls the tab strip sideways to reveal the hidden
  ones (it no longer switches tabs; use `cmd-shift-[` / `cmd-shift-]` or a click for that),
  and no horizontal scrollbar is painted. The close button and status slot keep their width,
  so tabs never jump.
- The work-area status bar shows the terminal icon, current path and branch, tab count and agent states.
- Only one line per seam: a root `divider` between sidebar and work area; panes have no border,
  and the 1px gaps between panes / the Files panel show the `#b8b8b8` background. Focus is shown
  by the pane title bar, not by a border.
- Spaces: click to select, right-click for the menu, drag to reorder. An agent row focuses
  its pane.
- Pane title: click to focus, double-click to zoom; hovering reveals split / zoom / close.

## Known limits

- Overlay corners show a small light square: Herdr's overlay frame rounds its own 1px border but
  does not clip the mod's square background, so the popover colour leaks past the rounded corner
  (keybinds, picker, new-menu, Settings). It is drawn by Herdr, not settable from the theme;
  cloning a built-in mod and rounding its own root hides it, but the clone would fall behind when
  Herdr updates, so this repo does not do it.
- Some Herdr overlays cannot be reskinned: the close confirmation, rename prompts, the
  new-tab menu, the picker, Settings and the command palette (`cmd-shift-p`) still use Herdr's
  own mods and only follow theme colors. The context menu has been replaced by `mavericks-menu`.
  Those overlays draw row text with `colors.foreground`, so the selection color cannot be the
  sidebar's deep system blue (dark text on it is unreadable): `colors.selected` uses the light
  end of the system blue, `#6fa8e8`, where dark text still reads.
- `mavericks-spaces` / `mavericks-agents` are clones of Herdr 0.1.15. When Herdr's internals
  or APIs change, re-clone and re-apply the styling from this repo.
- The Files / Changes panels are hidden by default and open from the toolbar; their logic comes
  from Herdr's `files` / `changes`, only the looks changed.
- Herdr's built-in terminal find bar (`terminal.search`) is not a mod and has no style hook:
  the padding of its `find` field cannot be changed.
- No Dock, Launchpad, menu bar or sounds: they are outside the window content, or need an
  extra always-on floating block.
- The terminal defaults to light (Terminal.app Basic). The layout theme is
  `{ light: "mavericks", dark: "mavericks-dark" }`: switch the system to dark appearance, or
  pick `mavericks-dark` in the theme menu, for a black terminal (Terminal.app Homebrew).
- `herdr-app shot` does not include the macOS system traffic lights (the system draws them
  above the layout), so they are missing from `preview.png`.
