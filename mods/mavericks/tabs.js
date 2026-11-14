// 标签栏：10.9 Safari 式圆角标签，浅灰条 + 活动标签亮起。
// 点击切换、双击改名、拖动排序、右键菜单、滚轮切上一个/下一个。

import { View, div, svg, image } from "gpui-kit";
import { h_flex, ScrollHandle } from "gpui-base";
import { spaces, panes, run, openOverlay, theme, settings } from "herdr";
import { M, FONT, gradient, hairline, icon } from "./kit.js";

export default class Tabs {
  init() {
    this.pressed = null;
    this.scroll = ScrollHandle.new();
  }

  render() {
    const t = theme();
    const space = spaces().find(p => p.active);
    const shown = space?.tabs ?? [];
    const active = shown.findIndex(c => c.active);
    const selected = shown[active]?.id;
    if (selected !== this.selected || active !== this.selectedIndex) {
      this.selected = selected;
      this.selectedIndex = active;
      if (active >= 0) this.scroll.scroll_to_item(active);
    }
    const stop = (_e, cx) => cx.stop_propagation();

    const item = (c, i) => {
      const program = panes().find(p => p.tab === c.id && p.program?.agent)?.program ?? panes().find(p => p.tab === c.id)?.program;
      const name = /^tb\d+$/.test(c.name) ? program?.name ?? "Terminal" : c.name;
      const on = c.active;
      return h_flex()
        .id(`tab-${c.id}`)
        .relative()
        .h(25)
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
          cx.stopPropagation?.();
          openOverlay({ mod: "mavericks-menu", kind: "popup", width: 210, props: { tab: "tab", target: { id: c.id, space: space.id } } });
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
            // 固定 12px 的状态槽：转圈、状态点或空着，标签宽度不随状态跳动。
            .child(div()
              .relative()
              .flex_none()
              .w(12)
              .h(12)
              .flex()
              .items_center()
              .justify_center()
              .when(c.status === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").w(11).h(11).text_color(t.working).spin(900)))
              .when(c.status === "blocked" || c.status === "done", el => el.child(div().w(6).h(6).rounded(3).bg(t[c.status]))))
            // 关闭按钮始终占位，只切换可见度，避免悬停时标签变宽。
            .child(div()
              .id(`close-${c.id}`)
              .relative()
              .flex_none()
              .w(13)
              .h(13)
              .flex()
              .items_center()
              .justify_center()
              .rounded(3)
              .when(on || this.hovered === c.id, el => el.hover(s => s.bg("#d5d5d5")))
              .on_mouse_down("left", stop)
              .on_click((_e, cx) => { cx.stopPropagation(); run("tab.close", { id: c.id }); })
              .child(icon("close", 9, on || this.hovered === c.id ? M.textDim : "#00000000"))),
        )
        .on_hover((on2, cx) => {
          const want = on2 ? c.id : this.hovered === c.id ? null : this.hovered;
          if (want !== this.hovered) { this.hovered = want; cx.notify(); }
        });
    };

    return h_flex()
      .id("mv-tabbar")
      .relative()
      .size_full()
      .min_w(0)
      .px(8)
      .gap(3)
      .items_center()
      .font_family(FONT)
      .child(gradient(M.tabBarTop, M.tabBarBottom, 180))
      .child(hairline(M.tabBarBorder, "bottom"))
      .child(
        h_flex()
          .id("tab-scroll")
          .relative()
          .flex_1()
          .min_w(0)
          .h_full()
          .items_center()
          .gap(3)
          .overflow_x_scrollbar()
          .track_scroll(this.scroll)
          .on_size_change((_size, cx) => { if (active >= 0) { this.scroll.scroll_to_item(active); cx.notify(); } })
          .on_scroll_wheel(e => { if (Math.abs(e.delta.y) >= 1) run(e.delta.y > 0 ? "tab.prev" : "tab.next"); })
          .on_mouse_up("left", () => { this.pressed = null; })
          .children(shown.map(item)),
      );
  }
}
