# Figma cache — Admin canvas (`8:5`)

Fetched once on Oct 15, 2026 (file `n4jeiTmk2hncNwdAvGJQOa`, node `8:5`, depth 3).
Do not fetch this canvas again; any deeper read needs a fresh human approval.

Frames on the canvas: `Admin / Inbox` (`14:158`, 1360 wide), `Lead / Priya Shah` (`15:2`,
860 wide), `Admin / Settings` (`15:60`, 1360 wide). There is no sign in frame; that
screen is designed from the Phase 1 system.

Canvas caption text (`14:157`): "03 Admin · Inbox. Urgent leads stay pinned. Every
status change is an event."

Palette and type match `docs/design/mcp/site.md`: sand page background `#F4EFE7`,
paper cards `#FBF8F3`, cedar accents `#1C4A3C`, line borders `#E4DACA`, ink text
`#16241E`, mute `#5C675F`, soft `#3E4A44`, deep sidebar `#102E26`. Fraunces SemiBold
headlines, Instrument Sans for UI.

## Admin / Inbox (`14:158`)

Row layout, sand background, two columns:

- **Sidebar** (`14:159`): fixed 232 wide, full height, bg deep `#102E26`, padding
  `22px 16px 20px`, column, gap 6.
  - "Apex" Fraunces SemiBold 24, paper.
  - "OWNER DESK" Instrument Sans Medium 11, letter spaced, color `#8FB3A4`.
  - Nav column (children not expanded at this depth): Inbox, Settings items, gap 4.
  - **Emergency mode** panel (`14:167`): bg `#173E33`, radius 14, padding `14px 12px`,
    gap 8 — the emergency mode toggle lives in the sidebar on every admin screen.
  - "Who" block (`14:173`): padding top 18 — signed in admin label / sign out.
- **Main** (`14:176`): column, padding 24, gap 16.
  - Title row: space between (page title left, actions right).
  - Filters (`14:183`): row, centered, gap 8 — pill chips (template: paper fill, 1px
    line border, radius 999, padding `10px 14px`, Instrument Sans Medium 13; active
    variant: cedar fill, paper text).
  - Leads list (`14:198`): column, fill width, gap 8 — stacked lead cards.

## Lead / Priya Shah (`15:2`)

Column, sand bg, 860 wide (content column; sits inside the same shell), padding
`24px 28px 28px`, gap 18:

- "Back to inbox" link, cedar, Instrument Sans Medium 14.
- **Head**: name block (column, gap 8) left; status pill right (paper fill, line
  border, radius 999, padding `8px 12px`).
- **Columns** row, gap 16: **Facts** card and **Timeline** card — both paper fill,
  1px line border, radius 16, padding 16.
- **Note** block: label "Note", note box (paper, line border, radius 12, padding
  `12px 12px 28px`).
- **Actions** row, gap 8, centered:
  - "Add note" — pill, paper fill, line border, radius 999.
  - "Mark contacted" — primary pill, cedar fill, paper text, radius 999.
  - "Mark scheduled" / "Completed" — paper pill, line border.
  - "Spam" — pill, radius 999 (heat/danger styling expected at build).

## Admin / Settings (`15:60`)

Column, 1360 wide, padding `24px 28px 28px`, gap 16:

- "Settings" Fraunces SemiBold 32, ink.
- Lede (Instrument Sans Regular 15/22, soft `#3E4A44`, 860 wide): "The owner edits
  the offer, the hours, and whether the site says the emergency line is open. Nothing
  here bills a customer."
- **Setting cards** row, gap 12 — three cards (template: paper fill, 1px line border,
  radius 16, padding 16, column, gap 8):
  1. **Emergency mode** (`15:64`) — toggle + banner text.
  2. **Seasonal offer** (`15:72`) — offer title, body, dates, active flag.
  3. **The business** (`15:83`) — phone, business hours, TDLR license (read only).
- **Save settings** (`15:94`): primary pill, cedar fill, paper text, radius 999,
  Instrument Sans SemiBold 13.

## Build notes

- Shell: sidebar plus main, same on inbox and settings; lead detail uses the same
  sidebar with the content column at 860.
- Row and list inner text (nav labels, filter chip labels, lead card fields, facts
  rows, timeline events) was not expanded at depth 3. Build those from the Phase 2
  data model (leads columns, lead_events kinds) and the copy patterns in
  `site.md`; do not fetch deeper without a new human approval.
- All colors and type come from the design tokens in `app/globals.css`; no new
  tokens should be needed beyond what Phase 1 shipped.
