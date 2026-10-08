# Site build scripts
- `gen_site.py` builds public/index.html from site_template.html and the portfolio manifests, then runs gen_headers.py.
- `gen_pages.py` builds terms, privacy and the three service pages (content: terms_content.html, privacy_content.html, service_pages.py).
- `gen_headers.py` writes public/_headers (CSP fingerprints of the inline scripts).
- `coin-entry.js` + esbuild bundle three.js r128 with public/js/medallion.js into public/js/coin.js:
  `esbuild tools/coin-entry.js --bundle --minify --format=iife --target=es2017 --outfile=/tmp/three-slim.js && cat /tmp/three-slim.js public/js/medallion.js > public/js/coin.js`
