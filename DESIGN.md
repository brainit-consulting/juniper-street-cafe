# DESIGN.md — Juniper Street Café catering orders

Source: no reference site — direction chosen from the brief, plus the owner's standing rules (no AI-default look in words or pixels).
Written: 2026-10-22

**Design read:** a shared order book for two people at a café counter, used mostly on a phone with flour on one hand. Warm paper, ink-dark text, one juniper green. It should feel like a good notebook that happens to remember things.

**Dials:** VARIANCE 4 · MOTION 1 · DENSITY 6
Low variance and almost no motion because this is a working tool. Medium-high density because the point is seeing several orders at once without scrolling.

## 1. Tokens
These go straight into `src/app/globals.css`. Nothing in this app sets a colour anywhere else.

Light only. There is no dark mode in this app.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--background` | `#F5EFE3` | light only | page surface, warm paper |
| `--foreground` | `#2B2118` | light only | primary text, brown-black |
| `--card` / `--card-foreground` | `#FBF8F1` / `#2B2118` | light only | a slightly lighter sheet, used only for forms and the order detail |
| `--popover` / `--popover-foreground` | `#FBF8F1` / `#2B2118` | light only | menus, selects, dialogs (same as card) |
| `--muted` / `--muted-foreground` | `#EAE2D0` / `#6B5E4C` | light only | quiet fills, secondary text |
| `--secondary` / `--secondary-foreground` | `#EAE2D0` / `#2B2118` | light only | the quiet button |
| `--accent` / `--accent-foreground` | `#EAE2D0` / `#2B2118` | light only | hover and selected rows in menus (muted fill, not the brand colour) |
| `--border` | `#D6CAB1` | light only | 1px structure |
| `--input` | `#BFB093` | light only | field outlines, one step darker than border so fields are findable |
| `--ring` | `#2E5E4E` | light only | focus outline |
| `--primary` / `--primary-foreground` | `#2E5E4E` / `#FBF8F1` | light only | juniper green, primary actions and the "soon" marker only |
| `--destructive` | `#A33A2A` | light only | cancel, delete, danger |
| `--radius` | `0.25rem` | light only | small, square-ish corners |

## 2. Typography
- **Display:** Young Serif, one weight (400), used for page titles, the big day numerals and the café name. Tracking normal, leading 1.1.
- **Body:** Albert Sans, weights 400, 500 and 600. Base size 17px on phones for readability, leading 1.5, measure capped at 65ch.
- **Loaded via:** `next/font/google` in `src/app/layout.tsx`, as `--app-font-display` and `--app-font-body`.
- **Substituted:** none. Both are open fonts.

## 3. Elevation & shape
Flat. 1px borders in `--border`, no shadows anywhere, no backdrop blur. Corners are 4px. A card (the lighter sheet) is used only where a form or a single order's detail needs to read as one object. Lists of orders are rows divided by rules, not boxes.

## 4. Layout & density
One column on a phone, 16px side gutters, rows at least 56px tall so a thumb can hit them. On a laptop the column widens to about 960px and left-aligns; it is not centred in a sea of space. The day numeral in each order row hangs in the left margin, larger than the text beside it. That is the one deliberate break from the grid. Text is left-aligned throughout.

## 5. Motion
Almost none. Buttons and links change colour on hover and press. Dialogs and the help panel appear without sliding. Nothing animates in the background.

## 6. Components
- Buttons and inputs are at least 44px high; the primary button is solid juniper green with no gradient.
- Status is a word, not an icon: "Upcoming", "Done", "Cancelled", set in small caps. Cancelled rows are struck through and drawn in `--muted-foreground`.
- Orders due today or tomorrow get a 3px juniper rule on the left edge and a bolder date. Overdue upcoming orders (date passed, not marked done) get the same rule in `--destructive` and the word "Overdue".
- Empty states say what to do in a plain sentence ("No orders coming up. Add one when the phone rings.").
- Dialogs and the help guide use a solid dimmed overlay. No blur.

## 7. Banned in this project
- No purple-to-blue or any other gradient. No glowing orbs, drifting particles or animated background shapes.
- No glassmorphism or backdrop blur. No soft floating shadows.
- No perspective grids or "digital horizon" backgrounds.
- No Inter, Roboto, Arial, Space Grotesk or system font stacks.
- No centred body copy.
- No rounded floating cards. No three equal cards in a row.
- No pure `#000000` or pure `#FFFFFF` text on saturated fills.
- No fabricated proof: testimonials, logos, star ratings, user counts.
- No filler chrome ("Scroll to explore", bouncing chevrons).
- No AI copy clichés: "seamless", "robust", "elevate", "unlock", "leverage", "supercharge".
- No emoji as UI iconography.
- No `h-screen`; use `min-h-[100dvh]`.
- No round fake numbers in sample data.
- Copy test: if a sentence would sound odd said out loud to a customer across the counter, rewrite it.

## 8. Provenance
No reference site. Palette from paper, ink and juniper foliage; type chosen for warmth and legibility on a small screen. The rules in section 7 come from the owner's global working preferences. No assets, copy or CSS were copied from anywhere.
