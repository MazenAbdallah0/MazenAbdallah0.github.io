# Mazen Abdallah — Data Analyst Portfolio

A premium dark, bilingual (English / Arabic with RTL) single-page portfolio. Pure HTML5, CSS3 and vanilla JavaScript — no build step, no dependencies.

## Run locally
Open `index.html` directly, or serve the folder:
```
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Structure
- `index.html` — the whole site: Home, About, Skills, Projects, Certificates, Contact (anchors `#home … #contact`).
- `about.html`, `skills.html`, `projects.html`, `certificates.html`, `contact.html` — small redirect stubs so old links still land on the right section.
- `404.html` — styled not-found page.
- `css/` — `tokens` (colors, type), `base`, `layout` (nav, footer), `components`, `sections`, `gallery` (lightbox), `rtl`.
- `js/` — `lang.js` (EN/AR + RTL, saved choice, `?lang=ar`), `i18n-data.js` (translations), `ui.js` (nav indicator, reveal, tilt, filters, copy, counters), `typing.js` (hero typing effect), `gallery.js` (screenshot lightbox), `contact.js` (form → mailto).
- `assets/` — CV PDF, favicon, WebP profile photo and project screenshots.
- `tools/` — optional generator: edit text in `tools/content.py` (English, Arabic), then `python3 tools/build.py` regenerates the HTML and `js/i18n-data.js`.

## Editing
- Text: edit `tools/content.py` and re-run the build (or edit `index.html` and `js/i18n-data.js` by hand, keeping `data-i18n` keys in sync).
- Add Excel project screenshots: save as WebP in `assets/img/projects/` and replace the decorative frame in the project's `frame-art` block with a `.shot` button (copy the Olist one).
- Add certificate images: place files in `assets/img/certificates/` and add them to the matching `.cert` tile.

## Deploy to GitHub Pages
1. Create a repository (e.g. `MazenAbdallah0.github.io`) and push all files to `main`.
2. Settings → Pages → Source: *Deploy from a branch* → `main` / root.
3. The site is live at `https://<user>.github.io/<repo>/`. All paths are relative; `.nojekyll` is included.

Content comes only from the CV and the GitHub repositories.
