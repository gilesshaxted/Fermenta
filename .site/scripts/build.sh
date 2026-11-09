#!/usr/bin/env bash
# Build the Fermenta website from a copy of the Fermenta vault.
#   SITE_HOST=gilesshaxted.github.io/Fermenta ./.site/scripts/build.sh .     (run from the repo folder)
# SITE_HOST is where the site will live, without https:// (a custom domain later, for example fermenta.wiltshirewine.com)
# Output: .build/quartz/public  (upload this folder to GitHub Pages). Set BUILD_DIR to build elsewhere.
set -euo pipefail
VAULT="$(cd "${1:?Give the path to the Fermenta vault}" && pwd)"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
QUARTZ_COMMIT="8a62b70b1d85cce2d6afecaeeace141b2b7e6712"   # Quartz version this was tested with
BUILD_DIR="${BUILD_DIR:-$HERE/.build}"
B="$BUILD_DIR/quartz"
SITE_HOST="${SITE_HOST:-gilesshaxted.github.io/Fermenta}"

if [ ! -d "$B/.git" ]; then
  mkdir -p "$BUILD_DIR"
  git clone https://github.com/jackyzha0/quartz.git "$B"
fi
git -C "$B" fetch -q origin "$QUARTZ_COMMIT" 2>/dev/null || true
git -C "$B" checkout -q "$QUARTZ_COMMIT"
(cd "$B" && npm ci --no-audit --no-fund)

# Our configuration and styling on top of Quartz
sed "s#__SITE_HOST__#$SITE_HOST#g" "$HERE/quartz.config.yaml" > "$B/quartz.config.yaml"
cp "$HERE/custom.scss" "$B/quartz/styles/custom.scss"
(cd "$B" && npx quartz plugin install --from-config)

# The notes (without the vault's own settings or git history)
rm -rf "$B/content" && mkdir -p "$B/content"
(cd "$VAULT" && tar cf - --exclude=.git --exclude=.obsidian --exclude=.gitignore --exclude=.gitattributes --exclude=.site --exclude=.github .) | tar xf - -C "$B/content"

python3 "$HERE/scripts/postprocess.py" prep "$B/content"
(cd "$B" && npx quartz build)

# Home page, map page and their data, added on top of the built site
python3 "$HERE/scripts/build_data.py" "$B/content" "$B/public/fermenta-data.json" "$B/public"
python3 "$HERE/scripts/postprocess.py" html "$B/public" "$B/public/fermenta-data.json"
cp -r "$HERE"/site-extras/{fermenta-favicon.svg,apple-touch-icon.png,fermenta.css,fermenta-nav.css,common.js,home.js,regionmap.js,index.html,map.html,map.js,vendor} "$B/public/"
rm -f "$B/public/CNAME"   # the custom domain is set in the GitHub Pages settings, not by a file
echo
echo "Built: $B/public"
