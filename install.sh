#!/usr/bin/env bash
# 把 Mavericks 皮肤装进 Herdr 的配置目录。
#
#   ./install.sh            复制到 ~/.config/herdr-app
#   ./install.sh --link     软链过去（改这个仓库即生效，开发时用）
#
# HERDR_HOME 可覆盖目标目录。
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)"
dest="${HERDR_HOME:-$HOME/.config/herdr-app}"
mode="copy"
[[ "${1:-}" == "--link" ]] && mode="link"

if [[ ! -d "$dest" ]]; then
  echo "找不到 Herdr 配置目录：$dest" >&2
  echo "先启动一次 Herdr，或用 HERDR_HOME 指定。" >&2
  exit 1
fi

stamp="$(date +%Y%m%d%H%M%S)"

place() { # place <源> <目标>
  local from="$1" to="$2"
  if [[ "$mode" == "link" ]]; then
    if [[ -e "$to" && ! -L "$to" ]]; then
      mv "$to" "$to.bak-$stamp"
    fi
    ln -sfn "$from" "$to"
  else
    mkdir -p "$(dirname "$to")"
    rm -rf "$to"
    cp -R "$from" "$to"
  fi
}

mkdir -p "$dest/layouts" "$dest/themes" "$dest/mods"

place "$src/layouts/mavericks.json" "$dest/layouts/mavericks.json"
place "$src/themes/mavericks.json" "$dest/themes/mavericks.json"
place "$src/themes/mavericks-dark.json" "$dest/themes/mavericks-dark.json"

for mod in mavericks mavericks-menu mavericks-spaces mavericks-agents mavericks-files mavericks-changes; do
  place "$src/mods/$mod" "$dest/mods/$mod"
done

echo "已安装到 ${dest}（${mode}）"
echo
echo "切换布局："
echo "  herdr-app do layout.switch --name mavericks"
echo "切回默认布局："
echo "  herdr-app do layout.switch --name main"
