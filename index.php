<?php
/**
 * Colour Palette Contrast Checker – standalone page.
 */

// Bump this when you change the CSS/JS so browsers (and the service worker) fetch the new files.
// Keep it in sync with CACHE_VERSION in sw.js.
$cpc_version    = '1.0.11';
$cpc_base       = '';
$cpc_standalone = true;
?>
<!doctype html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Accessible Colour Palette Contrast Checker (WCAG 2.2)</title>
    <meta name="description" content="Build an accessible colour palette. Check the WCAG 2.2 contrast of every colour combination at once, for normal text, large text and UI components.">
    <link rel="canonical" href="https://accessiblepalette.uk/">
    <meta name="theme-color" content="#f6f5f2" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#121218" media="(prefers-color-scheme: dark)">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://accessiblepalette.uk/">
    <meta property="og:site_name" content="Accessible Palette">
    <meta property="og:locale" content="en_GB">
    <meta property="og:title" content="Accessible Colour Palette Contrast Checker">
    <meta property="og:description" content="Build an accessible colour palette. Check the WCAG 2.2 contrast of every colour combination at once.">
    <meta property="og:image" content="https://accessiblepalette.uk/assets/images/og-image.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Accessible Colour Palette Contrast Checker: four colour pairs with their WCAG contrast ratios and pass levels.">
    <meta name="twitter:card" content="summary_large_image">

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Accessible Colour Palette Contrast Checker",
        "alternateName": "Accessible Palette",
        "url": "https://accessiblepalette.uk/",
        "image": "https://accessiblepalette.uk/assets/images/og-image.png",
        "description": "A free tool for building accessible colour palettes. It checks the WCAG 2.2 contrast of every colour combination in a palette at once, for normal text, large text and UI components, at level AA or AAA.",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "inLanguage": "en-GB",
        "isAccessibleForFree": true,
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" }
    }
    </script>

    <link rel="icon" href="assets/icons/icon-32.png" sizes="32x32" type="image/png">
    <link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="stylesheet" href="assets/css/cpc.css?v=<?= $cpc_version ?>">
    <style>body { margin: 0; }</style>

    <!-- Google tag (gtag.js), loaded once the page has finished loading so it doesn't slow down first paint.
         Calls to gtag() before then are queued in dataLayer and sent when the script arrives. -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-M6CVJ5M42S');

        window.addEventListener('load', function () {
            function loadGtag() {
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://www.googletagmanager.com/gtag/js?id=G-M6CVJ5M42S';
                document.head.appendChild(s);
            }
            if ('requestIdleCallback' in window) requestIdleCallback(loadGtag, { timeout: 3000 });
            else setTimeout(loadGtag, 1000);
        });
    </script>
</head>
<body>
<?php include __DIR__ . '/partials/checker.php'; ?>
<script src="assets/js/cpc.js?v=<?= $cpc_version ?>" defer></script>
</body>
</html>
