// 每个 pane 的标题栏（layout 的 pane.header）：10.9 窗口标题栏的缩小版。
// 聚焦时是浅灰渐变 + 深色标题，失焦时更淡。左边图标与标题，右边文件夹；
// 悬停时露出分屏、缩放、关闭按钮。

import { div, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { panes, props, run, layout, home, theme } from "herdr";
import { palette, FONT, gradient, hairline, icon } from "./kit.js";

function paneFrame(node) {
  if (!node || node.hidden) return null;
  if (node.content?.tab && node.content.pane) return node.content.pane;
  let children = node.children ?? [];
  if (node.type === "stack") {
    const visible = children.filter(child => !child.hidden);
    children = [visible.find(child => child.id === node.active) ?? visible[0]];
  }
  for (const child of children) {
    const frame = paneFrame(child);
    if (frame) return frame;
  }
  return null;
}

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Pane {
  init() { this.hovered = false; }

  me() {
    return panes().find(p => p.pane === props()?.pane);
  }

  render() {
    const t = theme(), M = palette();
    const p = this.me();
    if (!p) return div();
    const pane = p.pane;
    const bottom = paneFrame(layout())?.header?.position === "bottom";
    const name = p.mod
      ? p.title || p.mod
      : (p.program?.agent || p.program?.shell) && p.program.name
        ? p.program.name
        : p.title || p.program?.name || "shell";
    const on = Boolean(p.focused);
    const pic = p.program?.icon
      ? p.program.tint
        ? svg(p.program.icon).flex_none().w(12).h(12).text_color(on ? M.textMuted : M.textDim)
        : image(p.program.icon).flex_none().w(12).h(12)
      : icon("terminal", 12, on ? M.textMuted : M.textDim);

    const button = (id, name_, command, args, tooltip) => div()
      .id(id)
      .w(18)
      .h(18)
      .flex_none()
      .flex()
      .items_center()
      .justify_center()
      .rounded(4)
      .hover(s => s.bg(M.paneButtonHover))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
      .on_click((_e, cx) => { cx.stopPropagation(); run(command, args); })
      .tooltip(tooltip)
      .child(icon(name_, 12, M.textMuted));

    return h_flex()
      .id(`mv-pane-${pane}`)
      .relative()
      .size_full()
      .px(8)
      .gap(6)
      .items_center()
      .text_size(11.5)
      .font_family(FONT)
      .when(!bottom, el => el.border_b(1))
      .when(bottom, el => el.border_t(1))
      .border_color(M.paneBorder)
      .child(gradient(on ? M.paneActiveTop : M.paneIdleTop, on ? M.paneActiveBottom : M.paneIdleBottom, 180))
      .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
      .on_click(() => run("pane.focus", { pane }))
      .on_hover((hovered, cx) => { this.hovered = hovered; cx.notify(); })
      .child(div().relative().flex().items_center().gap(6).min_w(0).flex_none().child(pic))
      .child(div().relative().flex_none().max_w(320).truncate().font_medium().text_color(on ? M.text : M.textDim).child(name))
      .child(div().relative().flex_1().min_w(0).truncate().text_color(on ? M.textMuted : M.textDim).child(folder(p.cwd)))
      .when(p.status === "working", el => el.child(svg("mods/workspace-chrome/spinner.svg").flex_none().w(11).h(11).text_color(t.working).spin(900)))
      .when(p.status === "blocked", el => el.child(div().relative().flex_none().w(7).h(7).rounded(4).bg(t.blocked)))
      .when(p.status === "done", el => el.child(div().relative().flex_none().w(7).h(7).rounded(4).bg(t.done)))
      .when(this.hovered, el => el
        .child(button(`mv-ph-r-${pane}`, "split-right", "pane.split", { direction: "right", pane }, "向右分屏"))
        .child(button(`mv-ph-d-${pane}`, "split-down", "pane.split", { direction: "down", pane }, "向下分屏"))
        .child(button(`mv-ph-z-${pane}`, "zoom", "pane.zoom", { pane }, "缩放"))
        .child(button(`mv-ph-x-${pane}`, "close", "pane.close", { pane }, "关闭")));
  }
}
