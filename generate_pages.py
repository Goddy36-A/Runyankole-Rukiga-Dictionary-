#!/usr/bin/env python3
"""
generate_pages.py
Reads runyakitara.json and writes static HTML files into `docs/`.
Usage: python generate_pages.py

This is optional — the site works as a client-side SPA (index.html) but
if you prefer pre-generated static pages you can run this script and
publish the `docs/` folder with GitHub Pages (set source to `main` / `docs/`).
"""
import json, os, pathlib, re, html, sys

SRC = 'runyakitara.json'
OUT = pathlib.Path('docs')
OUT.mkdir(exist_ok=True)

def slug(s):
    s = (s or 'entry').lower()
    s = re.sub(r'[^a-z0-9]+','-', s)
    return s.strip('-') or 'entry'

try:
    with open(SRC, 'r', encoding='utf-8') as f:
        entries = json.load(f)
except Exception as exc:
    print('Failed to read', SRC, exc)
    sys.exit(1)

# Write per-entry pages
for i, e in enumerate(entries):
    head = e.get('headword') or e.get('word') or e.get('term') or f'entry-{i}'
    filename = slug(head) + '.html'
    body = f"""<!doctype html>
<html lang=\"en\">
<head>
<meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
<title>{html.escape(head)}</title>
<link rel=\"stylesheet\" href=\"/style.css\">
</head>
<body>
  <a href=\"/index.html\">← Index</a>
  <h1>{html.escape(head)}</h1>
  <div class=\"definition\">{html.escape(e.get('definition') or e.get('gloss') or '')}</div>
  <pre>{html.escape(json.dumps(e, ensure_ascii=False, indent=2))}</pre>
</body>
</html>"""
    (OUT/filename).write_text(body, encoding='utf-8')

# write index page (simple list)
items = '\n'.join(f'<li><a href="{slug(e.get("headword") or e.get("word") or "entry")}.html">{html.escape(e.get("headword") or e.get("word") or "entry")}</a></li>' for e in entries)
OUT.joinpath('index.html').write_text(f"""<!doctype html>
<html>
<head><meta charset=\"utf-8\"><title>Dictionary index</title><link rel=\"stylesheet\" href=\"/style.css\"></head>
<body>
  <h1>Runyankole–Rukiga Dictionary index</h1>
  <ul>
  {items}
  </ul>
</body>
</html>""", encoding='utf-8')

print('Wrote', len(entries), 'pages to', OUT)
