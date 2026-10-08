"""Content for the three service landing pages. Facts only from the owner's brief."""

PHONE = '260-515-3263'

SERVICES = [
    {
        'slug': 'mold-die-repair',
        'title': 'Mold & Die Repair, Tool Steel Welding in Fort Wayne',
        'h1': 'Mold &amp; die repair',
        'eyebrow': 'Tool steel TIG build-up · Fort Wayne, Indiana',
        'desc': 'TIG and micro-TIG weld repair of molds, dies and tool steel in Fort Wayne, IN: chipped parting lines, washed-out cavities, worn edges and damaged inserts built up for re-machining. AWS D17.1 and D1.6 certified. Send drawings or photos for a quote.',
        'lede': 'Chipped parting lines, washed-out cavities, worn edges, cracked inserts. Built up in controlled TIG passes with enough stock to machine back to print, so the tool goes back in the press instead of out for replacement.',
        'sections': [
            ('What comes through the door', [
                'Parting lines and shut-offs that flash because the edge is gone',
                'Cavities and cores washed out by glass-filled resin',
                'Damaged or mis-machined inserts, slides and lifters',
                'Cracked corners and chipped edges on hardened blocks',
                'Shut-off faces and vent lands that need a few thou back',
                'Engineering changes: fill a feature so you can cut the new one',
            ]),
            ('How the repair is done', [
                'Micro-TIG under a stereo microscope on fine edges, so the heat stays in the weld and the surrounding steel keeps its hardness',
                'Filler matched to the base: H13, S7, P20, D2, 420 stainless, 17-4, beryllium copper and more',
                'Preheat and interpass control where the material calls for it',
                'Beads laid oversize and left for your toolroom to bring to size; no grinding that moves your datum',
                'Hidden cracks or a different material than expected: you get a call before more work happens',
            ]),
        ],
        'materials': ['H13', 'S7', 'P20', 'D2', 'A2', '420 SS', '17-4', 'BeCu', '4140'],
        'gallery': ['tool-steel-tig-build-up-weave-closeup', 'tool-steel-tig-build-up-curved-edge', 'tool-steel-tig-weld-insert-ring',
                    'tool-steel-tig-edge-build-up-quarter-scale', 'tool-steel-tig-build-up-wide-pad', 'tool-steel-tig-build-up-long-channel'],
        'faq': [
            ('Will the weld be hard enough to run?', 'Filler is matched to the base steel and the build-up is left for your toolroom to finish. Hardness near the weld can change; if the tool needs post-weld heat treat or stress relief, say so and it gets planned in, or you handle it on your side.'),
            ('How fast can I get an insert back?', 'Most single inserts and edge repairs turn around in a day or two from drop-off. Tool down and the press waiting: call, say so, and rush or weekend work is on the table.'),
            ('Do I need to send a print?', 'Photos of the damage and the material are enough for a price. A print or a model helps when the repair has to hold a dimension or a datum.'),
        ],
    },
    {
        'slug': 'micro-tig-welding',
        'title': 'Micro-TIG Welding Under a Microscope in Fort Wayne',
        'h1': 'Micro-TIG welding',
        'eyebrow': 'Precision repair under a stereo microscope · Fort Wayne, Indiana',
        'desc': 'Micro-TIG welding in Fort Wayne, IN. Fine weld repair on small features, sharp edges, thin walls and detailed parts, done under a stereo microscope so heat goes only where it should. Molds, medical and aerospace-grade stainless, small production parts. Quote from photos.',
        'lede': 'Beads a fraction of a millimetre wide, placed under a stereo microscope. For the edges, corners, thin walls and small features where a normal torch would wash out the detail or warp the part.',
        'sections': [
            ('Where micro-TIG is the right tool', [
                'Sharp edges and parting lines on molds and dies',
                'Small bores, ports and threads that need a few thou of material back',
                'Thin-wall stainless and aluminum that would distort under a full-size arc',
                'Detailed small parts: fixtures, gauges, tooling, prototypes',
                'Repairs next to finished surfaces that can\'t be re-machined',
            ]),
            ('What you get back', [
                'Weld only where it was asked for, with minimal heat-affected zone',
                'Clean, consistent bead profile that machines or polishes out',
                'Material matched to the base: stainless grades, tool steels, aluminum, copper alloys',
                'Honest answers: if a feature is too far gone to build back, you hear it before the job starts',
            ]),
        ],
        'materials': ['304 / 316L', '17-4', '420', '455', 'H13', 'D2', 'Aluminum', 'BeCu'],
        'gallery': ['tool-steel-tig-build-up-weave-closeup', 'tig-weld-tube-to-knurled-collar', 'tool-steel-tig-build-up-curved-edge',
                    'tig-weld-flange-to-shaft-ring', 'tool-steel-tig-edge-build-up-quarter-scale', 'tool-steel-tig-fillet-weld-closeup'],
        'faq': [
            ('How small can you weld?', 'Small enough to put a bead along a parting line or build up a sharp edge without touching the face next to it. If you can see the feature under a stereo microscope, it can usually be welded.'),
            ('Is it certified work?', 'AWS D17.1 (aerospace) and D1.6 (stainless structural) welder qualifications on stainless grades including 304, 316L, 17-4, 420 and 455. The full table is on the home page.'),
            ('Can you match my stainless grade?', 'Yes. Tell me the alloy if you know it; if not, say what the part does and the filler gets chosen to suit.'),
        ],
    },
    {
        'slug': 'farm-equipment-repair',
        'title': 'Farm Equipment Welding Repair in Fort Wayne',
        'h1': 'Farm &amp; agricultural equipment repair',
        'eyebrow': 'Shop or on-site, about 25 miles around Fort Wayne',
        'desc': 'Farm equipment welding and repair around Fort Wayne, IN: implements, hitches, buckets, frames, cracked cast iron housings and worn shafts. Shop drop-off or on-site repair within about 25 miles. Call 260-515-3263 or send photos for a quote.',
        'lede': 'Cracked frames, worn hitches, broken brackets, torn bucket edges, cast iron housings that let go. Fixed right, so you\'re back in the field instead of waiting on a part.',
        'sections': [
            ('What gets fixed', [
                'Implement frames, tongues and hitches: cracks, worn pins and bores built back up',
                'Loader buckets, cutting edges and brackets',
                'Worn shafts and journals welded up for re-machining',
                'Cast iron housings and castings, repaired so they go back in service',
                'Broken tabs, mounts and guards, plus custom brackets made to fit',
            ]),
            ('Shop or on-site', [
                'Bring it to the Fort Wayne shop by arrangement, or the welder comes to you within about 25 miles',
                'TIG, MIG and silver soldering, with the process picked for the metal and the load it carries',
                'Season doesn\'t wait: weekends and rush work available, just say so',
                'A straight answer on whether a repair will hold or the part should be replaced',
            ]),
        ],
        'materials': ['Mild steel', 'Cast iron', 'Stainless', 'Aluminum', 'Hardox / AR plate'],
        'gallery': ['mig-weld-roller-bearing-journal-shaft', 'tig-weld-gear-to-shaft', 'mig-weld-fixture-fillet-tape-measure',
                    'mig-weld-slotted-fixture-plate', 'tig-welded-tube-mounts-production-run', 'mig-weld-fixture-fillet-closeup'],
        'faq': [
            ('Can you come to the farm?', 'Yes, within about 25 miles of Fort Wayne. You handle a clear, safe work area; the rest comes on the truck. Travel is quoted up front.'),
            ('Can cast iron really be welded?', 'Often, yes, with the right preheat, filler and cooling. Cast iron is less predictable than steel, so it\'s done as a best-effort repair and you\'re told that before it starts.'),
            ('What do you need from me for a price?', 'A couple of clear photos of the break and a rough size. Send them through the quote form or text them after a call.'),
        ],
    },
]
