// Herdr · Mavericks 10.9：整套布局由这个 mod 的若干 role 画成。
// layout 与 overlay 通过 props { role } 指定：
//   brand   侧栏顶部：交通灯位 + 应用名 + 收缩按钮
//   chrome  工作区顶部工具栏：标签页 + Files/Changes/分屏/查找/新建
//   pane    每个 pane 的标题栏
//   status  工作区底部状态条
//   footer  侧栏底部的 Settings / Add machine

import { View, div } from "gpui-kit";
import { props } from "herdr";
import { watchAppearance } from "./kit.js";
import Chrome from "./chrome.js";
import Pane from "./pane.js";
import Status from "./status.js";
import Brand from "./brand.js";
import Footer from "./footer.js";

const ROLES = { chrome: Chrome, pane: Pane, status: Status, brand: Brand, footer: Footer };

export default class Mavericks extends View {
  init(p, cx) {
    const pr = props() ?? p ?? {};
    const R = ROLES[pr.role];
    this.role = R ? new R() : null;
    this.role?.init?.(pr, cx);
    watchAppearance(cx);
  }

  render(cx) {
    if (!this.role) return div().child(`mavericks: no role "${props()?.role}"`);
    return this.role.render(cx);
  }
}
