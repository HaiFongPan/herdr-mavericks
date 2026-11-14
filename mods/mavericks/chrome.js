// 统一工具栏（layout 的 chrome block，window_drag）：10.9 Safari 式的一行 chrome。
// 最左是系统交通灯的空位，接着侧栏开关，中间是标签页，右边是 Files / Changes、
// 分屏、查找和新建。整行可拖动窗口，按钮和标签按下时 stop_propagation。

import { div, svg, image } from "gpui-kit";
import { h_flex, ScrollHandle } from "gpui-base";
import { spaces, panes, run, openOverlay, layout, theme } from "herdr";
import { M, FONT, gradient, hairline, icon, segment, toolbarButton, ui } from "./kit.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class Chrome {
  init() {
    this.scroll = ScrollHandle.new();
    this.pressed = null;
    this.hovered = null;
    this.selected = undefined;
  }

  // 一个标签：活动是白色圆角卡片，其余透明；关闭按钮与状态槽固定占位。
  tab(space, shown, active, c, i) {
    const stop = (_e, cx) => cx.stop_propagation();
    const t = theme();
    const program = panes().find(p => p.tab === c.id && p.program?.agent)?.program ?? panes().find(p => p.tab === c.id)?.program;
    const name = /^tb\d+$/.test(c.name) ? program?.name ?? "Terminal" : c.name;
    const on = c.active;
    const hot = this.hovered === c.id;
    return h_flex()
      .id(`mv-tab-${c.id}`)
      .relative()
      .h(26)
      .px(9)
      .gap(6)
      .rounded(5)
      .items_center()
      .flex_none()
      .border(1)
      .border_color(on ? M.tabBorder : "#00000000")
      .text_size(11.5)
      .font_family(FONT)
      .text_color(on ? M.text : M.textMuted)
      .when(on, el => el.child(gradient(M.tabActiveTop, M.tabActiveBottom, 180).shadow_xs()))
      .when(!on, el => el.hover(s => s.bg("#e2e2e2")))
      .when(i <= active, el => el.on_size_change((_size, cx) => { this.scroll.scroll_to_item(active); cx.notify(); }))
      .on_mouse_down("left", (e, cx) => {
        cx.stop_propagation();
        this.pressed = i;
        if (e.click_count === 2) run("tab.rename", { id: c.id });
      })
      .on_mouse_up("left", () => {
        const from = this.pressed;
        this.pressed = null;
        if (from !== null && from !== i) run("tab.move", { id: shown[from].id, index: space.tabs.findIndex(x => x.id === c.id) + 1 });
        else run("tab.select", { id: c.id });
      })
      .on_mouse_down("right", (_e, cx) => {
        cx.stop_propagation();
        openOverlay({ mod: "mavericks-menu", kind: "popup", width: 210, props: { tab: "tab", target: { id: c.id, space: space.id } } });
      })
      .on_hover((inside, cx) => {
        const want = inside ? c.id : this.hovered === c.id ? null : this.hovered;
        if (want !== this.hovered) { this.hovered = want; cx.notify(); }
      })
      .child(
        div()
          .relative()
          .flex()
          .items_center()
          .gap(6)
          .child(
            program?.icon
              ? program.tint
                ? svg(program.icon).flex_none().w(13).h(13).text_color(on ? M.textMuted : M.textDim)
                : image(program.icon).flex_none().w(13).h(13)
              : icon("terminal", 13, on ? M.textMuted : M.textDim),
          )
          .child(div().max_w(170).truncate().child(c.zoomed ? `${name} ⌃` : name))
          .child(div()
            .relative()
            .flex_none()
            .w(12)
            .h(12)
            .flex()
            .items_center()
            .justify_center()
            .when(c.status === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").w(11).h(11).text_color(t.working).spin(900)))
            .when(c.status === "blocked" || c.status === "done", el => el.child(div().w(6).h(6).rounded(3).bg(c.status === "blocked" ? t.blocked : t.done))))
          .child(div()
            .id(`mv-close-${c.id}`)
            .relative()
            .flex_none()
            .w(13)
            .h(13)
            .flex()
            .items_center()
            .justify_center()
            .rounded(3)
            .when(on || hot, el => el.hover(s => s.bg("#d5d5d5")))
            .on_mouse_down("left", stop)
            .on_click((_e, cx) => { cx.stopPropagation(); run("tab.close", { id: c.id }); })
            .child(icon("close", 9, on || hot ? M.textDim : "#00000000"))),
      );
  }

  tabsRow() {
    const space = spaces().find(p => p.active);
    const shown = space?.tabs ?? [];
    const active = shown.findIndex(c => c.active);
    const selected = shown[active]?.id;
    if (selected !== this.selected || active !== this.selectedIndex) {
      this.selected = selected;
      this.selectedIndex = active;
      if (active >= 0) this.scroll.scroll_to_item(active);
    }
    return h_flex()
      .id("mv-tabs")
      .relative()
      .flex_1()
      .min_w(0)
      .h_full()
      .items_center()
      .gap(3)
      .px(2)
      .overflow_x_scrollbar()
      .track_scroll(this.scroll)
      .on_size_change((_size, cx) => { if (active >= 0) { this.scroll.scroll_to_item(active); cx.notify(); } })
      .on_scroll_wheel(e => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
      .on_mouse_up("left", () => { this.pressed = null; })
      .children(shown.map((c, i) => this.tab(space, shown, active, c, i)));
  }

  render() {
    const root = layout();
    const panel = find(root, "panel");
    const panelBody = find(root, "panel-body");
    const panelOn = id => panel && !panel.hidden && panelBody?.active === id;


    const group = (...els) => h_flex().relative().flex_none().gap(2).items_center().children(els);

    return h_flex()
      .id("mv-chrome")
      .relative()
      .size_full()
      .items_center()
      .font_family(FONT)
      .pl(8)
      .pr(8)
      .gap(6)
      .child(gradient(M.titleTop, M.titleBottom, 180))
      .child(hairline(M.titleBorder, "bottom"))
      .child(this.tabsRow())
      .when(panel, el => el.child(group(
        toolbarButton("mv-files", [icon("files", 14, panelOn("files") ? M.text : M.textMuted), ui(div()).child("Files")], () => {
          if (panelOn("files")) run("layout.hide", { id: "panel" });
          else {
            run("layout.select", { stack: "panel-body", child: "files" });
            run("layout.show", { id: "panel" });
          }
        }, { toggled: Boolean(panelOn("files")), tooltip: "Files" }),
        toolbarButton("mv-changes", [icon("changes", 14, panelOn("changes") ? M.text : M.textMuted), ui(div()).child("Changes")], () => {
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
