// 统一工具栏（layout 的 chrome block，window_drag）：10.9 的一行 chrome。
// 左边是系统交通灯的空位，紧接着一组视图控件（侧栏、分屏、查找），
// 中间是居中的窗口标题，右边是新建与面板开关。

import { div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, run, openOverlay, layout, window as appWindow } from "herdr";
import { M, FONT, gradient, hairline, icon, segment, toolbarButton, ui } from "./kit.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

function tabName(space) {
  if (!space) return "";
  const tabs = space.tabs ?? [];
  const active = tabs.find(c => c.active);
  if (!active || tabs.length === 1) return "";
  return /^tb\d+$/.test(active.name) ? `标签 ${tabs.indexOf(active) + 1}` : active.name;
}

export default class Chrome {
  init() {}

  render() {
    const root = layout();
    const space = spaces().find(p => p.active);
    const w = appWindow();
    const title = [space?.name, tabName(space)].filter(Boolean).join(" — ") || "Herdr";
    const sidebar = find(root, "sidebar");
    const sidebarOn = sidebar && !sidebar.hidden;
    const panel = find(root, "panel");
    const panelBody = find(root, "panel-body");
    const panelOn = id => panel && !panel.hidden && panelBody?.active === id;
    const mac = w?.platform === "macos";
    const lightsInset = mac && !w.fullscreen ? 78 : 10;

    const group = (...els) => h_flex().relative().flex_none().gap(2).items_center().children(els);

    return h_flex()
      .id("mv-chrome")
      .relative()
      .size_full()
      .items_center()
      .font_family(FONT)
      .pl(lightsInset)
      .pr(10)
      .gap(8)
      .child(gradient(M.titleTop, M.titleBottom, 180))
      .child(hairline(M.titleBorder, "bottom"))
      .child(group(
        toolbarButton("mv-sidebar", icon("sidebar", 14, M.textMuted), () => run("layout.toggle", { id: "sidebar" }), {
          toggled: Boolean(sidebarOn),
          tooltip: "Toggle Sidebar",
        }),
      ))
      .child(h_flex().relative().flex_none().w(1).h(20).bg("#c2c2c2"))
      .child(
        div()
          .relative()
          .flex_1()
          .min_w(0)
          .flex()
          .justify_center()
          .child(
            div()
              .truncate()
              .text_size(12.5)
              .font_medium()
              .text_color(w?.active === false ? M.titleTextInactive : M.titleText)
              .child(title),
          ),
      )
      .when(panel, el => el.child(group(
        toolbarButton("mv-files", [icon("files", 14, panelOn("files") ? "#ffffff" : M.textMuted), ui(div()).child("Files")], () => {
          if (panelOn("files")) run("layout.hide", { id: "panel" });
          else {
            run("layout.select", { stack: "panel-body", child: "files" });
            run("layout.show", { id: "panel" });
          }
        }, { toggled: Boolean(panelOn("files")), tooltip: "Files" }),
        toolbarButton("mv-changes", [icon("changes", 14, panelOn("changes") ? "#ffffff" : M.textMuted), ui(div()).child("Changes")], () => {
          if (panelOn("changes")) run("layout.hide", { id: "panel" });
          else {
            run("layout.select", { stack: "panel-body", child: "changes" });
            run("layout.show", { id: "panel" });
          }
        }, { toggled: Boolean(panelOn("changes")), tooltip: "Changes" }),
      )))
      .child(group(
        segment("mv-split-right", icon("split-right", 14, M.textMuted), () => run("pane.split", { direction: "right" }), { first: true, tooltip: "Split Right" }),
        segment("mv-split-down", icon("split-down", 14, M.textMuted), () => run("pane.split", { direction: "down" }), { last: true, tooltip: "Split Down" }),
        toolbarButton("mv-search", icon("search", 14, M.textMuted), () => run("terminal.search"), { tooltip: "Find in Terminal" }),
        toolbarButton("mv-new-tab", icon("plus", 14, M.text), () => openOverlay({ mod: "new-menu", kind: "popup", width: 250, height: 512 }), {
          tooltip: "New Tab",
        }),
      ));
  }
}
