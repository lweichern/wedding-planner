# The Garden Invitation

A complete, mobile-first wedding e-invitation inspired by illustrated French wedding stationery. Built with Vite, vanilla JavaScript, Express, and SQLite. Requires Node.js 24 or newer.

## Run

```sh
npm ci
npm run dev
```

The app listens on port **3000** (override with `PORT`). The same server handles the invitation and its RSVP API.

For production:

```sh
npm run build
npm start
```

## Personalize

Edit `src/wedding.js` for names, initials, date, venue, map URL, story, RSVP deadline, and sample mode. Keep the date labels consistent with the ISO timestamp; its explicit timezone offset drives the countdown and calendar download.

Additional invitation copy, the event schedule, next-day gathering, and FAQ are in `src/main.js`. Visual tokens and responsive styles are in `src/style.css`. Page title and description are in `index.html`.

All wedding details are samples. The venue illustration is original generated artwork inspired by French country estates, not a factual illustration of the named venue. The supplied invitation is not a booking or a real event announcement. Review all copy before sharing and set `isSample` to `false` when replacing the sample event.

## Included

- Custom château artwork, botanical illustrations, locally bundled fonts, textured paper palette.
- Optional two-stage monogram/paper-gate and curtain animation with skip, replay, focus management, and reduced-motion support.
- Live wedding countdown, illustrated timeline, venue map link, timezone-correct `.ics` calendar export.
- Dress code, next-day gathering, gifts note, expandable FAQs.
- RSVP form with conditional attendance fields, validation, persistent storage, confirmation, error recovery, and editing from the same browser.
- Responsive layouts tested at 360, 390, 768, and 1440 pixels.

## RSVP storage

Responses are saved on the server to `.data/rsvps.sqlite`; this file is intentionally ignored by Git. Override its location with `RSVP_DB_PATH`. The server validates input and uses parameterized queries. A response token stored in the guest's browser is required to update a response for the same email.

The browser keeps the submitted response and edit token locally to support repeat visits. Clearing browser storage removes that browser's ability to edit an existing response. No confirmation email is sent, and no email service or third-party RSVP provider is configured.

For a public deployment, use a Node host with a persistent writable disk, preserve/back up the SQLite database, and configure HTTPS. The current implementation does not include an organizer dashboard or guest-specific invitation authentication.

## Verify

```sh
npm test
```

Tests build and run the production app against a temporary database. They cover API validation and persistence, unauthorized edit prevention, responsive rendering and asset loading, opening/replay/skip, RSVP acceptance and decline, offline failure recovery, calendar timezone output, FAQs, and reduced motion.

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to use a different installed Chromium executable. Test responses do not touch the development database.
