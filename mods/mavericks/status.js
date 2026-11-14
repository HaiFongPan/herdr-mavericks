// 底部状态栏：左边是当前 pane 的位置与分支，右边是标签数和 agent 状态汇总。
// 10.9 的灰色小字状态条。

import { div } from "gpui-kit";
import { h_flex } from "gpui-base";
import { spaces, panes, agents, focused, home, theme, run } from "herdr";
import { M, FONT, gradient, hairline, icon } from "./kit.js";

function folder(cwd) {
  if (!cwd) return "";
  const h = home();
  return cwd === h ? "~" : cwd.startsWith(h + "/") ? "~" + cwd.slice(h.length) : cwd;
}

export default class Status {
  init() {}

  render() {
    const t = theme();
    const f = focused();
    const p = panes().find(x => x.pane === f?.pane);
    const space = spaces().find(s => s.active);
    const counts = { working: 0, blocked: 0, done: 0 };
    for (const a of agents()) if (a.space === space?.id && counts[a.status] !== undefined) counts[a.status]++;
    const tabs = space?.tabs?.length ?? 0;
    const where = p ? [folder(p.cwd), p.branch].filter(Boolean).join("  ·  ") : "";

    const bit = (label, color) => h_flex()
      .relative()
      .flex_none()
      .gap(4)
      .items_center()
      .child(div().flex_none().w(6).h(6).rounded(3).bg(color))
      .child(div().text_color(M.textMuted).child(label));

    const action = (id, name, label, cmd) => h_flex()
      .id(id)
      .relative()
      .flex_none()
      .w(18)
      .h(16)
      .items_center()
      .justify_center()
      .rounded(3)
      .tooltip(label)
      .hover(s => s.bg("#d8d8d8"))
      .on_click(cmd)
      .child(icon(name, 11, M.textMuted));

    return h_flex()
      .id("mv-status")
      .relative()
      .size_full()
      .px(10)
      .gap(10)
      .items_center()
      .font_family(FONT)
      .text_size(10.5)
      .child(gradient("#ededed", "#dedede", 180))
      .child(hairline("#b0b0b0", "top"))
      .child(action("mv-settings", "settings", "Settings", () => run("app.settings")))
      .child(action("mv-add-machine", "plus", "Add machine", () => run("mod.open", { name: "machine-add" })))
      .child(hairline("#c0c0c0", "left"))
      .child(div().relative().flex_none().w(13).h(13).child(icon("terminal", 12, M.textDim)))
      .child(div().relative().flex_1().min_w(0).truncate().text_color(M.textMuted).child(where || (space?.name ?? "")))
      .child(div().relative().flex_none().text_color(M.textDim).child(`${tabs} ${tabs === 1 ? "tab" : "tabs"}`))
      .when(counts.working > 0, el => el.child(bit(String(counts.working), t.working)))
      .when(counts.blocked > 0, el => el.child(bit(String(counts.blocked), t.blocked)))
      .when(counts.done > 0, el => el.child(bit(String(counts.done), t.done)));
  }
}
