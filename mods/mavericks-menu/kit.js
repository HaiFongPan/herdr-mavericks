// OS X 10.9 Mavericks 的绘图工具：颜色、字体、Aqua 渐变、细线与按钮。
// 所有像素按布局 px 给，随 app 的 zoom 缩放（Herdr 自己缩放终端/字体）。

import { div, PathBuilder, Background, svg, image } from "gpui-kit";
import { h_flex, v_flex } from "gpui-base";
import { settings, theme } from "herdr";

export const FONT = "Helvetica Neue";
export const ASSETS = "mods/mavericks/assets";

// 10.9 的两套灰阶：浅色与深色外观各一份。窗口 chrome 用同一套阶调，
// 靠 1px 描边和渐变分层，所以只换主题色不够，得整套换。
const LIGHT = {
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
  tabHover: "#e2e2e2",
  tabCloseHover: "#d5d5d5",
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
  // Aqua 按钮：常态 / 选中态 / 内高光
  btnTop: "#f8f8f8",
  btnBottom: "#e6e6e6",
  btnBorder: "#b8b8b8",
  btnHover: "#ededed",
  btnOnTop: "#d6d6d6",
  btnOnBottom: "#bcbcbc",
  btnOnBorder: "#a8a8a8",
  btnOnHover: "#c9c9c9",
  highlight: "#ffffffcc",
  // pane 标题栏：聚焦深一点
  paneActiveTop: "#f2f2f2",
  paneActiveBottom: "#e4e4e4",
  paneIdleTop: "#f5f5f5",
  paneIdleBottom: "#ededed",
  paneButtonHover: "#dedede",
  paneBorder: "#a8a8a8",
  // 状态栏与侧栏底部
  statusTop: "#ededed",
  statusBottom: "#dedede",
  statusBorder: "#b0b0b0",
  footerHover: "#d8d8d8",
  // 菜单分隔线
  separator: "#d6d6d6",
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

// 深色外观：同一个 10.9 结构，阶调整体压暗；描边用深色而不是浅灰，
// 渐变上下只差 6-8 级，避免深色下显得脏。
const DARK = {
  titleTop: "#3c3c3c",
  titleBottom: "#2e2e2e",
  titleBorder: "#1a1a1a",
  titleText: "#ececec",
  titleTextInactive: "#8a8a8a",
  toolbarTop: "#424242",
  toolbarBottom: "#353535",
  toolbarBorder: "#1f1f1f",
  sidebarTop: "#3a3a3a",
  sidebarBottom: "#323232",
  sidebarBorder: "#252525",
  sidebarHeading: "#9a9a9a",
  tabBarTop: "#363636",
  tabBarBottom: "#2e2e2e",
  tabBarBorder: "#1f1f1f",
  tabActiveTop: "#4c4c4c",
  tabActiveBottom: "#424242",
  tabInactiveTop: "#3c3c3c",
  tabInactiveBottom: "#353535",
  tabBorder: "#5e5e5e",
  tabHover: "#474747",
  tabCloseHover: "#585858",
  canvas: "#262626",
  content: "#1e1e1e",
  text: "#eaeaea",
  textMuted: "#b3b3b3",
  textDim: "#838383",
  accent: "#4a86d8",
  accentDark: "#2b5cae",
  accentLight: "#5f97e4",
  selectedText: "#ffffff",
  rowHover: "#3b3b3b",
  rowActive: "#474747",
  btnTop: "#454545",
  btnBottom: "#383838",
  btnBorder: "#575757",
  btnHover: "#4c4c4c",
  btnOnTop: "#565656",
  btnOnBottom: "#464646",
  btnOnBorder: "#6a6a6a",
  btnOnHover: "#5d5d5d",
  highlight: "#ffffff17",
  paneActiveTop: "#4a4a4a",
  paneActiveBottom: "#3f3f3f",
  paneIdleTop: "#3f3f3f",
  paneIdleBottom: "#363636",
  paneButtonHover: "#4e4e4e",
  paneBorder: "#1d1d1d",
  statusTop: "#3a3a3a",
  statusBottom: "#2f2f2f",
  statusBorder: "#1e1e1e",
  footerHover: "#464646",
  separator: "#3a3a3a",
  hairline: "#2c2c2c",
  hairlineDark: "#1e1e1e",
  red: "#ff5f57",
  redBorder: "#e2463d",
  yellow: "#ffbd2e",
  yellowBorder: "#dea123",
  green: "#28c840",
  greenBorder: "#1aab29",
};

// #rrggbb 的感知亮度，0（黑）到 1（白）。
function luminance(hex) {
  const m = /^#?([0-9a-f]{6})/i.exec(String(hex ?? ""));
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

let picked = { key: null, palette: LIGHT };

/** 当前外观的 10.9 调色板：按生效主题 `chrome` 的亮度选浅色或深色。
 *  主题菜单换主题、系统换外观时，下一次 render 就会拿到新的那一套。 */
export function palette() {
  const t = theme() ?? {};
  const key = `${t.chrome ?? ""}|${t.foreground ?? ""}`;
  if (key !== picked.key) picked = { key, palette: luminance(t.chrome) > 0.5 ? LIGHT : DARK };
  return picked.palette;
}

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
  return svg(`${ASSETS}/icons/${name}.svg`).flex_none().w(size).h(size).text_color(color ?? palette().textMuted);
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
  const M = palette();
  const bgFrom = o.toggled ? M.btnOnTop : M.btnTop;
  const bgTo = o.toggled ? M.btnOnBottom : M.btnBottom;
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
    .border_color(o.toggled ? M.btnOnBorder : M.btnBorder)
    .hover(s => s.bg(o.toggled ? M.btnOnHover : M.btnHover))
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .child(gradient(bgFrom, bgTo, 180))
    .child(div().relative().flex().items_center().gap(5).text_size(11.5).text_color(text).child(content));
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
  const M = palette();
  let el = h_flex()
    .id(id)
    .relative()
    .h(22)
    .px(8)
    .items_center()
    .justify_center()
    .gap(5)
    .border_t(1)
    .border_b(1)
    .border_r(1)
    .border_color(M.toolbarBorder)
    .text_size(11.5)
    .text_color(o.active ? M.selectedText : M.text)
    .hover(s => s.bg(o.active ? undefined : M.btnHover))
    .on_mouse_down("left", (_e, cx) => cx.stop_propagation())
    .child(gradient(o.active ? M.accentLight : M.btnTop, o.active ? M.accentDark : M.btnBottom, 180))
    .child(div().relative().flex().items_center().gap(5).child(content))
    .on_click((_e, cx) => {
      cx.stopPropagation?.();
      onClick?.();
    });
  if (o.first) el = el.border_l(1).rounded_l(4);
  if (o.last) el = el.rounded_r(4);
  return el;
}

/** 一个小的交通灯（非 macOS 平台自绘窗口按钮时用）。 */
export function trafficLight(kind, onClick) {
  const M = palette();
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
  return el.font_family(FONT).text_size(12).text_color(palette().text);
}

/** zoom 与单位：设计按 zoom 1 写，Herdr 自己缩放布局。 */
export function zoom() {
  return Number(settings()?.zoom) || 1;
}
