<?php
/**
 * Colour Palette Contrast Checker – tool markup.
 *
 * Include this file wherever you want the tool to appear, and load
 * assets/css/cpc.css and assets/js/cpc.js on the same page.
 *
 * Optional variables you can set before including it:
 *   $cpc_base        URL (relative or absolute) of the tool folder, with a trailing slash.
 *                    Used by the JavaScript to load the colour names. Default: ''.
 *   $cpc_standalone  true when used as a full page (index.php). Uses an <h1> for the
 *                    title and registers the service worker. Default: false.
 */

$cpc_base       = isset($cpc_base) ? $cpc_base : '';
$cpc_standalone = !empty($cpc_standalone);

// Heading levels: h1 on the standalone page, h2 when embedded in another page.
$cpc_h1 = $cpc_standalone ? 1 : 2;
$cpc_h2 = $cpc_h1 + 1;
$cpc_h3 = $cpc_h2 + 1;

if (!function_exists('cpc_e')) {
    function cpc_e($value)
    {
        return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
    }
}
?>
<div class="cpc<?= $cpc_standalone ? ' cpc--standalone' : '' ?>" data-cpc data-cpc-base="<?= cpc_e($cpc_base) ?>" data-cpc-heading="<?= $cpc_h3 ?>"<?= $cpc_standalone ? ' data-cpc-sw' : '' ?>>
    <script>try{var t=localStorage.getItem('cpc-theme');if(t==='light'||t==='dark'){document.currentScript.parentNode.setAttribute('data-theme',t);}}catch(e){}</script>

    <div class="cpc-strip" data-cpc-strip aria-hidden="true"></div>

    <header class="cpc-header">
        <div class="cpc-container cpc-header__inner">
            <h<?= $cpc_h1 ?> class="cpc-title">
                <svg class="cpc-title__logo" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                    <rect x="2" y="2" width="13" height="13" rx="0" fill="#ffffff"/>
                    <rect x="17" y="2" width="13" height="13" rx="0" fill="#000000"/>
                    <rect x="2" y="17" width="13" height="13" rx="0" fill="#9C0D38"/>
                    <rect x="17" y="17" width="13" height="13" rx="0" fill="#FFB006"/>
                </svg>
                <span>Colour Palette <span class="cpc-title__accent">Contrast Checker</span></span>
            </h<?= $cpc_h1 ?>>

            <fieldset class="cpc-segmented cpc-segmented--small" data-cpc-theme>
                <legend class="cpc-sr">Theme</legend>
                <label><input type="radio" name="cpc-theme" value="system" checked><span>System</span></label>
                <label><input type="radio" name="cpc-theme" value="light"><span>Light</span></label>
                <label><input type="radio" name="cpc-theme" value="dark"><span>Dark</span></label>
            </fieldset>
        </div>
    </header>

    <main class="cpc-main">
        <section class="cpc-container cpc-intro" aria-label="About this tool">
            <p class="cpc-intro__lead">Check every colour in your palette against every other colour, all at once.</p>
            <p>Add your colours and see which pairs are safe for text and interface elements under <abbr title="Web Content Accessibility Guidelines">WCAG</abbr>&nbsp;2.2. Then share the palette or copy it as CSS.</p>
        </section>

        <section class="cpc-container cpc-panel cpc-settings" aria-labelledby="cpc-settings-title">
            <h<?= $cpc_h2 ?> id="cpc-settings-title" class="cpc-sr">Settings</h<?= $cpc_h2 ?>>

            <div class="cpc-settings__group">
                <fieldset class="cpc-segmented" data-cpc-level>
                    <legend class="cpc-label">WCAG 2.2 level</legend>
                    <label><input type="radio" name="cpc-level" value="aa" checked><span>AA</span></label>
                    <label><input type="radio" name="cpc-level" value="aaa"><span>AAA</span></label>
                </fieldset>

                <fieldset class="cpc-segmented" data-cpc-view>
                    <legend class="cpc-label">Results view</legend>
                    <label><input type="radio" name="cpc-view" value="cards" checked><span>
                        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="11" y="3" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="11" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="11" y="11" width="6" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                        Cards</span></label>
                    <label><input type="radio" name="cpc-view" value="table"><span>
                        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M3 3h14v14H3zM3 8h14M3 12.5h14M8 3v14M12.5 3v14" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
                        Table</span></label>
                </fieldset>

                <label class="cpc-switch">
                    <input type="checkbox" data-cpc-hide>
                    <span class="cpc-switch__track" aria-hidden="true"></span>
                    <span>Only show passing pairs</span>
                </label>
            </div>

            <div class="cpc-settings__actions">
                <button type="button" class="cpc-btn" data-cpc-share>
                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M8.5 11.5a3.5 3.5 0 0 0 5 0l2.5-2.5a3.5 3.5 0 0 0-5-5l-1 1M11.5 8.5a3.5 3.5 0 0 0-5 0L4 11a3.5 3.5 0 0 0 5 5l1-1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    Copy share link
                </button>
                <button type="button" class="cpc-btn" data-cpc-export>
                    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M7 5 2.5 10 7 15M13 5l4.5 5L13 15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    Export CSS
                </button>
            </div>
        </section>

        <section class="cpc-container cpc-palette" aria-labelledby="cpc-palette-title">
            <div class="cpc-section-head">
                <h<?= $cpc_h2 ?> id="cpc-palette-title" class="cpc-h2">Your palette</h<?= $cpc_h2 ?>>
                <p class="cpc-muted" id="cpc-palette-hint">Click a swatch for the RGB/HSL picker. To reorder, drag the handle or use the arrow buttons.</p>
            </div>

            <ol class="cpc-tiles" data-cpc-tiles aria-describedby="cpc-palette-hint"></ol>

            <button type="button" class="cpc-btn cpc-btn--primary cpc-add" data-cpc-add>
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                Add colour
            </button>
        </section>

        <section class="cpc-container cpc-results" aria-labelledby="cpc-results-title">
            <div class="cpc-section-head">
                <h<?= $cpc_h2 ?> id="cpc-results-title" class="cpc-h2">Results</h<?= $cpc_h2 ?>>
                <p class="cpc-summary" data-cpc-summary aria-live="polite"></p>
            </div>
            <div data-cpc-results>
                <noscript><p class="cpc-panel">This tool needs JavaScript to calculate the contrast ratios.</p></noscript>
            </div>
        </section>

        <section class="cpc-container cpc-info" aria-labelledby="cpc-info-title">
            <h<?= $cpc_h2 ?> id="cpc-info-title" class="cpc-h2">How to use it</h<?= $cpc_h2 ?>>
            <ol class="cpc-steps">
                <li><strong>Add your colours.</strong> Type a HEX value, or click a swatch to open the picker with HEX, RGB and HSL controls.</li>
                <li><strong>Name them.</strong> Each colour gets a name automatically. Type over it to use your own. The reset button brings the automatic name back.</li>
                <li><strong>Order them.</strong> Drag a colour by its handle, or use the arrow buttons. You can also focus the handle and use the arrow keys.</li>
                <li><strong>Pick a level.</strong> AA is the usual target. AAA is stricter.</li>
                <li><strong>Read the results.</strong> In card view, each card is one background colour with every other colour on it as text. In the table, rows are the text colours and columns are the backgrounds.</li>
                <li><strong>Share or export.</strong> The page address always holds your palette and settings. Copy the link to share it, or export the colours as CSS custom properties.</li>
            </ol>

            <h<?= $cpc_h2 ?> class="cpc-h2">WCAG 2.2 contrast guidance</h<?= $cpc_h2 ?>>
            <div class="cpc-info__grid">
                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">What the ratio means</h<?= $cpc_h3 ?>>
                    <p>The contrast ratio compares the relative luminance (brightness) of two colours. It goes from <strong>1:1</strong> (no contrast, e.g. white on white) to <strong>21:1</strong> (black on white).</p>
                    <p>The ratio is the same whichever colour is the text, but the two combinations can look quite different. That's why the table shows both.</p>
                </div>

                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">Minimum ratios</h<?= $cpc_h3 ?>>
                    <table class="cpc-info__table">
                        <thead>
                            <tr><th scope="col">Content</th><th scope="col">AA</th><th scope="col">AAA</th></tr>
                        </thead>
                        <tbody>
                            <tr><th scope="row">Normal text</th><td>4.5:1</td><td>7:1</td></tr>
                            <tr><th scope="row">Large text</th><td>3:1</td><td>4.5:1</td></tr>
                            <tr><th scope="row">UI components &amp; graphics</th><td>3:1</td><td>3:1</td></tr>
                        </tbody>
                    </table>
                    <p class="cpc-muted">UI components and graphics have no separate AAA requirement. 3:1 applies at both levels.</p>
                </div>

                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">What counts as large text</h<?= $cpc_h3 ?>>
                    <p>At least <strong>18pt (24px)</strong> in regular weight, or at least <strong>14pt (about 18.7px)</strong> in bold.</p>
                    <p><strong>Don't round up.</strong> A ratio of 4.49:1 does not meet 4.5:1. This tool rounds ratios down so a pass is always a real pass.</p>
                </div>

                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">UI components &amp; graphics</h<?= $cpc_h3 ?>>
                    <p>Input borders, focus indicators, icons and chart lines must have at least <strong>3:1</strong> contrast against the colours next to them. Use the <em>UI</em> result for these.</p>
                    <p>Logos, decorative elements and disabled controls are exempt.</p>
                </div>

                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">Don't rely on colour alone</h<?= $cpc_h3 ?>>
                    <p>Even with good contrast, colour should never be the only way to show information. Add text, icons or patterns too (for example, underline links and add icons to error messages).</p>
                </div>

                <div class="cpc-info__card">
                    <h<?= $cpc_h3 ?> class="cpc-h3">Further reading</h<?= $cpc_h3 ?>>
                    <ul class="cpc-links">
                        <li><a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html" rel="noopener">1.4.3 Contrast (Minimum), AA</a></li>
                        <li><a href="https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html" rel="noopener">1.4.6 Contrast (Enhanced), AAA</a></li>
                        <li><a href="https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" rel="noopener">1.4.11 Non-text Contrast, AA</a></li>
                        <li><a href="https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" rel="noopener">1.4.1 Use of Color, A</a></li>
                    </ul>
                </div>
            </div>
        </section>
    </main>

    <footer class="cpc-footer">
        <div class="cpc-container">
            <p>Colour names from <a href="https://github.com/meodai/color-name-list" rel="noopener">color-name-list</a> by David Aerne (MIT licence). Contrast calculated with the WCAG 2.2 relative luminance formula.</p>
        </div>
    </footer>

    <!-- Colour picker (one shared instance, positioned next to the swatch being edited) -->
    <div class="cpc-picker" data-cpc-picker role="dialog" aria-labelledby="cpc-picker-title" hidden>
        <div class="cpc-picker__preview" data-cpc-picker-preview>
            <span id="cpc-picker-title" data-cpc-picker-title>Edit colour</span>
            <button type="button" class="cpc-icon-btn" data-cpc-picker-close aria-label="Close colour picker">
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>

        <div class="cpc-tabs" role="tablist" aria-label="Colour format">
            <button type="button" role="tab" id="cpc-tab-hex" aria-controls="cpc-panel-hex" data-cpc-tab="hex">HEX</button>
            <button type="button" role="tab" id="cpc-tab-rgb" aria-controls="cpc-panel-rgb" data-cpc-tab="rgb">RGB</button>
            <button type="button" role="tab" id="cpc-tab-hsl" aria-controls="cpc-panel-hsl" data-cpc-tab="hsl">HSL</button>
        </div>

        <div class="cpc-picker__panel" role="tabpanel" id="cpc-panel-hex" aria-labelledby="cpc-tab-hex" data-cpc-panel="hex">
            <label class="cpc-field">
                <span class="cpc-label">HEX</span>
                <span class="cpc-hex-input">
                    <span aria-hidden="true">#</span>
                    <input type="text" data-cpc-picker-hex maxlength="7" autocomplete="off" spellcheck="false" autocapitalize="off">
                </span>
            </label>
            <div class="cpc-picker__extras">
                <label class="cpc-btn cpc-btn--small cpc-native">
                    <input type="color" data-cpc-picker-native>
                    System picker
                </label>
            </div>
        </div>

        <div class="cpc-picker__panel" role="tabpanel" id="cpc-panel-rgb" aria-labelledby="cpc-tab-rgb" data-cpc-panel="rgb" hidden>
            <div class="cpc-slider"><label for="cpc-r">Red</label><input type="range" id="cpc-r" min="0" max="255" step="1" data-cpc-ch="r"><input type="number" min="0" max="255" step="1" data-cpc-ch="r" aria-label="Red value"></div>
            <div class="cpc-slider"><label for="cpc-g">Green</label><input type="range" id="cpc-g" min="0" max="255" step="1" data-cpc-ch="g"><input type="number" min="0" max="255" step="1" data-cpc-ch="g" aria-label="Green value"></div>
            <div class="cpc-slider"><label for="cpc-b">Blue</label><input type="range" id="cpc-b" min="0" max="255" step="1" data-cpc-ch="b"><input type="number" min="0" max="255" step="1" data-cpc-ch="b" aria-label="Blue value"></div>
        </div>

        <div class="cpc-picker__panel" role="tabpanel" id="cpc-panel-hsl" aria-labelledby="cpc-tab-hsl" data-cpc-panel="hsl" hidden>
            <div class="cpc-slider"><label for="cpc-h">Hue</label><input type="range" id="cpc-h" min="0" max="360" step="1" data-cpc-ch="h"><input type="number" min="0" max="360" step="1" data-cpc-ch="h" aria-label="Hue in degrees"></div>
            <div class="cpc-slider"><label for="cpc-s">Saturation</label><input type="range" id="cpc-s" min="0" max="100" step="1" data-cpc-ch="s"><input type="number" min="0" max="100" step="1" data-cpc-ch="s" aria-label="Saturation percentage"></div>
            <div class="cpc-slider"><label for="cpc-l">Lightness</label><input type="range" id="cpc-l" min="0" max="100" step="1" data-cpc-ch="l"><input type="number" min="0" max="100" step="1" data-cpc-ch="l" aria-label="Lightness percentage"></div>
        </div>

        <div class="cpc-picker__footer">
            <button type="button" class="cpc-btn cpc-btn--primary cpc-btn--small" data-cpc-picker-done>Done</button>
        </div>
    </div>

    <!-- Export CSS dialog -->
    <dialog class="cpc-dialog" data-cpc-export-dialog aria-labelledby="cpc-export-title">
        <div class="cpc-dialog__head">
            <h<?= $cpc_h2 ?> id="cpc-export-title" class="cpc-h3">Export CSS</h<?= $cpc_h2 ?>>
            <button type="button" class="cpc-icon-btn" data-cpc-export-close aria-label="Close">
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5 5 10 10M15 5 5 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <fieldset class="cpc-segmented cpc-segmented--small" data-cpc-export-format>
            <legend class="cpc-label">Colour format</legend>
            <label><input type="radio" name="cpc-export-format" value="hex" checked><span>HEX</span></label>
            <label><input type="radio" name="cpc-export-format" value="rgb"><span>RGB</span></label>
            <label><input type="radio" name="cpc-export-format" value="hsl"><span>HSL</span></label>
        </fieldset>
        <label class="cpc-sr" for="cpc-export-code">CSS code</label>
        <textarea id="cpc-export-code" class="cpc-code" data-cpc-export-code readonly rows="8" spellcheck="false"></textarea>
        <div class="cpc-dialog__foot">
            <button type="button" class="cpc-btn cpc-btn--primary" data-cpc-export-copy>
                <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="7" y="7" width="10" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
                Copy CSS
            </button>
        </div>
    </dialog>

    <div class="cpc-toast" data-cpc-toast role="status" aria-live="polite"></div>
    <div class="cpc-sr" data-cpc-live aria-live="polite"></div>
</div>
