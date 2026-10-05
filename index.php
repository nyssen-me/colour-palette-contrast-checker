<?php
/**
 * Colour Palette Contrast Checker – standalone page.
 */

// Bump this when you change the CSS/JS so browsers (and the service worker) fetch the new files.
// Keep it in sync with CACHE_VERSION in sw.js.
$cpc_version    = '1.0.8';
$cpc_base       = '';
$cpc_standalone = true;
?>
<!doctype html>
<html lang="en-GB">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Colour Palette Contrast Checker</title>
    <meta name="description" content="Check the WCAG 2.2 colour contrast of every combination in your colour palette at once, for normal text, large text and UI components.">
    <meta name="theme-color" content="#f6f5f2" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#121218" media="(prefers-color-scheme: dark)">

    <meta property="og:type" content="website">
    <meta property="og:title" content="Colour Palette Contrast Checker">
    <meta property="og:description" content="Check the WCAG 2.2 contrast of every combination in your colour palette at once.">

    <link rel="icon" href="assets/icons/icon-32.png" sizes="32x32" type="image/png">
    <link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
    <link rel="manifest" href="manifest.webmanifest">
    <link rel="stylesheet" href="assets/css/cpc.css?v=<?= $cpc_version ?>">
    <style>body { margin: 0; }</style>
</head>
<body>
<?php include __DIR__ . '/partials/checker.php'; ?>
<script src="assets/js/cpc.js?v=<?= $cpc_version ?>" defer></script>
</body>
</html>
