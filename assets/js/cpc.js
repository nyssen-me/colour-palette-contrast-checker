/*!
 * Colour Palette Contrast Checker
 * Plain JavaScript, no dependencies.
 */
(function () {
    'use strict';

    var root = document.querySelector('[data-cpc]');
    if (!root) return;

    var BASE = root.getAttribute('data-cpc-base') || '';
    var HEADING = parseInt(root.getAttribute('data-cpc-heading'), 10) || 3;

    var LEVELS = {
        aa:  { label: 'AA',  normal: 4.5, large: 3 },
        aaa: { label: 'AAA', normal: 7,   large: 4.5 }
    };
    var UI_MIN = 3; // SC 1.4.11 Non-text Contrast (AA only, no AAA equivalent)

    /* ======================================================================
       Colour maths
       ====================================================================== */

    function normaliseHex(value) {
        var hex = String(value || '').trim().replace(/^#/, '').toLowerCase();
        if (/^[0-9a-f]{3}$/.test(hex)) {
            hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
        }
        return /^[0-9a-f]{6}$/.test(hex) ? hex : null;
    }

    function hexToRgb(hex) {
        var n = parseInt(hex, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    function rgbToHex(rgb) {
        return [rgb.r, rgb.g, rgb.b].map(function (v) {
            var s = clamp(Math.round(v), 0, 255).toString(16);
            return s.length === 1 ? '0' + s : s;
        }).join('');
    }

    function rgbToHsl(rgb) {
        var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var l = (max + min) / 2;
        var h = 0, s = 0;
        if (max !== min) {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h *= 60;
        }
        return { h: h, s: s * 100, l: l * 100 };
    }

    function hslToRgb(hsl) {
        var h = ((hsl.h % 360) + 360) % 360 / 360;
        var s = clamp(hsl.s, 0, 100) / 100;
        var l = clamp(hsl.l, 0, 100) / 100;
        if (s === 0) {
            var v = Math.round(l * 255);
            return { r: v, g: v, b: v };
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        function hue(t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }
        return {
            r: Math.round(hue(h + 1 / 3) * 255),
            g: Math.round(hue(h) * 255),
            b: Math.round(hue(h - 1 / 3) * 255)
        };
    }

    function srgbToLinear(channel) {
        var c = channel / 255;
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }

    // WCAG 2.2 relative luminance
    var luminanceCache = {};
    function luminance(hex) {
        if (luminanceCache[hex] === undefined) {
            var rgb = hexToRgb(hex);
            luminanceCache[hex] = 0.2126 * srgbToLinear(rgb.r) + 0.7152 * srgbToLinear(rgb.g) + 0.0722 * srgbToLinear(rgb.b);
        }
        return luminanceCache[hex];
    }

    function contrastRatio(hexA, hexB) {
        var a = luminance(hexA), b = luminance(hexB);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    }

    // Always round down, so a displayed 4.50 is never really 4.499
    function formatRatio(ratio) {
        return (Math.floor(ratio * 100) / 100).toFixed(2);
    }

    // Black or white, whichever reads better on the given colour
    function readableOn(hex) {
        return contrastRatio(hex, '000000') >= contrastRatio(hex, 'ffffff') ? '#000000' : '#ffffff';
    }

    // OKLab, used to find the perceptually nearest colour name
    function toOklab(hex) {
        var rgb = hexToRgb(hex);
        var r = srgbToLinear(rgb.r), g = srgbToLinear(rgb.g), b = srgbToLinear(rgb.b);
        var l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
        var m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
        var s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
        return [
            0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
        ];
    }

    function formatColour(hex, format) {
        if (format === 'rgb') {
            var rgb = hexToRgb(hex);
            return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
        }
        if (format === 'hsl') {
            var hsl = rgbToHsl(hexToRgb(hex));
            return 'hsl(' + round1(hsl.h) + ', ' + round1(hsl.s) + '%, ' + round1(hsl.l) + '%)';
        }
        return '#' + hex;
    }

    function randomHex() {
        return rgbToHex(hslToRgb({
            h: Math.random() * 360,
            s: 35 + Math.random() * 50,
            l: 25 + Math.random() * 55
        }));
    }

    /* ======================================================================
       Helpers
       ====================================================================== */

    function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }
    function round1(v) { return Math.round(v * 10) / 10; }
    function q(sel, ctx) { return (ctx || root).querySelector(sel); }
    function qa(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

    function esc(value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function storageGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }

    function storageSet(key, value) {
        try {
            if (value === null) window.localStorage.removeItem(key);
            else window.localStorage.setItem(key, value);
        } catch (e) { /* storage unavailable */ }
    }

    function debounce(fn, wait) {
        var t;
        return function () {
            clearTimeout(t);
            t = setTimeout(fn, wait);
        };
    }

    var ICON_PASS = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_FAIL = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m4.5 4.5 7 7m0-7-7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
    var ICON_HANDLE = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><g fill="currentColor"><circle cx="7" cy="5" r="1.5"/><circle cx="13" cy="5" r="1.5"/><circle cx="7" cy="10" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="7" cy="15" r="1.5"/><circle cx="13" cy="15" r="1.5"/></g></svg>';
    var ICON_LEFT = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M12 4.5 6.5 10l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_RIGHT = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M8 4.5 13.5 10 8 15.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_TRASH = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 6h12M8 6V4h4v2M6 6l.7 10h6.6L14 6M8.5 9v4.5M11.5 9v4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_RESET = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10a6 6 0 1 0 2-4.5M4 3.5V7h3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var ICON_EDIT = '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="m10 3 3 3-7.5 7.5H2.5v-3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>';

    /* ======================================================================
       State
       ====================================================================== */

    var uid = 0;
    var state = {
        colours: [],      // { id, hex, customName }
        level: 'aa',
        view: 'cards',    // 'cards' (default) or 'table'
        hideFailing: false
    };

    function createColour(hex, customName) {
        uid += 1;
        return { id: 'c' + uid, hex: hex, customName: customName || null };
    }

    function findColour(id) {
        for (var i = 0; i < state.colours.length; i++) {
            if (state.colours[i].id === id) return state.colours[i];
        }
        return null;
    }

    function indexOfColour(id) {
        for (var i = 0; i < state.colours.length; i++) {
            if (state.colours[i].id === id) return i;
        }
        return -1;
    }

    /* ======================================================================
       Colour names (loaded in the background)
       ====================================================================== */

    var nameList = null;  // [{ name, lab }]
    var nameCache = {};

    function loadNames() {
        if (!window.fetch) return;
        fetch(BASE + 'assets/data/colour-names.json')
            .then(function (res) { return res.ok ? res.json() : Promise.reject(res.status); })
            .then(function (data) {
                nameList = data.colors.map(function (entry) {
                    var hex = entry.slice(0, 6);
                    return { name: entry.slice(6), lab: toOklab(hex) };
                });
                updateAllNames();
                renderResults();
                updateExport();
            })
            .catch(function () { /* names are a nice-to-have: fall back to "Colour 1" etc. */ });
    }

    function autoName(hex) {
        if (!nameList) return null;
        if (nameCache[hex]) return nameCache[hex];
        var lab = toOklab(hex);
        var best = null, bestDist = Infinity;
        for (var i = 0; i < nameList.length; i++) {
            var c = nameList[i].lab;
            var dl = lab[0] - c[0], da = lab[1] - c[1], db = lab[2] - c[2];
            var dist = dl * dl + da * da + db * db;
            if (dist < bestDist) { bestDist = dist; best = nameList[i].name; }
        }
        nameCache[hex] = best;
        return best;
    }

    function colourName(colour) {
        return colour.customName || autoName(colour.hex) || 'Colour ' + (indexOfColour(colour.id) + 1);
    }

    /* ======================================================================
       URL (share link)
       ====================================================================== */

    function readUrl() {
        var params = new URLSearchParams(window.location.search);
        var hexes = (params.get('c') || '').split(/[-,\s]+/).map(normaliseHex).filter(Boolean);
        var names = params.has('n') ? params.get('n').split('|') : [];
        hexes.forEach(function (hex, i) {
            state.colours.push(createColour(hex, (names[i] || '').trim().slice(0, 40) || null));
        });
        if (params.get('level') === 'aaa') state.level = 'aaa';
        if (params.get('view') === 'table') state.view = 'table';
        if (params.get('hide') === '1') state.hideFailing = true;
    }

    function writeUrl() {
        var params = new URLSearchParams(window.location.search);
        params.set('c', state.colours.map(function (c) { return c.hex; }).join('-'));
        if (state.colours.some(function (c) { return c.customName; })) {
            params.set('n', state.colours.map(function (c) { return (c.customName || '').replace(/\|/g, ''); }).join('|'));
        } else {
            params.delete('n');
        }
        if (state.level === 'aaa') params.set('level', 'aaa'); else params.delete('level');
        if (state.view === 'table') params.set('view', 'table'); else params.delete('view');
        if (state.hideFailing) params.set('hide', '1'); else params.delete('hide');
        var url = window.location.pathname + '?' + params.toString() + window.location.hash;
        try { window.history.replaceState(null, '', url); } catch (e) { /* e.g. file:// */ }
    }

    var writeUrlSoon = debounce(writeUrl, 250);

    /* ======================================================================
       Announcements and toast
       ====================================================================== */

    var liveEl = q('[data-cpc-live]');
    var toastEl = q('[data-cpc-toast]');
    var toastTimer;

    function announce(message) {
        liveEl.textContent = '';
        window.setTimeout(function () { liveEl.textContent = message; }, 50);
    }

    function toast(message) {
        toastEl.textContent = message;
        toastEl.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2200);
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            root.appendChild(ta);
            ta.select();
            var ok = false;
            try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
            root.removeChild(ta);
            if (ok) resolve(); else reject(new Error('copy failed'));
        });
    }

    /* ======================================================================
       Palette (the editable tiles)
       ====================================================================== */

    var tilesEl = q('[data-cpc-tiles]');
    var stripEl = q('[data-cpc-strip]');

    function tileHtml(colour, index, total) {
        var name = colourName(colour);
        var hexUpper = colour.hex.toUpperCase();
        var ink = readableOn(colour.hex);
        var n = index + 1;
        return '' +
            '<li class="cpc-tile" data-id="' + colour.id + '">' +
                '<button type="button" class="cpc-tile__swatch" data-action="pick" style="background:#' + colour.hex + ';color:' + ink + '" aria-label="Open colour picker for ' + esc(name) + ', #' + hexUpper + '">' +
                    '<span class="cpc-tile__swatch-hex">#' + hexUpper + '</span>' +
                    '<span class="cpc-tile__swatch-edit" aria-hidden="true">' + ICON_EDIT + 'Edit</span>' +
                '</button>' +
                '<div class="cpc-tile__body">' +
                    '<div class="cpc-tile__name-row">' +
                        '<label class="cpc-sr" for="' + colour.id + '-name">Name of colour ' + n + '</label>' +
                        '<input type="text" class="cpc-tile__name" id="' + colour.id + '-name" data-field="name" maxlength="40" autocomplete="off" value="' + esc(name) + '">' +
                        '<button type="button" class="cpc-icon-btn cpc-tile__name-reset" data-action="reset-name" aria-label="Use the automatic name"' + (colour.customName ? '' : ' hidden') + ' title="Use the automatic name">' + ICON_RESET + '</button>' +
                    '</div>' +
                    '<label class="cpc-sr" for="' + colour.id + '-hex">HEX value of colour ' + n + '</label>' +
                    '<span class="cpc-hex-input"><span aria-hidden="true">#</span>' +
                        '<input type="text" id="' + colour.id + '-hex" data-field="hex" maxlength="7" autocomplete="off" spellcheck="false" autocapitalize="off" value="' + hexUpper + '" aria-describedby="' + colour.id + '-err">' +
                    '</span>' +
                    '<span class="cpc-tile__error" id="' + colour.id + '-err" aria-live="polite"></span>' +
                '</div>' +
                '<div class="cpc-tile__actions">' +
                    '<button type="button" class="cpc-icon-btn cpc-tile__handle" data-action="drag" aria-label="Reorder ' + esc(name) + ': drag, or use the arrow keys" title="Drag to reorder">' + ICON_HANDLE + '</button>' +
                    '<button type="button" class="cpc-icon-btn" data-action="move-prev" aria-label="Move ' + esc(name) + ' earlier"' + (index === 0 ? ' disabled' : '') + ' title="Move earlier">' + ICON_LEFT + '</button>' +
                    '<button type="button" class="cpc-icon-btn" data-action="move-next" aria-label="Move ' + esc(name) + ' later"' + (index === total - 1 ? ' disabled' : '') + ' title="Move later">' + ICON_RIGHT + '</button>' +
                    '<button type="button" class="cpc-icon-btn cpc-tile__remove" data-action="remove" aria-label="Remove ' + esc(name) + '"' + (total <= 1 ? ' disabled' : '') + ' title="Remove">' + ICON_TRASH + '</button>' +
                '</div>' +
            '</li>';
    }

    // Rebuilds all tiles. `focus` = { id, selector } restores focus afterwards;
    // `selector` can be a list, tried in order.
    function renderPalette(focus) {
        var total = state.colours.length;
        tilesEl.innerHTML = state.colours.map(function (c, i) { return tileHtml(c, i, total); }).join('');
        renderStrip();
        if (focus) {
            var tile = tileById(focus.id);
            if (!tile) return;
            var selectors = [].concat(focus.selector || [], 'button:not(:disabled)');
            for (var i = 0; i < selectors.length; i++) {
                var target = q(selectors[i], tile);
                if (target) { target.focus(); break; }
            }
        }
    }

    function renderStrip() {
        stripEl.innerHTML = state.colours.map(function (c) {
            return '<span style="background:#' + c.hex + '"></span>';
        }).join('');
    }

    function tileById(id) {
        return tilesEl.querySelector('[data-id="' + id + '"]');
    }

    // Updates one tile in place (no rebuild, so typing is never interrupted)
    function updateTile(colour) {
        var tile = tileById(colour.id);
        if (!tile) return;
        var name = colourName(colour);
        var hexUpper = colour.hex.toUpperCase();
        var swatch = q('.cpc-tile__swatch', tile);
        swatch.style.background = '#' + colour.hex;
        swatch.style.color = readableOn(colour.hex);
        swatch.setAttribute('aria-label', 'Open colour picker for ' + name + ', #' + hexUpper);
        q('.cpc-tile__swatch-hex', tile).textContent = '#' + hexUpper;

        var hexInput = q('[data-field="hex"]', tile);
        if (document.activeElement !== hexInput) {
            hexInput.value = hexUpper;
            hexInput.removeAttribute('aria-invalid');
            q('.cpc-tile__error', tile).textContent = '';
        }

        var nameInput = q('[data-field="name"]', tile);
        if (document.activeElement !== nameInput) nameInput.value = name;
        q('[data-action="reset-name"]', tile).hidden = !colour.customName;

        q('[data-action="drag"]', tile).setAttribute('aria-label', 'Reorder ' + name + ': drag, or use the arrow keys');
        q('[data-action="move-prev"]', tile).setAttribute('aria-label', 'Move ' + name + ' earlier');
        q('[data-action="move-next"]', tile).setAttribute('aria-label', 'Move ' + name + ' later');
        q('[data-action="remove"]', tile).setAttribute('aria-label', 'Remove ' + name);
    }

    function updateAllNames() {
        state.colours.forEach(updateTile);
    }

    // Central "a colour changed" handler
    function setColourHex(colour, hex) {
        if (colour.hex === hex) return;
        colour.hex = hex;
        updateTile(colour);
        renderStrip();
        scheduleResults();
        writeUrlSoon();
        if (picker.colourId === colour.id) updatePickerPreview();
    }

    function addColour() {
        var colour = createColour(randomHex());
        state.colours.push(colour);
        renderPalette({ id: colour.id, selector: '[data-field="hex"]' });
        renderResults();
        writeUrl();
        var tile = tileById(colour.id);
        if (tile && tile.scrollIntoView) tile.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        announce('Added ' + colourName(colour) + ', #' + colour.hex.toUpperCase() + '. ' + state.colours.length + ' colours in the palette.');
    }

    function removeColour(id) {
        if (state.colours.length <= 1) return;
        var index = indexOfColour(id);
        var colour = state.colours[index];
        var name = colourName(colour);
        if (picker.colourId === id) closePicker(false);
        state.colours.splice(index, 1);
        var next = state.colours[Math.min(index, state.colours.length - 1)];
        renderPalette({ id: next.id, selector: '[data-action="remove"]:not(:disabled)' });
        renderResults();
        writeUrl();
        announce('Removed ' + name + '. ' + state.colours.length + (state.colours.length === 1 ? ' colour' : ' colours') + ' left.');
    }

    function moveColour(id, delta, focusSelector) {
        var from = indexOfColour(id);
        var to = clamp(from + delta, 0, state.colours.length - 1);
        if (from === to) return;
        var colour = state.colours.splice(from, 1)[0];
        state.colours.splice(to, 0, colour);
        renderPalette({ id: id, selector: focusSelector });
        renderResults();
        writeUrl();
        announce(colourName(colour) + ' moved to position ' + (to + 1) + ' of ' + state.colours.length + '.');
    }

    // --- Tile events (delegated) ---

    tilesEl.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-action]');
        if (!btn || btn.disabled) return;
        var id = btn.closest('.cpc-tile').getAttribute('data-id');
        var action = btn.getAttribute('data-action');
        if (action === 'pick') openPicker(id, btn);
        else if (action === 'remove') removeColour(id);
        else if (action === 'move-prev') moveColour(id, -1, ['[data-action="move-prev"]:not(:disabled)', '[data-action="move-next"]']);
        else if (action === 'move-next') moveColour(id, 1, ['[data-action="move-next"]:not(:disabled)', '[data-action="move-prev"]']);
        else if (action === 'reset-name') {
            var colour = findColour(id);
            colour.customName = null;
            updateTile(colour);
            q('[data-field="name"]', tileById(id)).focus();
            afterNameChange();
            announce('Name reset to ' + colourName(colour) + '.');
        }
    });

    tilesEl.addEventListener('input', function (e) {
        var field = e.target.getAttribute('data-field');
        if (!field) return;
        var tile = e.target.closest('.cpc-tile');
        var colour = findColour(tile.getAttribute('data-id'));

        if (field === 'hex') {
            var hex = normaliseHex(e.target.value);
            var err = q('.cpc-tile__error', tile);
            if (hex) {
                e.target.removeAttribute('aria-invalid');
                err.textContent = '';
                setColourHex(colour, hex);
            } else {
                e.target.setAttribute('aria-invalid', 'true');
                err.textContent = e.target.value.replace('#', '').length >= 6 ? 'Use 3 or 6 characters: 0–9 and A–F.' : '';
            }
        } else if (field === 'name') {
            colour.customName = e.target.value.trim() || null;
            q('[data-action="reset-name"]', tile).hidden = !colour.customName;
            afterNameChange();
        }
    });

    tilesEl.addEventListener('focusout', function (e) {
        var field = e.target.getAttribute && e.target.getAttribute('data-field');
        if (!field) return;
        var tile = e.target.closest('.cpc-tile');
        if (!tile) return;
        var colour = findColour(tile.getAttribute('data-id'));
        if (!colour) return;
        // Tidy up on blur: invalid hex goes back to the last valid one, empty name goes back to auto
        window.setTimeout(function () { updateTile(colour); }, 0);
    });

    tilesEl.addEventListener('keydown', function (e) {
        var handle = e.target.closest('[data-action="drag"]');
        if (handle) {
            var id = handle.closest('.cpc-tile').getAttribute('data-id');
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); moveColour(id, -1, '[data-action="drag"]'); }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); moveColour(id, 1, '[data-action="drag"]'); }
            return;
        }
        if (e.key === 'Enter' && e.target.matches('input[data-field]')) e.target.blur();
    });

    function afterNameChange() {
        scheduleResults();
        writeUrlSoon();
        updateExport();
        if (picker.colourId) updatePickerPreview();
    }

    q('[data-cpc-add]').addEventListener('click', addColour);

    /* ======================================================================
       Drag and drop (Pointer Events: mouse, touch and pen, no library)
       ====================================================================== */

    var drag = null;

    tilesEl.addEventListener('pointerdown', function (e) {
        var handle = e.target.closest('[data-action="drag"]');
        if (!handle || e.button !== 0 || state.colours.length < 2) return;
        e.preventDefault();
        closePicker(false);

        var tile = handle.closest('.cpc-tile');
        var rect = tile.getBoundingClientRect();
        var ghost = tile.cloneNode(true);
        ghost.classList.add('cpc-tile--ghost');
        ghost.removeAttribute('data-id');
        ghost.setAttribute('aria-hidden', 'true');
        ghost.setAttribute('inert', '');
        qa('[id]', ghost).forEach(function (el) { el.removeAttribute('id'); });
        // cloneNode doesn't copy what the user typed, so copy the input values over
        var srcInputs = qa('input', tile), ghostInputs = qa('input', ghost);
        srcInputs.forEach(function (input, i) { ghostInputs[i].value = input.value; });
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        root.appendChild(ghost);
        tile.classList.add('is-placeholder');

        drag = {
            id: tile.getAttribute('data-id'),
            tile: tile,
            ghost: ghost,
            pointerId: e.pointerId,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            startOrder: state.colours.map(function (c) { return c.id; }).join()
        };
        // Listen on window: moving the tile in the DOM would otherwise lose the pointer
        window.addEventListener('pointermove', onDragMove);
        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
    });

    function onDragMove(e) {
        if (!drag || e.pointerId !== drag.pointerId) return;
        drag.ghost.style.left = (e.clientX - drag.offsetX) + 'px';
        drag.ghost.style.top = (e.clientY - drag.offsetY) + 'px';

        // Gentle auto-scroll near the top/bottom of the viewport
        var edge = 60;
        if (e.clientY < edge) window.scrollBy(0, -12);
        else if (e.clientY > window.innerHeight - edge) window.scrollBy(0, 12);

        var over = document.elementFromPoint(e.clientX, e.clientY);
        over = over && over.closest('.cpc-tile');
        if (!over || over === drag.tile || over.parentNode !== tilesEl) return;
        // Ignore tiles still sliding into place, otherwise they swap straight back
        if (over.cpcFlipUntil && over.cpcFlipUntil > Date.now()) return;

        var tiles = qa('.cpc-tile', tilesEl);
        var from = tiles.indexOf(drag.tile), to = tiles.indexOf(over);
        animateTiles(function () {
            tilesEl.insertBefore(drag.tile, from < to ? over.nextSibling : over);
        });
    }

    function endDrag(e) {
        if (!drag || e.pointerId !== drag.pointerId) return;
        var d = drag;
        drag = null;
        window.removeEventListener('pointermove', onDragMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
        d.ghost.remove();
        d.tile.classList.remove('is-placeholder');

        var order = qa('.cpc-tile', tilesEl).map(function (el) { return el.getAttribute('data-id'); });
        if (order.join() === d.startOrder) return;
        state.colours.sort(function (a, b) { return order.indexOf(a.id) - order.indexOf(b.id); });
        var colour = findColour(d.id);
        renderPalette({ id: d.id, selector: '[data-action="drag"]' });
        renderResults();
        writeUrl();
        announce(colourName(colour) + ' moved to position ' + (indexOfColour(d.id) + 1) + ' of ' + state.colours.length + '.');
    }

    // FLIP animation so the other tiles slide into place
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var FLIP_MS = 180;
    function animateTiles(mutate) {
        var tiles = qa('.cpc-tile', tilesEl);
        var before = tiles.map(function (t) { return t.getBoundingClientRect(); });
        mutate();
        if (reduceMotion.matches) return;
        tiles.forEach(function (t, i) {
            if (t === (drag && drag.tile)) return;
            var after = t.getBoundingClientRect();
            var dx = before[i].left - after.left, dy = before[i].top - after.top;
            if (!dx && !dy) return;
            t.style.transition = 'none';
            t.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            t.getBoundingClientRect(); // force a reflow so the transition starts from here
            t.style.transition = 'transform ' + FLIP_MS + 'ms ease';
            t.style.transform = '';
            t.cpcFlipUntil = Date.now() + FLIP_MS;
        });
    }

    /* ======================================================================
       Colour picker (HEX / RGB / HSL)
       ====================================================================== */

    var pickerEl = q('[data-cpc-picker]');
    var picker = {
        colourId: null,
        trigger: null,
        tab: storageGet('cpc-picker-tab') || 'hex',
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 }
    };
    if (['hex', 'rgb', 'hsl'].indexOf(picker.tab) === -1) picker.tab = 'hex';

    var pickerHex = q('[data-cpc-picker-hex]', pickerEl);
    var pickerNative = q('[data-cpc-picker-native]', pickerEl);
    var eyedropperBtn = q('[data-cpc-eyedropper]', pickerEl);
    if ('EyeDropper' in window) eyedropperBtn.hidden = false;

    function openPicker(id, trigger) {
        if (picker.colourId === id) { closePicker(true); return; }
        var colour = findColour(id);
        picker.colourId = id;
        picker.trigger = trigger;
        picker.rgb = hexToRgb(colour.hex);
        picker.hsl = rgbToHsl(picker.rgb);
        pickerEl.hidden = false;
        selectTab(picker.tab, false);
        syncPickerFields(true);
        updatePickerPreview();
        positionPicker();
        var firstField = q('[data-cpc-panel="' + picker.tab + '"] input', pickerEl);
        if (firstField) firstField.focus();
    }

    function closePicker(returnFocus) {
        if (!picker.colourId) return;
        var id = picker.colourId;
        picker.colourId = null;
        pickerEl.hidden = true;
        if (returnFocus) {
            var tile = tileById(id);
            var swatch = tile && q('[data-action="pick"]', tile);
            if (swatch) swatch.focus();
        }
        picker.trigger = null;
    }

    function positionPicker() {
        var trigger = picker.trigger && document.body.contains(picker.trigger) ? picker.trigger : null;
        if (!trigger) {
            var tile = tileById(picker.colourId);
            trigger = tile && q('[data-action="pick"]', tile);
        }
        var sheet = window.innerWidth < 640;
        pickerEl.classList.toggle('is-sheet', sheet);
        if (sheet || !trigger) return;
        var t = trigger.getBoundingClientRect();
        var r = root.getBoundingClientRect();
        var width = pickerEl.offsetWidth;
        var left = clamp(t.left - r.left, 8, r.width - width - 8);
        pickerEl.style.left = left + 'px';
        pickerEl.style.top = (t.bottom - r.top + 8) + 'px';
    }

    function updatePickerPreview() {
        var colour = findColour(picker.colourId);
        if (!colour) return;
        var preview = q('[data-cpc-picker-preview]', pickerEl);
        preview.style.background = '#' + colour.hex;
        preview.style.color = readableOn(colour.hex);
        q('[data-cpc-picker-title]', pickerEl).textContent = colourName(colour);
    }

    function selectTab(tab, focus) {
        picker.tab = tab;
        storageSet('cpc-picker-tab', tab);
        qa('[data-cpc-tab]', pickerEl).forEach(function (btn) {
            var active = btn.getAttribute('data-cpc-tab') === tab;
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
            btn.tabIndex = active ? 0 : -1;
            if (active && focus) btn.focus();
        });
        qa('[data-cpc-panel]', pickerEl).forEach(function (panel) {
            panel.hidden = panel.getAttribute('data-cpc-panel') !== tab;
        });
    }

    // Writes picker.rgb / picker.hsl into every control. The control being used is
    // left alone (so typing and dragging aren't interrupted) unless `force` is true.
    function syncPickerFields(force) {
        var hex = rgbToHex(picker.rgb);
        var active = force ? null : document.activeElement;
        if (active !== pickerHex) {
            pickerHex.value = hex.toUpperCase();
            pickerHex.removeAttribute('aria-invalid');
        }
        pickerNative.value = '#' + hex;

        var values = {
            r: picker.rgb.r, g: picker.rgb.g, b: picker.rgb.b,
            h: Math.round(picker.hsl.h), s: Math.round(picker.hsl.s), l: Math.round(picker.hsl.l)
        };
        qa('[data-cpc-ch]', pickerEl).forEach(function (input) {
            if (input === active) return;
            input.value = values[input.getAttribute('data-cpc-ch')];
        });

        // Slider track gradients show where each value would take the colour
        var rgb = picker.rgb, hsl = picker.hsl;
        setTrack('r', 'linear-gradient(to right, rgb(0,' + rgb.g + ',' + rgb.b + '), rgb(255,' + rgb.g + ',' + rgb.b + '))');
        setTrack('g', 'linear-gradient(to right, rgb(' + rgb.r + ',0,' + rgb.b + '), rgb(' + rgb.r + ',255,' + rgb.b + '))');
        setTrack('b', 'linear-gradient(to right, rgb(' + rgb.r + ',' + rgb.g + ',0), rgb(' + rgb.r + ',' + rgb.g + ',255))');
        var s = round1(hsl.s), l = round1(hsl.l);
        var hueStops = [0, 60, 120, 180, 240, 300, 360].map(function (h) { return 'hsl(' + h + ',' + s + '%,' + l + '%)'; });
        setTrack('h', 'linear-gradient(to right, ' + hueStops.join(',') + ')');
        setTrack('s', 'linear-gradient(to right, hsl(' + round1(hsl.h) + ',0%,' + l + '%), hsl(' + round1(hsl.h) + ',100%,' + l + '%))');
        setTrack('l', 'linear-gradient(to right, #000, hsl(' + round1(hsl.h) + ',' + s + '%,50%), #fff)');
    }

    function setTrack(channel, gradient) {
        var range = q('input[type="range"][data-cpc-ch="' + channel + '"]', pickerEl);
        range.style.setProperty('--track', gradient);
    }

    function applyPicker() {
        var colour = findColour(picker.colourId);
        if (!colour) return;
        syncPickerFields();
        setColourHex(colour, rgbToHex(picker.rgb));
    }

    pickerEl.addEventListener('input', function (e) {
        var t = e.target;
        var ch = t.getAttribute('data-cpc-ch');
        if (ch) {
            if (t.value === '') return;
            var v = parseFloat(t.value);
            if (isNaN(v)) return;
            if ('rgb'.indexOf(ch) !== -1) {
                picker.rgb[ch] = clamp(Math.round(v), 0, 255);
                picker.hsl = rgbToHsl(picker.rgb);
            } else {
                picker.hsl[ch] = clamp(v, 0, ch === 'h' ? 360 : 100);
                picker.rgb = hslToRgb(picker.hsl);
            }
            applyPicker();
        } else if (t === pickerHex) {
            var hex = normaliseHex(t.value);
            if (!hex) { t.setAttribute('aria-invalid', 'true'); return; }
            t.removeAttribute('aria-invalid');
            setPickerFromHex(hex);
        } else if (t === pickerNative) {
            setPickerFromHex(normaliseHex(t.value));
        }
    });

    function setPickerFromHex(hex) {
        if (!hex) return;
        picker.rgb = hexToRgb(hex);
        picker.hsl = rgbToHsl(picker.rgb);
        applyPicker();
    }

    pickerEl.addEventListener('change', function (e) {
        // Tidy number fields on commit (e.g. out-of-range values)
        if (e.target.type === 'number' || e.target === pickerHex) {
            syncPickerFields(true);
        }
    });

    pickerEl.addEventListener('click', function (e) {
        var tab = e.target.closest('[data-cpc-tab]');
        if (tab) { selectTab(tab.getAttribute('data-cpc-tab'), true); return; }
        if (e.target.closest('[data-cpc-picker-close], [data-cpc-picker-done]')) { closePicker(true); return; }
        if (e.target.closest('[data-cpc-eyedropper]')) {
            new window.EyeDropper().open().then(function (result) {
                setPickerFromHex(normaliseHex(result.sRGBHex));
            }).catch(function () { /* cancelled */ });
        }
    });

    pickerEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); closePicker(true); return; }
        var tab = e.target.closest('[data-cpc-tab]');
        if (tab && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
            var tabs = ['hex', 'rgb', 'hsl'];
            var i = tabs.indexOf(tab.getAttribute('data-cpc-tab'));
            selectTab(tabs[(i + (e.key === 'ArrowRight' ? 1 : 2)) % 3], true);
        }
    });

    // Close when clicking or tabbing outside the picker
    document.addEventListener('pointerdown', function (e) {
        if (!picker.colourId || pickerEl.contains(e.target)) return;
        if (e.target.closest && e.target.closest('[data-action="pick"]')) return;
        closePicker(false);
    });

    root.addEventListener('focusin', function (e) {
        if (!picker.colourId || pickerEl.contains(e.target)) return;
        if (e.target.closest('[data-action="pick"]')) return;
        closePicker(false);
    });

    window.addEventListener('resize', debounce(function () {
        if (picker.colourId) positionPicker();
    }, 100));

    /* ======================================================================
       Results
       ====================================================================== */

    var resultsEl = q('[data-cpc-results]');
    var summaryEl = q('[data-cpc-summary]');

    function evaluate(fgHex, bgHex) {
        var level = LEVELS[state.level];
        var ratio = contrastRatio(fgHex, bgHex);
        return {
            ratio: ratio,
            normal: ratio >= level.normal,
            large: ratio >= level.large,
            ui: ratio >= UI_MIN
        };
    }

    function badgesHtml(result) {
        var level = LEVELS[state.level];
        return '<ul class="cpc-badges">' +
            badge('Normal', 'Normal text', result.normal, level.normal) +
            badge('Large', 'Large text', result.large, level.large) +
            badge('UI', 'UI components and graphics', result.ui, UI_MIN) +
            '</ul>';
    }

    function badge(label, longLabel, pass, min) {
        var title = longLabel + ': ' + (pass ? 'pass' : 'fail') + ' (needs ' + min + ':1)';
        return '<li title="' + esc(title) + '">' +
            '<span class="cpc-badges__label">' + label + '<span class="cpc-sr"> ' + longLabel.replace(label, '').trim() + '</span></span>' +
            '<span class="cpc-result ' + (pass ? 'is-pass' : 'is-fail') + '">' + (pass ? ICON_PASS + 'Pass' : ICON_FAIL + 'Fail') + '</span>' +
            '</li>';
    }

    function sampleHtml(fgHex, bgHex) {
        return '<div class="cpc-sample" style="background:#' + bgHex + ';color:#' + fgHex + '" aria-hidden="true">' +
            '<span class="cpc-sample__large">Aa</span><span class="cpc-sample__small">Small text</span></div>';
    }

    function colourLabelHtml(colour) {
        return '<span class="cpc-colour-label">' +
            '<span class="cpc-chip" style="background:#' + colour.hex + '" aria-hidden="true"></span>' +
            '<span class="cpc-colour-label__text">' +
                '<span class="cpc-colour-label__name">' + esc(colourName(colour)) + '</span>' +
                '<span class="cpc-colour-label__hex">#' + colour.hex.toUpperCase() + '</span>' +
            '</span></span>';
    }

    function tableHtml(colours) {
        var head = '<tr><td class="cpc-table__corner"><span>Rows: text colour</span><span>Columns: background</span></td>' +
            colours.map(function (c) {
                return '<th scope="col" class="cpc-table__head"><span class="cpc-sr">Background: </span>' + colourLabelHtml(c) + '</th>';
            }).join('') + '</tr>';

        var body = colours.map(function (fg) {
            var cells = colours.map(function (bg) {
                if (fg.id === bg.id) {
                    return '<td class="cpc-cell cpc-cell--same"><div class="cpc-cell__same">Same colour</div></td>';
                }
                var result = evaluate(fg.hex, bg.hex);
                if (state.hideFailing && !result.large) {
                    return '<td class="cpc-cell cpc-cell--hidden"><div class="cpc-cell__same">Fails<span class="cpc-sr"> (' + formatRatio(result.ratio) + ':1)</span></div></td>';
                }
                return '<td class="cpc-cell">' + sampleHtml(fg.hex, bg.hex) +
                    '<div class="cpc-cell__meta"><span class="cpc-ratio">' + formatRatio(result.ratio) + '<small>:1</small></span>' +
                    badgesHtml(result) + '</div></td>';
            }).join('');
            return '<tr><th scope="row" class="cpc-table__rowhead"><span class="cpc-sr">Text: </span>' + colourLabelHtml(fg) + '</th>' + cells + '</tr>';
        }).join('');

        return '<div class="cpc-table-wrap" role="region" aria-label="Contrast table (scrolls sideways)" tabindex="0">' +
            '<table class="cpc-table" style="--cpc-cols:' + colours.length + '"><caption class="cpc-sr">Contrast of every colour pair. Rows are text colours and columns are background colours.</caption>' +
            '<thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>';
    }

    function cardsHtml(colours) {
        var h = 'h' + Math.min(HEADING, 6);
        return '<ul class="cpc-cards">' + colours.map(function (bg) {
            var ink = readableOn(bg.hex);
            var rows = colours.filter(function (fg) { return fg.id !== bg.id; }).map(function (fg) {
                var result = evaluate(fg.hex, bg.hex);
                if (state.hideFailing && !result.large) return '';
                return '<li class="cpc-pair">' + sampleHtml(fg.hex, bg.hex) +
                    '<div class="cpc-pair__info"><span class="cpc-sr">Text colour: </span>' +
                        '<span class="cpc-colour-label__name">' + esc(colourName(fg)) + '</span><br>' +
                        '<span class="cpc-colour-label__hex">#' + fg.hex.toUpperCase() + '</span></div>' +
                    '<span class="cpc-ratio">' + formatRatio(result.ratio) + '<small>:1</small></span>' +
                    badgesHtml(result) + '</li>';
            }).join('');
            if (!rows) rows = '<li class="cpc-card__empty">No colour in the palette passes on this background.</li>';
            return '<li class="cpc-card">' +
                '<div class="cpc-card__head" style="background:#' + bg.hex + ';color:' + ink + '">' +
                    '<' + h + ' class="cpc-card__title">' + esc(colourName(bg)) + '</' + h + '>' +
                    '<span class="cpc-card__meta"><code>#' + bg.hex.toUpperCase() + '</code><span>as background</span></span>' +
                '</div>' +
                '<ul class="cpc-card__list">' + rows + '</ul></li>';
        }).join('') + '</ul>';
    }

    function renderResults() {
        resultsPending = false;
        var colours = state.colours;
        if (colours.length < 2) {
            resultsEl.innerHTML = '<p class="cpc-empty">Add at least one more colour to see how your colours work together.</p>';
            setSummary('');
            return;
        }
        // Keep the table's horizontal scroll position across re-renders
        var wrap = q('.cpc-table-wrap', resultsEl);
        var scrollLeft = wrap ? wrap.scrollLeft : 0;

        resultsEl.innerHTML = state.view === 'table' ? tableHtml(colours) : cardsHtml(colours);

        wrap = q('.cpc-table-wrap', resultsEl);
        if (wrap) wrap.scrollLeft = scrollLeft;
        updateSummary();
    }

    var resultsPending = false;
    function scheduleResults() {
        if (resultsPending) return;
        resultsPending = true;
        requestAnimationFrame(renderResults);
    }

    // Summary counts each pair once (the ratio is the same both ways round)
    var setSummary = function (html) { summaryEl.innerHTML = html; };
    var updateSummary = debounce(function () {
        var colours = state.colours;
        if (colours.length < 2) { setSummary(''); return; }
        var pairs = 0, normal = 0, large = 0, ui = 0;
        for (var i = 0; i < colours.length; i++) {
            for (var j = i + 1; j < colours.length; j++) {
                var r = evaluate(colours[i].hex, colours[j].hex);
                pairs++;
                if (r.normal) normal++;
                if (r.large) large++;
                if (r.ui) ui++;
            }
        }
        var label = LEVELS[state.level].label;
        setSummary('<strong>' + pairs + '</strong> ' + (pairs === 1 ? 'pair' : 'unique pairs') + ' at WCAG 2.2 ' + label + ': ' +
            '<strong>' + normal + '</strong> pass for normal text, ' +
            '<strong>' + large + '</strong> for large text and ' +
            '<strong>' + ui + '</strong> for UI components.');
    }, 400);

    /* ======================================================================
       Settings
       ====================================================================== */

    function setRadio(name, value) {
        var input = q('input[name="' + name + '"][value="' + value + '"]');
        if (input) input.checked = true;
    }

    q('[data-cpc-level]').addEventListener('change', function (e) {
        state.level = e.target.value;
        renderResults();
        writeUrl();
    });

    q('[data-cpc-view]').addEventListener('change', function (e) {
        state.view = e.target.value;
        renderResults();
        writeUrl();
    });

    q('[data-cpc-hide]').addEventListener('change', function (e) {
        state.hideFailing = e.target.checked;
        renderResults();
        writeUrl();
    });

    // --- Theme ---
    function applyTheme(theme) {
        if (theme === 'light' || theme === 'dark') {
            root.setAttribute('data-theme', theme);
            storageSet('cpc-theme', theme);
        } else {
            root.removeAttribute('data-theme');
            storageSet('cpc-theme', null);
        }
        if (root.classList.contains('cpc--standalone')) {
            document.documentElement.style.colorScheme = theme === 'light' || theme === 'dark' ? theme : '';
            document.documentElement.style.background = getComputedStyle(root).backgroundColor;
        }
    }

    q('[data-cpc-theme]').addEventListener('change', function (e) {
        applyTheme(e.target.value);
    });

    var systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    function onSystemThemeChange() {
        if (!root.hasAttribute('data-theme')) applyTheme('system');
    }
    if (systemDark.addEventListener) systemDark.addEventListener('change', onSystemThemeChange);
    else if (systemDark.addListener) systemDark.addListener(onSystemThemeChange);

    /* ======================================================================
       Share and export
       ====================================================================== */

    q('[data-cpc-share]').addEventListener('click', function () {
        writeUrl();
        copyText(window.location.href).then(function () {
            toast('Share link copied to the clipboard');
        }, function () {
            window.prompt('Copy this link to share your palette:', window.location.href);
        });
    });

    var exportDialog = q('[data-cpc-export-dialog]');
    var exportCode = q('[data-cpc-export-code]');
    var exportFormat = 'hex';

    function cssVariableName(name, index) {
        var slug = String(name).toLowerCase();
        if (slug.normalize) slug = slug.normalize('NFD').replace(/[̀-ͯ]/g, '');
        slug = slug.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        if (!slug) slug = 'color-' + (index + 1);
        if (/^[0-9]/.test(slug)) slug = 'color-' + slug;
        return slug;
    }

    function buildCss() {
        var used = {};
        var lines = state.colours.map(function (colour, i) {
            var name = cssVariableName(colourName(colour), i);
            var unique = name, n = 2;
            while (used[unique]) { unique = name + '-' + n; n++; }
            used[unique] = true;
            return '  --' + unique + ': ' + formatColour(colour.hex, exportFormat) + ';';
        });
        return ':root {\n' + lines.join('\n') + '\n}\n';
    }

    function updateExport() {
        if (exportDialog.open) exportCode.value = buildCss();
    }

    q('[data-cpc-export]').addEventListener('click', function () {
        exportCode.value = buildCss();
        if (exportDialog.showModal) exportDialog.showModal();
        else exportDialog.setAttribute('open', '');
        q('[data-cpc-export-copy]').focus();
    });

    q('[data-cpc-export-format]').addEventListener('change', function (e) {
        exportFormat = e.target.value;
        exportCode.value = buildCss();
    });

    q('[data-cpc-export-close]').addEventListener('click', function () {
        if (exportDialog.close) exportDialog.close(); else exportDialog.removeAttribute('open');
    });

    // Click on the backdrop closes the dialog
    exportDialog.addEventListener('click', function (e) {
        if (e.target === exportDialog && exportDialog.close) exportDialog.close();
    });

    q('[data-cpc-export-copy]').addEventListener('click', function () {
        copyText(exportCode.value).then(function () {
            toast('CSS copied to the clipboard');
        }, function () {
            exportCode.focus();
            exportCode.select();
            toast('Press Ctrl+C (or Cmd+C) to copy');
        });
    });

    /* ======================================================================
       Start
       ====================================================================== */

    readUrl();
    if (!state.colours.length) state.colours.push(createColour(randomHex()));

    setRadio('cpc-level', state.level);
    setRadio('cpc-view', state.view);
    q('[data-cpc-hide]').checked = state.hideFailing;
    setRadio('cpc-theme', root.getAttribute('data-theme') || 'system');
    applyTheme(root.getAttribute('data-theme') || 'system');

    renderPalette();
    renderResults();
    writeUrl();
    loadNames();

    // Offline support / installable web app (standalone page only)
    if (root.hasAttribute('data-cpc-sw') && 'serviceWorker' in navigator && window.isSecureContext) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register(BASE + 'sw.js').catch(function () { /* not critical */ });
        });
    }
})();
