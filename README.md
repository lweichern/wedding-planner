# Embroidered wedding e-invitation

A single-page mobile-first wedding invitation in a hand-embroidered style: an
envelope that opens on tap, a pleated pearl-trimmed curtain, a stitched
château with wisteria, roses, swans, a countdown, timeline, recovery day,
gifts note and a full RSVP form. Everything is vector and generated in the
browser, so there are no image downloads.

Open `index.html` directly in a browser, or serve the folder with any static
host (GitHub Pages, Netlify, Vercel, an S3 bucket). There is no build step.

## Structure

| Path | What it does |
| --- | --- |
| `index.html` | Page markup plus the SVG sprite that holds every illustration (château, curtain, swans, figures, icons, frames, garden) |
| `css/styles.css` | Design tokens, linen texture, envelope animation, section layouts, form styling |
| `js/config.js` | Names, dates, venues, timeline, RSVP endpoint. **Edit this file for a new wedding.** |
| `js/i18n.js` | Every visible string in English and French |
| `js/illustrations.js` | Procedural embroidery: wisteria canopies, rose borders and columns, the floral arch (seeded, so identical on every load) |
| `js/main.js` | Envelope intro, language switch, config bindings, countdown, timeline, Maps and `.ics` links, RSVP validation and submission |

## Customising

1. Edit `js/config.js`: couple names and monogram, wedding date (ISO 8601
   with offset), RSVP deadline, both venues with addresses, shuttle origin,
   the timeline rows, and the RSVP delivery.
2. Edit the copy in `js/i18n.js` (welcome text, dress code advice, your
   story, timeline titles and notes). Keep both languages in sync.
3. Change colours in the `:root` block at the top of `css/styles.css`.

### RSVP delivery

`WEDDING.rsvp.endpoint` can be any URL that accepts a JSON `POST` (Formspree,
Netlify Forms via a function, Google Apps Script, your own API). The payload
contains `name`, `email`, `attending`, `diet`, `shuttle`, `message`, `lang`
and `submittedAt`. When the endpoint is left empty the form falls back to a
pre-filled email to `WEDDING.rsvp.email`.

Drafts are saved in the guest's browser until the reply is sent, so an
interrupted guest does not lose a long message.

## What was fixed compared with the reference reel

| Weak point in the reference | How this version handles it |
| --- | --- |
| French headings mixed with English body copy and forms | One language at a time, with an EN / FR toggle that switches every string |
| Seven-second intro that cannot be skipped | Envelope opens on tap, Enter, or on its own after 1.8 s. A Skip button is always visible. Reduced-motion users and deep links to a section go straight to the page; otherwise it plays on every load |
| Heavy raster textures that stall on mobile data | All illustrations are SVG symbols or generated in JS. Page weight is a few hundred kilobytes including fonts |
| Thin italic body copy on pink, hard to read | Upright EB Garamond at 17.6 px, ink `#2f2128` on blush `#f4e7ea` (12.6:1 contrast). Italic is reserved for short accents |
| Flat black RSVP button out of keeping with the design | Burgundy gradient button with a gold hairline and pearl shadow, matching the palette |
| Countdown as a separate heavy section | Three small pearl-ringed badges inside the hero |
| No way for the couple to reply | Optional email field, validated when filled |

Other details: Open in Maps links, downloadable calendar files with a
reminder the day before, a sticky section nav after the hero, a skip link
and focus styles for keyboard users, and all decorative SVG is hidden from
screen readers.

## Beach watercolour variant

`beach/` holds a second invitation in a watercolour style for a beach wedding
in Comporta, Portugal, with English and Portuguese copy. Open `beach/index.html`.
It uses the same structure and the same RSVP, Maps and calendar logic, with
its own illustrations and three ideas of its own:

- **Message in a bottle.** The page opens as a corked bottle on wet sand. On
  tap the cork pops, the bottle tips and the rolled invitation slides out and
  unfurls into the site.
- **A sky painted at the guest's hour.** The hero reads the local time and
  paints dawn, midday, golden hour, dusk or a starry night, with
  bioluminescent waves after dark. The sun/moon button cycles through them.
- **It paints itself as you scroll.** Washes bloom in from the centre with a
  feathered edge and headings get a brush stroke that sweeps in underneath.
  The waves roll continuously, and the RSVP is a postcard with a stamp and
  postmark.

The watercolour look is an SVG filter (`#wc` in the sprite): a displaced
ragged edge, soft bleed, pigment granulation and darker pooling where the
wash dries. Washes overlap with multiply blending the way real pigment does.

## Editorial minimal variant

`editorial/` is a third invitation, typeset like a magazine issue, for a
wedding in a converted shipyard hall in Copenhagen, in English and Danish.
Open `editorial/index.html`. Ink on uncoated paper, hairlines, Bodoni Moda,
Instrument Sans and DM Mono, with one cobalt accent. Its own ideas:

- **Issue No. 1.** A masthead, a typographic cover with the names as the
  cover line and a barcode that encodes the date, a contents page with
  dotted leaders, and a living folio at the foot of the screen that shows
  which page you are on as you scroll.
- **It prints itself.** The opening is a printing pass: a cobalt line sweeps
  down the page and the ink appears beneath it.
- **Split-flap countdown.** Days, hours and minutes on a departure-board
  that flips into place on load and flips each minute.
- **Line drawings drawn by scrolling.** The hall, a bicycle, two coupes, the
  couple in profile, the harbour-bath ladder and a gift, each a single ink
  line that draws itself as it comes into view.
- **Editorial details.** A story headlined with its live word count, a drop
  cap, pull quotes, a schedule set as a table, colour swatches for the dress
  code, a reply card with a cut line, and a colophon.

## Wax seal and vellum variant

`wax/` is a fourth invitation: a sealed parchment letter for a candlelit
wedding in a villa above the Val d'Orcia, in English and Italian. Open
`wax/index.html`. Its own ideas:

- **Break the seal.** The page arrives as a folded letter closed with
  burgundy wax. Press and hold: cracks spread through the wax, the seal
  splits and falls away, the flap lifts and the letter opens into the site.
  A tap, Enter or the auto-open do the same.
- **Candlelight.** A candle in the corner flickers and the light on the
  parchment breathes with it, warm near the flame and shaded at the edges.
- **Vellum.** A translucent vellum sheet slides off the names after the
  letter opens, and every chapter title sits on its own vellum band.
- **A seal for every chapter.** Olive branch, key, moon, bee, candle, laurel
  and rings, pressed in burgundy, forest, navy and old gold. Every seal is
  generated (`seals.js`), so no two rims or drips are alike. The RSVP
  button is a wax seal that presses down and stamps your reply.
- Deckled parchment cards, a hand-written letter from the couple, ink
  drawings of the villa, an olive branch, a bicycle and an oak.
