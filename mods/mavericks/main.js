// Herdr · Mavericks 10.9：整套布局由这个 mod 的若干 role 画成。
// layout 与 overlay 通过 props { role } 指定：
//   chrome  统一工具栏：交通灯位 + 侧栏开关 + 标签页 + Files/Changes/分屏/查找/新建
//   pane    每个 pane 的标题栏
//   status  底部状态条（含 Settings / Add machine）

import { View, div } from "gpui-kit";
import { props } from "herdr";
import Chrome from "./chrome.js";
import Pane from "./pane.js";
import Status from "./status.js";

const ROLES = { chrome: Chrome, pane: Pane, status: Status };

export default class Mavericks extends View {
  init(p, cx) {
    const pr = props() ?? p ?? {};
    const R = ROLES[pr.role];
    this.role = R ? new R() : null;
    this.role?.init?.(pr, cx);
  }

  render(cx) {
    if (!this.role) return div().child(`mavericks: no role "${props()?.role}"`);
    return this.role.render(cx);
  }
}
