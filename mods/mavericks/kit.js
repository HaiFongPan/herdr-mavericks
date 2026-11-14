// OS X 10.9 Mavericks 的绘图工具：颜色、字体、Aqua 渐变、细线与按钮。
// 所有像素按布局 px 给，随 app 的 zoom 缩放（Herdr 自己缩放终端/字体）。

import { div, PathBuilder, Background, svg, image } from "gpui-kit";
import { h_flex } from "gpui-base";
import { settings } from "herdr";

export const FONT = "Helvetica Neue";
export const ASSETS = "mods/mavericks/assets";

// 10.9 的浅色调色板。窗口 chrome 是同一套灰阶，靠 1px 深色描边分层。
export const M = {
  // 标题栏与工具栏
  titleTop: "#efefef",
  titleBottom: "#d9d9d9",
  titleBorder: "#9a9a9a",
  titleText: "#2a2a2a",
  titleTextInactive: "#8a8a8a",
  toolbarTop: "#f8f8f8",
  toolbarBottom: "#e2e2e2",
  toolbarBorder: "#b0b0b0",
  // 侧栏
  sidebarTop: "#ededed",
  sidebarBottom: "#e3e3e3",
  sidebarBorder: "#c5c5c5",
  sidebarHeading: "#717171",
  // 标签栏
  tabBarTop: "#dcdcdc",
  tabBarBottom: "#cfcfcf",
  tabBarBorder: "#adadad",
  tabActiveTop: "#f6f6f6",
  tabActiveBottom: "#ededed",
  tabInactiveTop: "#d9d9d9",
  tabInactiveBottom: "#d0d0d0",
  tabBorder: "#a5a5a5",
  // 内容
  canvas: "#e9e9e9",
  content: "#ffffff",
  // 文字
  text: "#262626",
  textMuted: "#5f5f5f",
  textDim: "#8d8d8d",
  // 选中与强调（10.9 的系统蓝）
  accent: "#3f7fd6",
  accentDark: "#2c62b8",
  accentLight: "#6fa8e8",
  selectedText: "#ffffff",
  rowHover: "#d9d9d9",
  rowActive: "#c9c9c9",
  // 分隔
  hairline: "#c6c6c6",
  hairlineDark: "#a8a8a8",
  // 交通灯（非 macOS 时自绘）
  red: "#ff5f57",
  redBorder: "#e2463d",
  yellow: "#ffbd2e",
  yellowBorder: "#dea123",
  green: "#28c840",
  greenBorder: "#1aab29",
};

/** 一个 UI 文本元素：Mavericks 的 Helvetica Neue，12px。 */
export function ui(el) {
  return el.font_family(FONT).text_size(12);
}

const RECT = () =>
  PathBuilder.fill().move_to("0%", "0%").line_to("100%", "0%").line_to("100%", "100%").line_to("0%", "100%").close().build();

/** 铺满父级（父级要 relative）的线性渐变，默认自上而下。 */
export function gradient(from, to, angle = 180) {
  return window.paint_path(RECT(), Background.linear_gradient(angle, from, to)).absolute().top(0).left(0).size_full();
}

/** 一条 1px 的边，side: top | bottom | left | right。 */
export function hairline(color, side = "bottom") {
  let el = div().absolute().bg(color);
  if (side === "top") el = el.top(0).left(0).w_full().h(1);
  else if (side === "bottom") el = el.bottom(0).left(0).w_full().h(1);
  else if (side === "left") el = el.left(0).top(0).h_full().w(1);
  else el = el.right(0).top(0).h_full().w(1);
  return el;
}

/** 取一个 mod 图标：单色线稿，用 text_color 上色。 */
export function icon(name, size = 14, color) {
  return svg(`${ASSETS}/icons/${name}.svg`).flex_none().w(size).h(size).text_color(color ?? M.textMuted);
}

/** 取一张位图/SVG 原图（全彩）。 */
export function picture(path, size = 14) {
  return image(path).flex_none().w(size).h(size);
}

/**
 * Aqua 的工具栏按钮：浅色渐变胶囊 + 1px 描边，按下变深。
 * o: { toggled（选中态）、disabled、pad、tooltip、bg }
 */
export function toolbarButton(id, content, onClick, o = {}) {
  const bgFrom = o.toggled ? "#d6d6d6" : M.toolbarTop;
  const bgTo = o.toggled ? "#bcbcbc" : "#e6e6e6";
  const text = M.text;
  let el = h_flex()
    .id(id)
    .relative()
    .flex_none()
    .h(22)
    .px(o.pad?.[1] ?? 7)
    .py(o.pad?.[0] ?? 0)
    .gap(5)
    .items_center()
    .rounded(4)
    .border(1)
    .border_color(o.toggled ? "#a8a8a8" : "#b8b8b8")
    .hover(s => s.bg(o.toggled ? "#c9c9c9" : "#ededed"))
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .child(gradient(bgFrom, bgTo, 180))
    .child(div().absolute().top(0).left(0).right(0).h(1).bg("#ffffffcc"))
    .child(div().relative().flex().items_center().gap(5).text_size(11.5).text_color(text).children(Array.isArray(content) ? content : [content]));
  if (o.disabled) el = el.opacity(0.45);
  else el = el.cursor_pointer().on_click((_e, cx) => {
    cx.stop_propagation();
    onClick?.();
  });
  if (o.tooltip) el = el.tooltip(o.tooltip);
  return el;
}

/** 分段控件（10.9 的 segmented control）里的一个格子。 */
export function segment(id, content, onClick, o = {}) {
  let el = h_flex()
    .id(id)
    .relative()
    .flex_none()
    .h(22)
    .px(7)
    .items_center()
    .justify_center()
    .gap(5)
    .border_t(1)
    .border_b(1)
    .border_r(1)
    .border_color("#b0b0b0")
    .text_size(11.5)
    .text_color(M.text)
    .when(!o.active, el2 => el2.hover(s => s.bg("#ededed")))
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .child(gradient(o.active ? "#d6d6d6" : "#fbfbfb", o.active ? "#bcbcbc" : "#e4e4e4", 180))
    .child(div().relative().flex().items_center().gap(5).child(content))
    .on_click((_e, cx) => {
      cx.stop_propagation();
      onClick?.();
    });
  if (o.first) el = el.border_l(1).rounded_l(4);
  if (o.last) el = el.rounded_r(4);
  return el;
}

/** 一个小的交通灯（非 macOS 平台自绘窗口按钮时用）。 */
export function trafficLight(kind, onClick) {
  const fill = kind === "close" ? M.red : kind === "minimize" ? M.yellow : M.green;
  const ring = kind === "close" ? M.redBorder : kind === "minimize" ? M.yellowBorder : M.greenBorder;
  return h_flex()
    .id(`tl-${kind}`)
    .w(12)
    .h(12)
    .rounded(6)
    .border(1)
    .border_color(ring)
    .bg(fill)
    .items_center()
    .justify_center()
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .on_click(() => onClick?.());
}

/** 应用到任何 role 根节点的字体与基线字号。 */
export function root(el) {
  return el.font_family(FONT).text_size(12).text_color(M.text);
}

/** zoom 与单位：设计按 zoom 1 写，Herdr 自己缩放布局。 */
export function zoom() {
  return Number(settings()?.zoom) || 1;
}
