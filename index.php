<?php
/**
 * Foodgo Gourmet Ordering Platform - Application Gateway (PHP)
 * 
 * Provides transparent serving for static SPA deployment on shared hosting
 * (aaPanel, cPanel, Apache, LiteSpeed, Nginx).
 */

define('FOODGO_ACCESS', true);

$baseDir = __DIR__;

// Locate the production frontend entry point:
// Candidate 1: dist/index.html (when build output is kept in dist/)
// Candidate 2: index.html (when dist contents are uploaded directly to website root)
$frontendCandidates = [
    $baseDir . '/dist/index.html',
    $baseDir . '/index.html'
];

foreach ($frontendCandidates as $candidate) {
    if (file_exists($candidate)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($candidate);
        exit;
    }
}

// Fallback message if frontend is not yet built
echo '<!DOCTYPE html><html><head><title>Foodgo</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="font-family:sans-serif;padding:40px;text-align:center;background:#F8F9FA;color:#322A2E;"><div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.06);"><h2>Foodgo Gourmet Platform</h2><p style="color:#666;font-size:14px;">Frontend index.html was not found in document root. Please upload the contents of <code>dist/</code> to your <code>public_html/</code> directory.</p><p style="margin-top:15px;"><a href="admin.php" style="color:#6B21A8;font-weight:bold;text-decoration:none;">Go to WordPress Connection Panel (admin.php) &rarr;</a></p></div></body></html>';

