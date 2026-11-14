// 10.9 风格的上下文菜单：无图标、行高 22、系统蓝选中。
// 弹出方式与 shipped menu 相同：props { tab: "pane" | "tab" | "space" | "global", target }。

import { View, div } from "gpui-kit";
import { v_flex, h_flex } from "gpui-base";
import { run, props, closeOverlay, openOverlay, theme, keys, terminals, spaces, panes, exec } from "herdr";
import { M, FONT, gradient } from "./kit.js";

function place(s) {
  const tabs = new Set((s.tabs ?? []).map(c => c.id));
  return panes().find(p => tabs.has(p.tab) && p.cwd)?.cwd || s.folder;
}

async function checkout(folder, on) {
  const top = await exec("git", ["rev-parse", "--show-toplevel"], { cwd: folder, on });
  const common = await exec("git", ["rev-parse", "--path-format=absolute", "--git-common-dir"], { cwd: folder, on });
  if (top.code !== 0 || common.code !== 0) return null;
  return common.stdout.trim() === `${top.stdout.trim()}/.git` ? "main" : "linked";
}

function items(p, git) {
  p = p ?? {};
  const tg = p.target ?? {};
  switch (p.tab) {
    case "pane": {
      const all = terminals();
      const term = all.find(t => t.address === tg.terminal);
      const parent = term?.parent && all.find(t => t.address === term.parent);
      const toProgram = term?.labels?.["herdr.right-click"] === "program";
      const inTab = panes().some(pane => pane.pane === tg.pane);
      return [
        ...(inTab
          ? [
              ["向右分屏", "pane.split", { direction: "right", pane: tg.pane }],
              ["向下分屏", "pane.split", { direction: "down", pane: tg.pane }],
              ["缩放", "pane.zoom", { pane: tg.pane }],
            ]
          : []),
        ...(term
          ? [
              toProgram
                ? ["使用 Herdr 右键菜单", "terminal.right_click", { terminal: term.address, to: "menu" }]
                : ["把右键送给终端", "terminal.right_click", { terminal: term.address, to: "program" }],
            ]
          : []),
        ...(parent ? [[`送回 ${parent.name || parent.address}`, "terminal.park", { terminal: term.address }]] : []),
        ...(inTab ? [["关闭面板", "pane.close", { pane: tg.pane }]] : []),
      ];
    }
    case "tab":
      return [
        ["重命名", "tab.rename", { id: tg.id }],
        ["新建标签页", "tab.new", { space: tg.space }],
        ["关闭", "tab.close", { id: tg.id }],
      ];
    case "space":
      return [
        ["重命名", "space.rename", { id: tg.id }],
        ...(git ? [["新建 worktree", "worktree", { space: tg.id, action: "new" }], ["打开 worktree", "worktree", { space: tg.id, action: "open" }]] : []),
        ...(git === "linked" ? [["移除 worktree", "worktree", { space: tg.id, action: "remove" }]] : []),
        ["关闭", "space.close", { id: tg.id }],
      ];
    default:
      return [
        ["新建空间", "space.new", {}],
        ["快捷键", "app.help", {}],
      ];
  }
}

function shortcut(name, args) {
  const value = args && Object.values(args)[0];
  const k = keys().find(b => b.section === "global" && (b.action === name || b.action === `${name}:${value}`));
  return k ? k.keys : "";
}

function isSeparator(it, prev) {
  return it[1].endsWith(".close") || it[1] === "app.help";
}

export default class MavericksMenu extends View {
  init(_props, cx) {
    this.at = 0;
    this.git = null;
    this.handle = cx.focus_handle();
    this.handle.focus();
    const p = props();
    const space = p?.tab === "space" && spaces().find(s => s.id === p.target?.id);
    const folder = space && place(space);
    if (folder) {
      cx.spawn(async (cx) => {
        this.git = await checkout(folder, space.machine).catch(() => null);
        cx.notify();
      });
    }
  }

  choose(i, cx) {
    const it = items(props(), this.git)[i];
    if (!it) return;
    closeOverlay(props()?.overlay);
    if (it[1] === "worktree") openOverlay({ mod: "worktree", kind: "dialog", ...(it[2].action === "open" ? { width: 560, height: 480 } : { width: 440, height: 260 }), props: it[2] });
    else run(it[1], it[2]);
  }

  render(cx) {
    const t = theme();
    const list = items(props(), this.git);
    return v_flex()
      .id("mv-menu")
      .track_focus(this.handle)
      .w_full()
      .min_h(0)
      .p(4)
      .font_family(FONT)
      .text_size(12)
      .on_key_down((e, cx) => {
        if (e.key === "down") this.at = (this.at + 1) % list.length;
        else if (e.key === "up") this.at = (this.at + list.length - 1) % list.length;
        else if (e.key === "enter") this.choose(this.at, cx);
        else if (e.key === "escape") closeOverlay(props().overlay);
        else return;
        cx.notify();
      })
      .children(
        list.map((it, i) =>
          v_flex()
            .relative()
            .when(i > 0 && isSeparator(it, list[i - 1]), el => el.child(div().mx(6).my(3).h(1).bg("#d6d6d6")))
            .child(
              h_flex()
                .id(`mv-mi-${i}`)
                .relative()
                .h(22)
                .px(9)
                .rounded(4)
                .items_center()
                .justify_between()
                .gap(18)
                .text_color(M.text)
                .when(i === this.at, el => el.child(gradient(M.accentLight, M.accentDark, 180)))
                .when(i !== this.at, el => el.hover(s => s.bg("#e2e2e2")))
                .on_click((_e, cx) => this.choose(i, cx))
                .child(div().relative().flex_1().child(it[0]))
                .child(div().relative().text_size(11).text_color(i === this.at ? "#ffffffb0" : M.textDim).child(shortcut(it[1], it[2]))),
            ),
        ),
      );
  }
}
