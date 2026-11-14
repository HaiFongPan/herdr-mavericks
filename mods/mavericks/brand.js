// 侧栏顶部：macOS 的交通灯留白 + 应用名 + 靠右的侧栏收缩按钮。
// 侧栏贯通到窗口底部，所以交通灯落在这里，而不是工具栏那一行。

import { div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { run, layout, shared, setShared, window as appWindow } from "herdr";
import { M, FONT, gradient, hairline, icon } from "./kit.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class Brand {
  init() {}

  render() {
    const w = appWindow();
    const sidebar = find(layout(), "sidebar");
    const width = sidebar?.size?.px ?? 220;
    const collapsed = width < 160;
    const mac = w?.platform === "macos" && !w.fullscreen;
    const lights = mac ? 76 : 8;

    const toggle = () => {
      const wide = width >= 160;
      if (wide) setShared("sidebar.width", width);
      run("layout.resize", { id: "sidebar", px: wide ? (mac ? 76 : 44) : (shared("sidebar.width") ?? 220) });
    };

    return h_flex()
      .id("mv-brand")
      .relative()
      .size_full()
      .font_family(FONT)
      .pl(lights)
      .pr(6)
      .gap(4)
      .items_center()
      .child(gradient(M.sidebarTop, M.sidebarBottom, 180))
      .child(hairline(M.hairline, "bottom"))
      .child(div().relative().flex_1().min_w(0).truncate().text_size(12).font_semibold().text_color(M.text).child(collapsed ? "" : "Herdr"))
      .when(!(collapsed && mac), el => el.child(
        h_flex()
          .id("mv-sidebar-toggle")
          .relative()
          .flex_none()
          .w(20)
          .h(18)
          .items_center()
          .justify_center()
          .rounded(3)
          .tooltip(collapsed ? "Show Sidebar" : "Hide Sidebar")
          .hover(s => s.bg("#dcdcdc"))
          .on_click(toggle)
          .child(icon("sidebar", 13, M.textMuted)),
      ));
  }
}
