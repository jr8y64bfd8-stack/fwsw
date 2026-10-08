import json, html, os
P=__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), '..', 'public') + '/'
cats=[('tool-steels','Tool steel & molds'),('stainless-exotics','Stainless & exotics'),('aluminum','Aluminum'),('production-runs','Production runs'),('repair','Repair & fixtures')]
entries=[]
for folder in ['tool-steels','stainless-exotics','aluminum','production-runs','repair-buildup','fixtures']:
    for e in json.load(open(P+f'images/portfolio/{folder}/manifest.json')):
        e['cat']='repair' if folder in ('repair-buildup','fixtures') else folder
        e['folder']=folder; entries.append(e)
# curated lead order: strongest shots first, mixed categories
lead=['tool-steel-tig-build-up-weave-closeup','tig-weld-tube-to-plate-ring','tool-steel-tig-build-up-curved-edge','tool-steel-tig-weld-insert-ring',
      'tig-weld-flange-to-shaft-ring','tool-steel-tig-build-up-wide-pad','stainless-tig-welded-brackets-production-run','tool-steel-tig-edge-build-up-quarter-scale',
      'tig-weld-tube-to-knurled-collar','tool-steel-tig-build-up-long-channel','aluminum-tig-weld-bead-plate','tig-weld-gear-to-shaft']
skip={'tool-steel-tig-build-up-four-blocks'}  # already the hero
def key(e):
    n=os.path.basename(e['file'])[:-4]
    return (lead.index(n) if n in lead else 100, )
entries=[e for e in entries if os.path.basename(e['file'])[:-4] not in skip]
entries.sort(key=key)
tiles=[]
for e in entries:
    f=e['file']; thumb=f.replace(e['folder']+'/', e['folder']+'/thumbs/')
    tiles.append(f'''          <figure class="tile" data-cat="{e['cat']}" data-full="{f}">
            <button type="button" aria-label="View larger: {html.escape(e['caption'])}"><img src="{thumb}" alt="{html.escape(e['alt'])}" loading="lazy" decoding="async" width="540" height="720"></button>
            <figcaption>{html.escape(e['caption'])}</figcaption>
          </figure>''')
counts={c:sum(1 for e in entries if e['cat']==c) for c,_ in cats}
filt=[f'          <button type="button" data-filter="all" aria-pressed="true">All<span class="count">{len(entries)}</span></button>']
filt+= [f'          <button type="button" data-filter="{c}" aria-pressed="false">{html.escape(l)}<span class="count">{counts[c]}</span></button>' for c,l in cats]
t=open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)), 'site_template.html')).read()
t=t.replace('__FILTERS__','\n'.join(filt)).replace('__TILES__','\n'.join(tiles)).replace('__TOTAL__',str(len(entries)))
open(P+'index.html','w').write(t)
print(len(entries),counts)

# keep the security headers in step with the page (they fingerprint its inline script)
import runpy, os as _os
runpy.run_path(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "gen_headers.py"))
