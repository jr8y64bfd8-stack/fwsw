# Design

The homepage (`public/index.html`) is a conventional precision-shop site built from the logo's colors and the owner's own weld photos.

## Color
| Token | Value | Use |
|---|---|---|
| `--navy` | #0B2D63 | Logo navy. Headings on light, quote section ground |
| `--navy-deep` | #081F45 | Hero, header, gallery and footer grounds |
| `--ink` / `--ink-soft` | #14213A / #4A5568 | Body text / secondary text on light |
| `--green` | #2F5D34 | Primary action only (quote buttons) |
| `--tan` / `--tan-soft` | #C9B48A / #E7DCC4 | Highlights on navy, step numbers, material chips, selection, focus ring |
| `--ground` / `--paper` | #F5F3EE / #FFFFFF | Page ground / raised cards |
| `--rule` | #DCD6C9 | Hairline dividers |

Light sections stay transparent so the 3D medallion shows behind them; navy sections are opaque.

## Type
- Display: Archivo variable, self-hosted (`fonts/archivo-var.woff2`), width ~88%, weights 680–800, tracking -0.015em.
- Body: Source Sans 3 variable, self-hosted, 1.125rem / 1.6.
- Scale: h1 clamp(2.6rem, 6vw, 4.6rem); h2 clamp(2rem, 4vw, 3.1rem); h3 1.4rem.

## Shape and depth
4px corners on buttons and cards, 3px on photos and chips, pill filters in the gallery. Soft offset shadows only on the services feature card, about photo and contact card.

## Components
- Buttons: green primary, ghost (on navy), line (on light). 52px tall, scale(0.97) on press.
- Services: one feature card (photo + copy + material chips) followed by a two-column ruled list with 88px photo thumbs.
- Gallery: filter pills, 4/3/2-column grid of 3:4 tiles, first 12 shown with "Show all", native `<dialog>` lightbox with arrows, swipe and keyboard.
- Process: four numbered steps on a navy rule (a real sequence).
- Contact card: email / phone with copy buttons, hours, location.
- Back to top: 52px round navy button (46px on phones), tan border and arrow, fixed bottom-right above the safe area. Appears once the visitor is past the hero film, jumps straight to the top (no long glide through the film), turns tan on hover.

## Motion
Custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. Sections below the fold rise 18px into place once; hover zoom on gallery tiles gated to fine pointers; all movement off under reduced motion.

## 3D medallion
`js/medallion.js` (three.js r128 with RoomEnvironment reflections, self-hosted) builds a machined challenge coin: brushed-steel face, raised rim, knurled edge, polished raised logo with navy and green enamel tops, soft shadow. It builds the logo from `images/brand/logo.svg`, extrudes both faces onto a steel disc, turns one full rotation over the page scroll, fades whichever face turns away, renders only while moving, loads after the page is idle, and is skipped on Save-Data.

## Hero film
The hero is a scroll-driven film: 107 frames per screen size (`images/film/d/` 1080x1350 for desktop, `images/film/m/` 720x900 for phones) drawn to a canvas as the visitor scrolls through a pinned section, with the next frame blended in for smooth motion. Shots, in order: gear-to-shaft TIG weld (Higgsfield camera move on the real photo), laser build-up time-lapse (owner's iPhone video), laser result (camera push done in code on the real photo), four-block macro-to-reveal (Higgsfield clip between two frames cut from the real photo). One color grade, focus-pull dissolves between shots, static film grain, a navy edge blend, and four text beats that land per shot. Laser beats are labeled as past work. Reduced motion and Save-Data get the first frame and first message as a static hero. Source frames and the edit script live outside `public/`; the reveal clip's start and end frames are in `media-src/`.
