"""Build the inner pages (terms.html, privacy.html). They share the main page's fonts, tokens,
header and footer styles, pulled from site_template.html so the pages never drift; each
page's body comes from its own *_content.html file."""
import re, os

HERE = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(HERE, 'site_template.html')).read()


def between(s, start, end):
    i = s.index(start)
    j = s.index(end, i)
    return s[i:j]


css_base = between(tpl, '    @font-face', '    /* ---------- intro: the coin opens the page ---------- */')
css_footer = between(tpl, '    /* ---------- footer ---------- */', '    /* ---------- back to top ---------- */')
css_totop = between(tpl, '    /* ---------- back to top ---------- */', '    .film:focus')
css_gallery = between(tpl, '    /* ---------- work gallery ---------- */', '    /* ---------- process ---------- */')

header = between(tpl, '  <header class="site-header" id="site-header">', '  </header>') + '  </header>\n'
header = (header.replace('href="#top" aria-label="Fort Wayne Specialty Welding &amp; Co. Precision TIG &amp; MIG, back to top"',
                         'href="index.html" aria-label="Fort Wayne Specialty Welding &amp; Co. Precision TIG &amp; MIG, home"')
                .replace('href="#', 'href="index.html#'))

footer = between(tpl, '  <footer class="site-footer">', '  </footer>') + '  </footer>\n'
footer = footer.replace('href="#', 'href="index.html#')

css_terms = '''
    /* ---------- terms page ---------- */
    body { background: var(--ground); }
    .terms-hero { background: var(--navy); color: var(--on-navy); padding-block: clamp(48px, 7vw, 88px) clamp(40px, 6vw, 72px); border-bottom: 3px solid var(--tan); }
    .terms-hero .wrap { display: grid; gap: 14px; }
    .eyebrow { font-family: var(--display); font-stretch: 90%; font-weight: 680; font-size: 0.86rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--tan); }
    .terms-hero h1 { color: #fff; }
    .terms-hero .lede { color: var(--on-navy-soft); font-size: 1.2rem; max-width: 40em; }
    .terms-hero .updated { color: var(--on-navy-soft); font-size: 0.95rem; }

    .terms-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: clamp(40px, 6vw, 88px); padding-block: clamp(44px, 6vw, 80px) clamp(72px, 9vw, 120px); align-items: start; }
    .toc { position: sticky; top: 104px; font-size: 0.98rem; }
    .toc-title { font-family: var(--display); font-stretch: 90%; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
    .toc ol { list-style: none; margin: 0; padding: 0; counter-reset: toc; display: grid; gap: 2px; }
    .toc li { counter-increment: toc; }
    .toc a { display: flex; gap: 10px; padding: 5px 0; color: var(--ink-soft); text-decoration: none; line-height: 1.35; }
    .toc a::before { content: counter(toc, decimal-leading-zero); font-variant-numeric: tabular-nums; color: var(--tan); font-weight: 600; flex: none; }
    .toc a:hover { color: var(--navy); }

    .terms-body { max-width: 46rem; display: grid; }
    .terms-body section { padding-block: 30px; border-top: 1px solid var(--rule); }
    .terms-body section:first-child { border-top: 0; padding-top: 0; }
    .terms-body h2 { font-size: clamp(1.45rem, 2.4vw, 1.75rem); font-weight: 760; display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; }
    .terms-body .num { font-size: 0.95rem; font-weight: 700; color: #73602F; font-variant-numeric: tabular-nums; letter-spacing: 0.04em; flex: none; }
    .terms-body p, .terms-body li { color: var(--ink); line-height: 1.65; }
    .terms-body ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px; }
    .terms-body li { position: relative; padding-left: 21px; }
    .terms-body li::before { content: ""; position: absolute; left: 0; top: 0.68em; width: 7px; height: 7px; background: var(--tan); border-radius: 1px; }
    .terms-body .sub-list { margin-top: 10px; gap: 8px; }
    .terms-body .sub-list li::before { background: transparent; border: 1.5px solid var(--tan); width: 6px; height: 6px; }
    main:focus { outline: none; }
    .terms-body strong { color: var(--navy); font-weight: 650; }
    .terms-body a { color: var(--navy); }
    .terms-contact { margin-top: 18px; padding: 26px 28px; background: var(--paper); border: 1px solid var(--rule); border-left: 3px solid var(--tan); border-radius: var(--radius); display: grid; gap: 6px; }
    .terms-contact h2 { font-size: 1.25rem; margin: 0; display: block; }
    .terms-contact a { font-weight: 650; white-space: nowrap; }
    .footer-links a[aria-current="page"] { color: #fff; }

    @media (max-width: 960px) {
      .terms-layout { grid-template-columns: 1fr; }
      .toc { position: static; background: var(--paper); border: 1px solid var(--rule); border-radius: var(--radius); padding: 18px 22px; }
      .toc ol { grid-template-columns: 1fr 1fr; column-gap: 28px; }
    }
    @media (max-width: 560px) { .toc ol { grid-template-columns: 1fr; } .terms-contact { padding: 22px 20px; } }
'''

PAGES = [
    ('terms', 'Terms of Service', 'Terms of service for welding, repair and fabrication work by Fort Wayne Specialty Welding &amp; Co., LLC: quotes, payment, warranty, pickup, shipping and confidentiality.'),
    ('privacy', 'Privacy Policy', 'How Fort Wayne Specialty Welding &amp; Co., LLC handles the information you send through this website: what is collected, how it is used, and your choices.'),
]


def build(slug, title, desc):
    content = open(os.path.join(HERE, slug + '_content.html')).read()
    foot = footer.replace('<a href="%s.html">' % slug, '<a href="%s.html" aria-current="page">' % slug)
    page = f'''<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <title>{title} | Fort Wayne Specialty Welding &amp; Co.</title>
      <meta name="description" content="{desc}">
      <meta name="robots" content="noindex">
      <link rel="canonical" href="https://fwspecialtyweld.com/{slug}">
      <meta name="theme-color" content="#0B2D63">
      <link rel="icon" href="images/brand/favicon-32.png" sizes="32x32">
      <link rel="icon" href="images/brand/logo.svg" type="image/svg+xml">
      <link rel="apple-touch-icon" href="images/brand/apple-touch-icon.png">
      <link rel="preload" href="fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
      <style>
    {css_base}{css_footer}{css_totop}{css_terms}  </style>
    </head>
    <body>
      <a class="skip" href="#content">Skip to content</a>
    {header}
      <main id="content">
    {content}  </main>

    {foot}
      <button class="to-top" type="button" id="to-top" aria-label="Back to top" title="Back to top">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>
      </button>

      <script>
      (function () {{
        var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
        var header = document.getElementById('site-header'), btn = document.getElementById('to-top');
        var queued = false;
        function update() {{
          queued = false;
          header.classList.toggle('is-scrolled', window.scrollY > 24);
          btn.classList.toggle('is-shown', window.scrollY > window.innerHeight * 1.2);
        }}
        addEventListener('scroll', function () {{ if (!queued) {{ queued = true; requestAnimationFrame(update); }} }}, {{ passive: true }});
        update();
        btn.addEventListener('click', function () {{
          var root = document.documentElement, prev = root.style.scrollBehavior;
          root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.scrollBehavior = prev;
          var main = document.getElementById('content'); main.setAttribute('tabindex', '-1'); main.focus({{ preventScroll: true }});
        }});
      }})();
      </script>
    </body>
    </html>
    '''
    out = os.path.join(HERE, '..', 'public', slug + '.html')
    open(out, 'w').write(page)
    print('wrote', out, len(page))


for p in PAGES:
    build(*p)




# ---------- service landing pages ----------
import json, html
from service_pages import SERVICES, PHONE

css_service = '''
    /* ---------- service page ---------- */
    .svc-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(28px, 5vw, 64px); padding-block: clamp(44px, 6vw, 72px) 0; }
    .svc-block h2 { font-size: clamp(1.5rem, 2.4vw, 1.9rem); margin-bottom: 14px; }
    .svc-block ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
    .svc-block li { position: relative; padding-left: 21px; line-height: 1.55; }
    .svc-block li::before { content: ""; position: absolute; left: 0; top: 0.68em; width: 7px; height: 7px; background: var(--tan); border-radius: 1px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 18px; }
    .chips span { font-size: 0.92rem; font-weight: 650; color: var(--navy); background: var(--tan-soft); padding: 5px 11px; border-radius: 3px; }
    .svc-work { padding-block: clamp(44px, 6vw, 72px) 0; }
    .svc-work h2 { font-size: clamp(1.5rem, 2.4vw, 1.9rem); margin-bottom: 6px; }
    .svc-work p { color: var(--ink-soft); margin-bottom: 22px; }
    .svc-work .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .svc-work .tile { display: block; text-decoration: none; color: inherit; }
    .tile-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 36px 12px 10px; font-size: 0.92rem; line-height: 1.3; color: #fff; background: linear-gradient(0deg, rgba(5,18,40,0.88), rgba(5,18,40,0)); }
    .faq { padding-block: clamp(44px, 6vw, 72px) 0; } .faq-inner { max-width: 46rem; }
    .faq h2 { font-size: clamp(1.5rem, 2.4vw, 1.9rem); margin-bottom: 6px; }
    .faq details { border-top: 1px solid var(--rule); }
    .faq details:last-child { border-bottom: 1px solid var(--rule); }
    .faq summary { cursor: pointer; padding: 16px 0; font-family: var(--display); font-stretch: 90%; font-weight: 700; font-size: 1.1rem; color: var(--navy); list-style: none; display: flex; justify-content: space-between; gap: 16px; }
    .faq summary::-webkit-details-marker { display: none; }
    .faq summary::after { content: "+"; color: var(--tan); font-weight: 700; flex: none; }
    .faq details[open] summary::after { content: "–"; }
    .faq details p { padding: 0 0 18px; line-height: 1.6; max-width: 40em; }
    .svc-cta { margin-block: clamp(48px, 7vw, 88px); background: var(--navy); color: var(--on-navy); border-radius: var(--radius); padding: clamp(28px, 4vw, 48px); display: grid; grid-template-columns: minmax(0, 1.4fr) auto; gap: 24px 40px; align-items: center; }
    .svc-cta h2 { color: #fff; font-size: clamp(1.6rem, 3vw, 2.3rem); margin-bottom: 8px; }
    .svc-cta p { color: var(--on-navy-soft); max-width: 36em; }
    .svc-cta .actions { display: flex; flex-wrap: wrap; gap: 12px; }
    .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 10px; }
    .other-services { padding-bottom: clamp(40px, 6vw, 64px); color: var(--ink-soft); font-size: 0.98rem; }
    .other-services a { color: var(--navy); font-weight: 650; }
    @media (max-width: 860px) { .svc-grid { grid-template-columns: 1fr; } .svc-work .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .svc-cta { grid-template-columns: 1fr; } }
'''

photos = {}
for folder in ['tool-steels', 'stainless-exotics', 'aluminum', 'production-runs', 'repair-buildup', 'fixtures']:
    for e in json.load(open(os.path.join(HERE, '..', 'public', 'images', 'portfolio', folder, 'manifest.json'))):
        photos[os.path.basename(e['file'])[:-4]] = (e, folder)


def build_service(svc):
    slug = svc['slug']
    foot = footer.replace('<a href="%s.html">' % slug, '<a href="%s.html" aria-current="page">' % slug)
    blocks = ''.join(
        '<div class="svc-block"><h2>%s</h2><ul>%s</ul>%s</div>' % (
            html.escape(h), ''.join('<li>%s</li>' % html.escape(li) for li in items),
            ('<div class="chips">' + ''.join('<span>%s</span>' % html.escape(m) for m in svc['materials']) + '</div>') if i == 1 else '')
        for i, (h, items) in enumerate(svc['sections']))
    tiles = ''
    for name in svc['gallery']:
        e, folder = photos[name]
        thumb = e['file'].replace(folder + '/', folder + '/thumbs/')
        tiles += ('<a class="tile" href="%s" target="_blank" rel="noopener" aria-label="Open full size: %s"><img src="%s" alt="%s" loading="lazy" decoding="async" width="540" height="720"><span class="tile-cap">%s</span></a>'
                  % (e['file'], html.escape(e['caption']), thumb, html.escape(e['alt']), html.escape(e['caption'])))
    faq = ''.join('<details><summary>%s</summary><p>%s</p></details>' % (html.escape(q), html.escape(a)) for q, a in svc['faq'])
    others = ', '.join('<a href="%s.html">%s</a>' % (o['slug'], o['h1']) for o in SERVICES if o['slug'] != slug)
    schema = json.dumps({
        '@context': 'https://schema.org', '@type': 'Service', 'name': html.unescape(svc['h1']),
        'serviceType': html.unescape(svc['h1']), 'description': svc['desc'],
        'provider': {'@id': 'https://fwspecialtyweld.com/#business'},
        'areaServed': {'@type': 'GeoCircle', 'geoMidpoint': {'@type': 'GeoCoordinates', 'latitude': 41.0793, 'longitude': -85.1394}, 'geoRadius': '40000'},
        'url': 'https://fwspecialtyweld.com/' + slug,
        'potentialAction': {'@type': 'Action', 'name': 'Request a quote', 'target': 'https://fwspecialtyweld.com/#quote'},
    }, indent=1)
    faq_schema = json.dumps({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in svc['faq']]}, indent=1)
    content = f'''    <section class="terms-hero">
      <div class="wrap">
        <p class="eyebrow">{svc['eyebrow']}</p>
        <h1>{svc['h1']}</h1>
        <p class="lede">{html.escape(svc['lede'])}</p>
        <div class="hero-actions"><a class="btn btn-primary" href="index.html#quote">Send drawings or photos for a quote</a><a class="btn btn-ghost" href="tel:+1{PHONE.replace('-', '')}">Call {PHONE}</a></div>
      </div>
    </section>
    <div class="wrap svc-grid">{blocks}</div>
    <section class="wrap svc-work" aria-label="Examples of this work">
      <h2>Work like this from the shop</h2>
      <p>Real parts, real photos. <a href="index.html#work">See the full gallery</a>.</p>
      <div class="grid">{tiles}</div>
    </section>
    <section class="wrap faq" aria-label="Common questions"><div class="faq-inner">
      <h2>Common questions</h2>
      {faq}
    </div></section>
    <div class="wrap"><section class="svc-cta" aria-label="Request a quote">
      <div><h2>Send the part, get a price.</h2><p>A few clear photos, the material if you know it, and when you need it back. You hear back with a price and a turnaround.</p></div>
      <div class="actions"><a class="btn btn-primary" href="index.html#quote">Request a quote</a><a class="btn btn-ghost" href="tel:+1{PHONE.replace('-', '')}">Call {PHONE}</a></div>
    </section>
    <p class="other-services">Also: {others}. <a href="index.html#services">All services</a>.</p></div>
'''
    page = f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{svc['title']} | Fort Wayne Specialty Welding &amp; Co.</title>
  <meta name="description" content="{html.escape(svc['desc'])}">
  <meta name="robots" content="noindex">
  <link rel="canonical" href="https://fwspecialtyweld.com/{slug}">
  <meta name="theme-color" content="#0B2D63">
  <meta property="og:title" content="{svc['title']}">
  <meta property="og:description" content="{html.escape(svc['desc'])}">
  <meta property="og:image" content="https://fwspecialtyweld.com/{photos[svc['gallery'][0]][0]['file']}">
  <link rel="icon" href="images/brand/favicon-32.png" sizes="32x32">
  <link rel="icon" href="images/brand/logo.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="images/brand/apple-touch-icon.png">
  <link rel="preload" href="fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
  <script type="application/ld+json">{schema}</script>
  <script type="application/ld+json">{faq_schema}</script>
  <style>
{css_base}{css_footer}{css_totop}{css_gallery}{css_terms}{css_service}  </style>
</head>
<body>
  <a class="skip" href="#content">Skip to content</a>
{header}
  <main id="content">
{content}  </main>

{foot}
  <button class="to-top" type="button" id="to-top" aria-label="Back to top" title="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>
  </button>
  <script>
  (function () {{
    var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
    var header = document.getElementById('site-header'), btn = document.getElementById('to-top');
    var queued = false;
    function update() {{
      queued = false;
      header.classList.toggle('is-scrolled', window.scrollY > 24);
      btn.classList.toggle('is-shown', window.scrollY > window.innerHeight * 1.2);
    }}
    addEventListener('scroll', function () {{ if (!queued) {{ queued = true; requestAnimationFrame(update); }} }}, {{ passive: true }});
    update();
    btn.addEventListener('click', function () {{
      var root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.scrollBehavior = prev;
      var main = document.getElementById('content'); main.setAttribute('tabindex', '-1'); main.focus({{ preventScroll: true }});
    }});
  }})();
  </script>
</body>
</html>
'''
    out = os.path.join(HERE, '..', 'public', slug + '.html')
    open(out, 'w').write(page)
    print('wrote', out, len(page))


for svc in SERVICES:
    build_service(svc)

import runpy
runpy.run_path(os.path.join(HERE, "gen_headers.py"))
