# Colour Palette Contrast Checker

A small web app that checks the colour contrast of **every combination in a colour palette** at once, against WCAG 2.2.

Most contrast checkers test one text colour against one background. This tool takes a whole palette and shows which pairs work for normal text, large text and UI components, so you can see at a glance which colours can be used together.

Built with plain HTML, PHP, CSS and JavaScript. No frameworks, no build step and no external requests.

## Features

- **Unlimited colours.** The tool starts with one random colour, and you can add as many as you like.
- **HEX by default, with an RGB/HSL picker.** Type a HEX value (3 or 6 digits) or click the swatch to open a picker with HEX, RGB and HSL tabs. The picker also has the system colour picker.
- **Automatic colour names.** Each colour gets the name of its nearest named colour (e.g. `#F2E2BA` becomes *Soft Butter*). Type over the name to use your own. The reset button brings the automatic name back.
- **WCAG 2.2 AA (default) or AAA.**
- **Three checks per pair:**

  | Check | AA | AAA |
  |---|---|---|
  | Normal text | 4.5:1 | 7:1 |
  | Large text | 3:1 | 4.5:1 |
  | UI components & graphics (SC 1.4.11) | 3:1 | 3:1 |

- **Two results views:**
  - **Cards.** One card per background colour, with every other colour on it as text.
  - **Table.** Every combination. Rows are text colours, columns are backgrounds.

  Cards is the default view. Your choice is saved in the share link.
- **Only show passing pairs.** Hides pairs that fail even the large-text check.
- **Remove and reorder.** Drag the handle to reorder (works with mouse and touch, no library), or use the arrow buttons. Keyboard users can focus the handle and press the arrow keys.
- **Share link.** The page address always holds the current palette and settings, and *Copy share link* copies it.
- **Export CSS.** Copies the palette as CSS custom properties in HEX, RGB or HSL, named after the colours:

  ```css
  :root {
    --soft-butter: #f2e2ba;
    --brand-blue: #bad7f2;
  }
  ```

- **Light and dark themes.** It follows the system setting by default, and the choice is remembered in the browser.
- **Installable and works offline**, via a web app manifest and a service worker.
- **Accessible.** It's fully keyboard operable, and screen readers hear changes announced. Results never rely on colour alone: each one has a ✓/✗ icon and the word *Pass* or *Fail*.

## Files

```
colour-palette-contrast-checker/
├── index.php                    Standalone page
├── partials/checker.php         The tool's markup
├── assets/css/cpc.css           All styles, scoped under .cpc
├── assets/js/cpc.js             All logic, no dependencies
├── assets/data/colour-names.json  ~5,000 colour names (loaded in the background)
├── manifest.webmanifest         Web app manifest
├── sw.js                        Service worker (offline support)
├── assets/icons/                App icons (SVG + PNG)
└── README.md
```

## Installation

Upload the folder to any server with PHP (any version from 5.4) and open it in a browser:

```
https://example.com/colour-palette-contrast-checker/
```

The service worker (offline support and *Install app*) only runs over **HTTPS** or on `localhost`.

## URL parameters

The address updates as you work, so any URL is a shareable snapshot. Other query parameters on the page are kept.

| Parameter | Example | Meaning |
|---|---|---|
| `c` | `c=f2e2ba-bad7f2-e94560` | Colours, as HEX values without `#`, separated by `-` |
| `n` | `n=Cream\|Brand Blue\|` | Custom names, in the same order, separated by `\|`. An empty entry means the automatic name. Only added when you have changed a name. |
| `level` | `level=aaa` | WCAG level (leave it out for AA) |
| `view` | `view=table` | Show the table view (leave it out for cards, the default) |
| `hide` | `hide=1` | Only show passing pairs |

## Updating the files

Browsers and the service worker cache the CSS and JavaScript. After changing them, bump the version number in **both** places so everyone gets the new files:

- `$cpc_version` in `index.php`
- `CACHE_VERSION` in `sw.js`

## How contrast is calculated

The tool uses the WCAG 2.2 relative luminance formula:

- Each sRGB channel is linearised (`c ≤ 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ^ 2.4`).
- L = 0.2126 R + 0.7152 G + 0.0722 B.
- The ratio is (L1 + 0.05) / (L2 + 0.05).

Ratios are shown **rounded down** to two decimals, so a ratio shown as 4.50:1 never hides a 4.499:1 that would fail.

Colour names are matched by the smallest distance in the OKLab colour space, which is close to how people perceive colour differences.

## Browser support

All current versions of Chrome, Edge, Firefox and Safari, on desktop and mobile.

## To do

- **Embedding in another page.** Let the tool be included inside an existing page of a website (not only used as a standalone page). An early attempt didn't work well, so this needs more work before it's supported.

## Credits

- Colour names: [color-name-list](https://github.com/meodai/color-names) ("best of" list) by David Aerne, MIT licence.
- Contrast guidance: [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/).
