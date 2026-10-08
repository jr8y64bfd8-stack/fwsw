# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS, no build step. Everything in `./public` is served as-is by Cloudflare (see `wrangler.jsonc`). Confirmed by the owner: keep it plain HTML.

## Users

Primary: precision industrial customers — machine shops, mold and die makers, and manufacturers — who have a damaged, worn, or out-of-spec part (often tool steel, stainless, aluminum, or exotic alloy) and need it welded accurately so it can be re-machined or put back into service. They are often under time pressure because a tool or line is down.

Secondary (welcome, not the focus): contractors and homeowners with general welding or fabrication jobs.

## Product Purpose

The website for Fort Wayne Specialty Welding & Co., LLC, a solo precision welding shop in Fort Wayne, Indiana. Its job is to convince a precision customer that this shop can handle delicate, high-value work, and to get them to send drawings or photos of the part for a quote.

Success: a qualified shop or manufacturer sends drawings/photos and a quote request.

## Positioning

A one-person precision shop doing micro-TIG repair under a stereo microscope: tool steel build-ups for mold and die repair, fine work on stainless, aluminum and exotics, with fast turnaround for shops that are down. AWS D17.1 (aerospace) and D1.6 (stainless structural) certified.

## Operating Context

- Customers evaluate the shop by looking at weld quality in photos, then send drawings or photos of their part.
- Parts arrive by customer drop-off locally; the owner also works on-site / mobile at customer shops. Ship-in is not offered (not confirmed).
- Contact: phone 260-515-3263; email sales@fwspecialtyweld.com.
- Service area for on-site work: Fort Wayne and surrounding area, tentatively up to 25 miles.
- Hours: 7am–5pm; weekends also available.
- Address: not published. Site shows "Fort Wayne, IN" and asks customers to call to arrange drop-off.

## Capabilities and Constraints

- Processes: TIG (including micro-TIG under a microscope) and MIG.
- Work types shown in the portfolio: tool steel build-up and mold/die repair, stainless and exotics, aluminum, production runs, shaft/gear repair and build-up, welding fixtures.
- Fast / rush turnaround available.
- Also offered (owner confirmed from the brochure): silver soldering and cast iron repair.
- Also offered (owner confirmed): agricultural / farm equipment repair. No farm repair photos on hand yet.
- Hero film (owner approved the approach): real footage and real photos only; AI is used only for camera moves on the owner's real photos and is checked frame by frame against the original. No AI-invented welds.
- Laser welding: owner has 15+ years of laser welding experience but does not own a laser welder yet; plans to buy one. Site lists the experience and a "Coming soon: laser welding" note only. Never present laser welding as a current service. Past laser job photos may be added later as a separate, clearly labeled set (not in the main shop gallery), after checking them for former-employer or customer details.
- AWS certifications (from the owner's brochure, owner approved for the site): GTAW D1.6 on 304 SS, 2F; GTAW D17.1 on 17-4 SS, 420 SS, 455 SS and 316L, all 2F.
- Phone: 260-515-3263 is correct; the 260-625-3187 number on the old brochure is not to be used.
- Solo operation: no team, no front desk.

## Brand Commitments

- Name: Fort Wayne Specialty Welding (legal: Fort Wayne Specialty Welding & Co., LLC; no DBA). The site uses "Fort Wayne Specialty Welding & Co." in the header, About, mission and page title, and the full legal name "Fort Wayne Specialty Welding & Co., LLC" in the footer (owner request).
- Certifications: AWS D17.1 and D1.6.
- Phone: 260-515-3263. Email: sales@fwspecialtyweld.com.
- Experience: 25 years.
- Visual direction: the owner chose a conventional, standard industrial welding-shop site (photo-led hero, services, gallery, process, contact) over more unusual concepts. Keep it straightforward and polished.
- Signature element: the two-sided 3D logo medallion that turns behind the page on scroll, at bold strength (about 60% opacity; owner changed it from medium), each face fading as it turns away.

## Evidence on Hand

- About 40 real portfolio photos with alt text and captions in `public/images/portfolio/<category>/` with a `manifest.json` per category: tool-steels, stainless-exotics, aluminum, production-runs, repair-buildup, fixtures.
- Customer testimonials: owner is still collecting them; to be added later. Do not write or paraphrase any quotes until the owner supplies them, and design so the site works without them.
- Years of experience: 25 (confirmed by owner).
- No named clients, no pricing. Do not fabricate customers, logos, industries served, stats, or prices.

## Product Principles

1. The welds are the argument. Real close-up photos of finished work carry more weight than any claim.
2. Speak to the machinist and mold maker in their terms (build-up, re-machining, tool steel, tolerances), not generic "welding services" language.
3. Make sending drawings or photos the easiest thing on every page.
4. Honest scale: a skilled solo specialist, not a pretend large company.
5. Respect urgency: make it obvious that fast turnaround is possible and how to start.

## Terms of service (terms.html)
- Written from scratch for this shop (not adapted from any other company's terms). Linked from the footer and the quote section.
- Owner's choices: payment due at pickup for individuals, net 30 for approved business accounts; 15-day workmanship warranty (redo or refund); finished parts held free 60 days, then a storage fee (no amount stated, by choice); quotes good for 30 days. Photos: finished work may appear in the gallery with identifying marks hidden; customers can opt out when placing the job (owner's choice, Oct 8). Drawings and part details stay confidential.
- Draft until the owner's lawyer reviews it.

## Quote form
- Owner asked for an on-site form (like other shops' contact forms) on Oct 7 2026. Fields are our own, built around quotes: name, company, email, phone, type of work, job description, material, quantity, needed-by date, drop-off/on-site, and up to 6 drawings or photos (12 MB total; photos over 1.2 MB are resized in the browser to 2400 px).
- Sending: src/worker.js handles POST /api/quote and emails sales@fwspecialtyweld.com through Resend, with reply-to set to the customer. The browser base64-encodes attachments and the Worker streams them through untouched, so each request stays within the Workers free plan's 10 ms CPU limit (building the email in the Worker measured ~50 ms).
- The domain's mail is iCloud (MX mx01/mx02.mail.icloud.com), so Cloudflare Email Routing's send_email can't be used. Resend's DNS records live on the "send" subdomain and resend._domainkey, so they don't touch iCloud mail.
- Spam: Cloudflare Turnstile (invisible unless needed) plus a hidden honeypot field. The site key goes in data-turnstile-sitekey on #quote-form; the secret is a Worker secret.
- Until RESEND_API_KEY is set the form answers "not switched on yet" with the email and phone as fallback. In the claude.ai preview the form can't send (no Worker there).
- Setup before go-live (owner, in their accounts): 1) resend.com account, add domain fwspecialtyweld.com, let it add DNS records in Cloudflare, create an API key; 2) Cloudflare > Turnstile > add widget for fwspecialtyweld.com, note site key and secret; 3) Cloudflare > Workers > fwspecialtyweld > Settings > Variables and secrets: add RESEND_API_KEY and TURNSTILE_SECRET as secrets; 4) give Claude the Turnstile site key (public) to put in the page.

## Privacy, accessibility note, search engines
- privacy.html (Oct 2026): plain-English policy matching how the site actually works: no cookies, analytics or trackers; the form's details go to sales@ through an email delivery service; Cloudflare hosts the site and runs the spam check; nothing is sold; drawings stay confidential; people can ask to see, fix or delete their info. If analytics, embeds or a newsletter are ever added, update this page first.
- Footer: Terms and Privacy links, plus an accessibility help line (call or email and we'll help directly).
- sitemap.xml and robots.txt list the clean URLs (/, /terms, /privacy), which is how Cloudflare serves .html pages. Every page has a canonical link to fwspecialtyweld.com.
- Every page still carries <meta name="robots" content="noindex"> until go-live. Remove it at go-live, then submit the sitemap in Google Search Console and Bing Webmaster Tools.

## Security
- Attack surface is small: static files on Cloudflare (HTTPS and DDoS protection included), no database, no logins, no WordPress or plugins. The one dynamic piece is /api/quote, which only emails sales@ (it can't be used to send mail to anyone else), validates every field and file type and size server-side, and requires Cloudflare Turnstile when TURNSTILE_SECRET is set, plus a honeypot field.
- public/_headers (generated by gen_headers.py, run automatically by gen_site.py and gen_pages.py): a strict Content-Security-Policy where inline scripts are allowed only by their sha256 fingerprint and only Turnstile is allowed from outside the domain, plus HSTS, nosniff, frame denial (no clickjacking), Referrer-Policy and Permissions-Policy. Tested under Cloudflare's local engine with no violations.
- The real risk is the accounts behind the site. Before go-live the owner should turn on two-step login for GitHub, Cloudflare, the domain registrar, Resend and the Apple ID that runs the iCloud mail.
- The domain has SPF for iCloud but no DMARC record (checked Oct 2026), so someone could more easily send email pretending to be sales@. Add DMARC with Cloudflare's free DMARC Management, in the Cloudflare dashboard under Email.
- Also at go-live: turn on DNSSEC in Cloudflare (one click), add one rate-limiting rule for /api/quote (the free plan allows one), and turn on Hotlink Protection.

## Redesign pass (Oct 7, 2026, owner-approved plan)
- Hero film: shots A (gear) and D (four blocks) are now camera moves on the owner's real photos; no AI-generated frames anywhere in the film. Shot B is the owner's own iPhone time-lapse. Phone frame set is 640x800.
- Copy: mission replaced by "How the shop runs"; quote CTA in every section; voice is tradesman-to-engineer.
- Service landing pages: mold-die-repair, micro-tig-welding, farm-equipment-repair (content in service_pages.py, built by gen_pages.py), each with Service + FAQ schema.
- LocalBusiness schema on the home page (no street address; 40 km service circle around Fort Wayne).
- Testimonials: hidden placeholder section in index.html; never fill it with invented quotes.
- Background video loops (Kling 3.0 std via Higgsfield, atmosphere only): slots at images/video/{intro-haze,sparks,steel-sweep,shop-haze}.{webm,mp4,jpg}. Missing files are removed quietly. Owner downloads chosen takes and attaches them; encode with ffmpeg as seamless loops.
- Coin: single bundled js/coin.js (three.js r128 slim build via esbuild, see scratchpad coinbuild/build.sh), 1.5x pixel ratio on phones, lighter geometry, skipped on <2 GB devices.

