---
name: Fort Wayne Specialty Welding
description: A precision welding shop's site drawn as an engineering shop print, blueprint navy with tan linework.
colors:
  navy: "#1c2a44"
  navy-deep: "#141f35"
  navy-lift: "#24365a"
  tan: "#d9c4a0"
  tan-dim: "rgba(217,196,160,.55)"
  tan-faint: "rgba(217,196,160,.22)"
  paper: "#f4efe6"
  ink: "#e6ddcc"
  green: "#2f5d45"
  green-hover: "#376b50"
  green-line: "#86c29f"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 4.3vw, 4.6rem)"
    fontWeight: 600
    lineHeight: 0.92
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "0.01em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "0.03em"
  body:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "tnum"
  lede:
    fontFamily: "Barlow, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.08em"
  label-cell:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.14em"
  value-cell:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "0.05em"
rounded:
  none: "0px"
spacing:
  gutter: "clamp(10px, 2.4vw, 26px)"
  pad: "clamp(20px, 4vw, 56px)"
  xs: "6px"
  sm: "12px"
  md: "22px"
  lg: "28px"
  section-gap: "clamp(28px, 5vw, 80px)"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "#ffffff"
    typography: "{typography.value-cell}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-primary-large:
    padding: "18px 24px"
  button-primary-sm:
    padding: "10px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.navy-lift}"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.tan}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 12px"
  filter-chip-pressed:
    backgroundColor: "{colors.tan}"
    textColor: "{colors.navy}"
  nav-link:
    textColor: "{colors.tan}"
    typography: "{typography.label}"
    padding: "9px 10px"
  callout:
    backgroundColor: "rgba(20,31,53,.9)"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "6px 9px"
  title-block-cell:
    textColor: "{colors.paper}"
    typography: "{typography.value-cell}"
    padding: "7px 12px 9px"
  view-frame:
    backgroundColor: "{colors.navy-deep}"
    rounded: "{rounded.none}"
---

# Design System: Fort Wayne Specialty Welding

## Overview

**Creative North Star: "The Shop Print"**

The site is an engineering drawing sheet, read the way a machinist reads the prints they send in. Every section is a sheet: a faint outer border, a heavier inner frame, zone ticks (8 to 1 across the top, D to A down the side), a sheet number at bottom-right. Inside, content is organised the way a print is: a part view with leader-line callouts, general notes, detail views, a revision block, and a title block that carries the name, phone, certifications and the action.

The ground is blueprint navy; everything drawn on it is single-stroke tan linework and condensed drafting capitals. Ornament is limited to what a print actually carries: AWS weld symbols, leader lines with terminal dots, ruled cells. Real photographs of finished welds sit inside thin-ruled view frames labeled like drawing views ("Part view", "Detail", "Scale: NTS"). Forest green appears only where something is live: the primary action, and the leader lines and callouts that point at the work.

Density is moderate and sheet-bound: generous frame padding, tight ruled cells inside. Nothing is rounded, nothing floats on a shadow. The world refuses the welding-category default of a dark sparks-and-flames hero over three service cards, and refuses corporate polish; it should read as one skilled specialist's own print.

**Key Characteristics:**
- Blueprint navy ground, tan hairline and 2px linework, no shadows.
- Barlow Condensed uppercase for every heading, label and value; Barlow for running prose.
- Sheet frames with zone ticks and a sheet number on every major section.
- Title-block grids of labeled cells for facts (location, process, certs, phone).
- Green reserved for the primary action and for leader lines and callouts on photos.
- Square corners everywhere.

## Colors

A two-temperature print palette: cool navy paper, warm tan ink, and one green signal.

### Primary
- **Shop Green** (`green`): fill of the primary action, "Send drawings or photos", in the title block, the nav and the quote sheet. White label on it. Never decorative.
- **Shop Green, Worked** (`green-hover`): hover fill of the primary action.
- **Callout Green** (`green-line`): the lighter green that reads on navy: leader lines, terminal dots, callout borders and weld symbols drawn over photos. It is the "live" mark on the drawing.

### Secondary
- **Drafting Tan** (`tan`): the linework and secondary-text color. Nav links, note numbers, view-label prefixes, fact labels, filter chips, rev letters, and the pressed-chip fill. Also the focus ring and text selection.
- **Tan Line, Dim** (`tan-dim`): the 2px frame and title-block outer borders, view-frame borders, zone ticks, ghost-button border. A line color.
- **Tan Line, Faint** (`tan-faint`): the 1px hairlines: outer sheet border, inner cell rules, list dividers, nav underline, chip borders at rest.

### Neutral
- **Blueprint Navy** (`navy`): the page ground and every sheet. Brand-pinned.
- **Deep Navy** (`navy-deep`): inset surfaces: photo view-frame backing, the action cell of the title block, rev-table header, the sticky nav (at 94% with blur).
- **Navy, Lifted** (`navy-lift`): hover fill for ghost buttons.
- **Paper** (`paper`): headings, title-block values, link text, callout text. The brightest thing on the sheet.
- **Ink** (`ink`): running body text and ledes.

### Named Rules
**The One Signal Rule.** Green means "act here" or "look here". It fills only the primary action and draws only the leader lines and callouts on the work. Never use it for headings, borders, section fills or decoration.

**The Pinned Three Rule.** Navy `#1c2a44`, green `#2f5d45` and tan `#d9c4a0` are owner-pinned brand colors. Derive tints and states from them; do not replace or re-hue them.

**The Line Is Not Text Rule.** `tan-dim` and `tan-faint` are line colors. Text that must be read is set in `tan`, `ink` or `paper`.

## Typography

**Display Font:** Barlow Condensed (with Arial Narrow, sans-serif), weights 500/600/700, self-hosted woff2
**Body Font:** Barlow (with system-ui, sans-serif), weights 400/500/600, self-hosted woff2

**Character:** Barlow Condensed in uppercase is drafting lettering: narrow, upright, tracked, a little mechanical. Barlow carries prose in the same skeleton at normal width, so the two read as one hand. Numbers are tabular throughout.

### Hierarchy
- **Display** (600, clamp(2.5rem, 4.3vw, 4.6rem), 0.92): the single H1 on the first sheet, uppercase; a trailing phrase may be set in tan for emphasis.
- **Headline** (600, clamp(2.1rem, 4.4vw, 3.6rem), 0.98): sheet titles ("General notes", "Detail views"), uppercase, balanced wrap.
- **Title** (600, 1.45rem, 1.05, 0.03em): numbered general-note headings and rev-block step names (1.2rem there), uppercase.
- **Body** (400, 1.0625rem, 1.6; 1rem under 640px): prose, max 62ch.
- **Lede** (400, 1.125rem, 1.6): the paragraph under each sheet title, max 62ch (44ch in the hero).
- **Label** (500, 0.95rem, 0.08em, uppercase): nav links, filter chips, view labels, figure captions, fact terms.
- **Cell label** (500, 0.66rem, 0.14em, uppercase): the small field name at the top of each title-block or cert cell ("Location", "Rev", "Certified").
- **Cell value** (600, 1.05rem, 0.05em, uppercase): the value under a cell label; also the button label face.

### Named Rules
**The Drafting Capitals Rule.** Anything that labels, names or counts is Barlow Condensed uppercase with positive tracking (0.04em to 0.14em; smaller sizes get more). Running sentences are Barlow in sentence case. Never set prose in condensed capitals.

**The Cell Pair Rule.** A fact is shown as a cell: small tracked label above, condensed value below. That pair is the system's only "small text over big text" device, and it lives only inside ruled cells, never floating above a heading.

## Layout

Each major section is a sheet: max-width 1600px, centered, separated by the `gutter` (clamp(10px, 2.4vw, 26px)). A sheet has a 1px `tan-faint` outer border inset by the gutter, then a 2px `tan-dim` inner frame with `pad` (clamp(20px, 4vw, 56px)) of padding. Zone ticks sit in the gutter between the two borders; a sheet-number cell ("Sheet 2 of 5") is notched into the frame's bottom-right corner.

Inside a frame, layouts are two-column grids with asymmetric ratios (1.55fr/1fr in the hero, 1fr/1.5fr for notes, 1.2fr/1fr for the shop, 1fr/1.1fr for the quote) and a fluid gap of clamp(28px, 5vw, 80px). In the hero the title block is pushed to the bottom of the right column. The notes sidebar is sticky (top 96px) on wide screens. The work grid is auto-fill at minmax(220px, 1fr) with clamp(12px, 1.6vw, 22px) gaps, 3:4 crops.

Breakpoints: at 1080px every two-column grid stacks and the hero H1 moves above the part view; at 820px the nav links hide (mark, phone and button remain); at 640px zone ticks hide, the frame padding drops to 22px 16px 26px, the work grid goes to two columns and the title blocks reflow to two or one column. Anchor scrolling is smooth with a 72px offset for the sticky nav.

## Elevation & Depth

Flat. There are no box-shadows anywhere. Depth is drawn, not lit: a line weight hierarchy (1px faint hairline, 2px dim frame) and one step of tonal inset (`navy-deep` behind photos and the action cell). The sticky nav is the only translucent layer (`navy-deep` at 94%, 6px backdrop blur), and the lightbox backdrop is near-black navy at 92%.

### Named Rules
**The Drawn Depth Rule.** Hierarchy comes from line weight and ruled containment, never from shadow or glow. If something needs to stand forward, give it a heavier rule or a `navy-deep` inset.

## Shapes

Square corners everywhere (0px). The form language is the ruled rectangle: frames, cells, view frames, chips and buttons are all straight-edged boxes with 1px or 2px tan borders. Grids of cells share borders like a title block. The only curves are in the drawing marks themselves: the terminal dots on leader lines and the circles and arcs in AWS weld symbols. The brand mark is a single-stroke zig-zag path, stroke 2px, mitered.

## Components

### Buttons
Blunt and tool-like: a stamped rectangle, condensed capitals.
- **Shape:** square (0px), 1px border in white at 22% on the primary.
- **Primary:** `green` fill, white label, Barlow Condensed 600 1.05rem 0.08em uppercase, 14px 20px; an optional 18px inline SVG drawn in single strokes sits before the label. Large variant 18px 24px at 1.15rem (quote sheet); small variant 10px 14px at 0.95rem (nav).
- **Hover / Active:** fill shifts to `green-hover` over 0.2s on the house ease; active nudges down 1px. Focus is the global 2px tan outline, 3px offset.
- **Ghost:** transparent with a `tan-dim` border and `paper` label; hover fills `navy-lift`. Used for the phone action beside the primary.

### Chips (filters)
- **Style:** transparent, 1px `tan-faint` border, `tan` label in condensed caps; an optional bold zone letter (A to F) precedes the label.
- **State:** hover lifts text to `paper` and border to `tan-dim`; pressed (`aria-pressed="true"`) fills solid `tan` with `navy` text.

### Title Block (signature)
The drawing title block: a 2px `tan-dim` outer border holding a grid of cells with 1px `tan-faint` rules. Each cell is a cell-label / cell-value pair. The action cell spans the full width on `navy-deep`, holds the full-width primary button, and below it the phone in 1.35rem condensed `paper` with the sheet count at right. The footer is a four-cell title block (title, phone, email, drawing number and revision).

### View Frame and Callouts (signature)
- **View frame:** a photo inside a 1px `tan-dim` border on `navy-deep`, with a view label beneath: bold underlined `paper` prefix ("Part view", "Detail") then a description, and "Scale: NTS" pushed right.
- **Leader lines:** an SVG overlay of `green-line` 1.6px non-scaling strokes ending in small filled dots on the feature.
- **Callouts:** condensed 600 caps in `paper`, on navy at 90% with a 1px `green-line` border, square, 6px 9px. May carry an AWS weld symbol drawn in `green-line` below the text.
- **Motion:** on the hero part view, leader lines draw on via stroke-dashoffset over 1.1s, staggered 0.15s; dots scale in; callouts settle in from 4px down with a 3px blur clearing, starting at 0.7s. Under reduced motion everything is shown static. House ease is `cubic-bezier(.16,1,.3,1)`.

### Navigation (sheet index)
- **Style:** sticky top bar on translucent `navy-deep`, 1px `tan-faint` bottom rule. Left: single-stroke mark plus name in condensed caps. Right: section links in `tan` label type, the phone in `paper`, and the small primary button.
- **States:** link hover goes to `paper` with a `tan-faint` box border. Links hide below 820px; the phone hides below 640px.

### General Notes list
A numbered list ruled top and bottom in `tan-faint`. Each note has a large condensed `tan` numeral ("1.") in a 3.2rem column, a title-level heading and a body sentence.

### Revision Block
A bordered table (2px `tan-dim`, 1px `tan-faint` cell rules) with a `navy-deep` header row of cell-label type. The first column holds large condensed `tan` revision letters (A, B, C, D); the second holds a condensed `paper` step name over a body sentence. Used for the step-by-step process.

### Facts list
A two-column definition list: condensed `tan` caps terms, `paper` values, divided by `tan-faint` rules.

### Lightbox
Native dialog: 2px `tan-dim` frame on `navy`, 12px padding, a caption bar with the view code in `tan` and square 42px icon buttons with `tan-faint` borders.

## Do's and Don'ts

### Do:
- **Do** put every major section on a sheet: faint outer border, 2px `tan-dim` frame, zone ticks, sheet number at bottom-right.
- **Do** show facts as title-block cells: small tracked label over a condensed value, inside shared ruled borders.
- **Do** present the work as real photos in view frames with drawing-view labels, and annotate a hero photo with `green-line` leader lines, dots and callouts rather than overlaid marketing copy.
- **Do** use AWS weld symbols and leader lines as the only ornament.
- **Do** keep green to the primary action and to live callouts (The One Signal Rule).
- **Do** set readable text in `tan`, `ink` or `paper`; keep `tan-dim` and `tan-faint` for lines.
- **Do** make leader-line drawing the one entrance motion, and show it static under reduced motion.

### Don't:
- **Don't** use sparks, flames, glowing arcs or a dark hero over three service cards.
- **Don't** add drop shadows, glows or rounded corners; depth is drawn with line weight and `navy-deep` insets.
- **Don't** use green for headings, borders, backgrounds or decoration.
- **Don't** re-hue or substitute the pinned navy, green and tan.
- **Don't** float a small tracked label above a section heading; the cell-label face belongs inside ruled cells only.
- **Don't** set running prose in condensed capitals.
- **Don't** use icon fonts or filled pictogram sets; icons are single-stroke inline SVG in `currentColor`.
