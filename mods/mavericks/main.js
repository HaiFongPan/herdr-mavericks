// Herdr · Mavericks 10.9：整套布局由这个 mod 的若干 role 画成。
// layout 与 overlay 通过 props { role } 指定：
//   chrome  窗口标题栏 + Aqua 工具栏
//   tabs    Safari 式标签栏
//   pane    每个 pane 的标题栏
//   status  底部状态条

import { View, div } from "gpui-kit";
import { props } from "herdr";
import Chrome from "./chrome.js";
import Tabs from "./tabs.js";
import Pane from "./pane.js";
import Status from "./status.js";

const ROLES = { chrome: Chrome, tabs: Tabs, pane: Pane, status: Status };

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
