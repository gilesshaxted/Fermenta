# Fermenta website (hidden folder)

This folder builds the web version of Fermenta: Quartz, plus a custom Home page, a region map and the Claret colours. Obsidian ignores it because the folder name starts with a dot.

- `quartz.config.yaml`: Quartz settings and the light and dark colours
- `custom.scss`: extra styling for the Quartz pages
- `site-extras/`: the Home page (`index.html`, `home.js`), the map (`map.html`, `map.js`, Leaflet in `vendor/`) and shared styling
- `scripts/build_data.py`: reads the notes and writes the data file the Home and Map pages use
- `scripts/build.sh`: builds everything

The site rebuilds and publishes itself on every push (see `.github/workflows/deploy.yml`). To build it by hand, run `SITE_HOST=gilesshaxted.github.io/Fermenta bash .site/scripts/build.sh .` from the repo folder. It needs Node 22 or later, git, and Python 3 with PyYAML.

To move the site to its own domain, set the repository variable `SITE_HOST` (for example `fermenta.wiltshirewine.com`) and add the domain in Settings > Pages.
