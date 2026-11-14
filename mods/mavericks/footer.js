// 侧栏底部的两个入口：Settings 与 Add machine。
// 侧栏收成图标轨时只显示图标（宽度看 layout 的 sidebar 节点）。

import { div, svg } from "gpui-kit";
import { h_flex } from "gpui-base";
import { run, layout } from "herdr";
import { M, FONT, gradient, hairline, icon } from "./kit.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

const narrow = () => (find(layout(), "sidebar")?.size?.px ?? Infinity) < 160;

export default class Footer {
  init() {}

  render() {
    const collapsed = narrow();
    const row = (id, glyph, label, action) => h_flex()
      .id(id)
      .relative()
      .h(24)
      .px(collapsed ? 0 : 8)
      .gap(8)
      .items_center()
      .rounded(4)
      .when(collapsed, el => el.w(24).justify_center().tooltip(label))
      .hover(s => s.bg("#dcdcdc"))
      .on_click(action)
      .child(glyph)
      .when(!collapsed, el => el.child(div().text_size(12).text_color(M.textMuted).child(label)));

    return h_flex()
      .id("mv-footer")
      .relative()
      .size_full()
      .px(collapsed ? 4 : 8)
      .gap(4)
      .items_center()
      .font_family(FONT)
      .child(gradient(M.sidebarTop, M.sidebarBottom, 180))
      .child(hairline(M.hairline, "top"))
      .child(div().relative().flex_1().flex().gap(4).items_center()
        .child(row("mv-settings", icon("settings", 13, M.textMuted), "Settings", () => run("app.settings")))
        .child(row("mv-add-machine", icon("plus", 13, M.textMuted), "Add machine", () => run("mod.open", { name: "machine-add" }))));
  }
}
