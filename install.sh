#!/usr/bin/env bash
# Install the Mavericks skin into Herdr's config folder.
#
#   ./install.sh            copy into ~/.config/herdr-app
#   ./install.sh --link     symlink instead; edits here apply live (development)
#
# HERDR_HOME overrides the destination.
set -euo pipefail

src="$(cd "$(dirname "$0")" && pwd)"
dest="${HERDR_HOME:-$HOME/.config/herdr-app}"
mode="copy"
[[ "${1:-}" == "--link" ]] && mode="link"

if [[ ! -d "$dest" ]]; then
  echo "No Herdr config folder at: $dest" >&2
  echo "Start Herdr once first, or point HERDR_HOME at it." >&2
  exit 1
fi

stamp="$(date +%Y%m%d%H%M%S)"

place() { # place <source> <destination>
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
# The layout picker's thumbnail (layouts/<name>.png); skipped when absent.
for pic in "$src"/layouts/*.png; do
  [[ -e "$pic" ]] && place "$pic" "$dest/layouts/$(basename "$pic")"
done
place "$src/themes/mavericks.json" "$dest/themes/mavericks.json"
place "$src/themes/mavericks-dark.json" "$dest/themes/mavericks-dark.json"

for mod in mavericks mavericks-menu mavericks-spaces mavericks-agents mavericks-files mavericks-changes; do
  place "$src/mods/$mod" "$dest/mods/$mod"
done

echo "Installed into ${dest} (${mode})"
echo
echo "Switch to the layout:"
echo "  herdr-app do layout.switch --name mavericks"
echo "Back to your old layout:"
echo "  herdr-app do layout.switch --name main"
