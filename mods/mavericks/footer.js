// 侧栏底部的两个图标入口：Settings 与 Add machine，与工作区状态栏同高（22px）。

import { div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { run, layout, shared } from "herdr";
import { M, FONT, gradient, hairline, icon } from "./kit.js";

function find(node, id) {
  if (node?.id === id) return node;
  for (const child of node?.children ?? []) {
    const found = find(child, id);
    if (found) return found;
  }
  return null;
}

export default class Footer {
  init() {}

  render() {
    const width = find(layout(), "sidebar")?.size?.px ?? 220;
    const collapsed = width < 160;
    const button = (id, name, label, action) => h_flex()
      .id(id)
      .relative()
      .flex_none()
      .w(18)
      .h(18)
      .items_center()
      .justify_center()
      .rounded(3)
      .tooltip(label)
      .hover(s => s.bg("#d8d8d8"))
      .on_click(action)
      .child(icon(name, 12, M.textMuted));

    return h_flex()
      .id("mv-footer")
      .relative()
      .size_full()
      .px(4)
      .gap(2)
      .items_center()
      .font_family(FONT)
      .child(gradient(M.sidebarTop, M.sidebarBottom, 180))
      .child(hairline(M.hairline, "top"))
      // 收缩成图标轨后，这里是唯一露在底部的展开入口（brand 行被交通灯占满）。
      .when(collapsed, el => el.child(button("mv-expand", "sidebar", "Show Sidebar", () => {
        run("layout.resize", { id: "sidebar", px: shared("sidebar.width") ?? 220 });
      })))
      .child(button("mv-settings", "settings", "Settings", () => run("app.settings")))
      .child(button("mv-add-machine", "plus", "Add machine", () => run("mod.open", { name: "machine-add" })));
  }
}
