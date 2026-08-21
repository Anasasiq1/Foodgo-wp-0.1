<?php
/**
 * Foodgo - WordPress Connection & Integration Control Panel
 * 
 * IMPORTANT: admin.php is ONLY for connecting Foodgo to WordPress + WooCommerce.
 * It is NOT a commerce management panel. All products, orders, inventory, 
 * and customer management are handled inside WordPress / WooCommerce Admin.
 */

// 1. Safe Helper Functions (Self-contained, no external WordPress dependency required)
if (!function_exists('esc_html')) {
    function esc_html($text) {
        return htmlspecialchars((string)$text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_attr')) {
    function esc_attr($text) {
        return htmlspecialchars((string)$text, ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('esc_url')) {
    function esc_url($url) {
        return filter_var($url, FILTER_SANITIZE_URL);
    }
}

$baseDir = __DIR__;
$configDir = $baseDir . '/config';
$configFile = $configDir . '/connection.json';
$publicConfigFile = $configDir . '/connection-public.json';

// Locate the plugin zip file
$pluginZipFile = $baseDir . '/foodgo-headless-connector.zip';
if (!file_exists($pluginZipFile)) {
    $pluginZipFile = $baseDir . '/public/foodgo-headless-connector.zip';
}

// Ensure config dir exists and create security .htaccess
$configDirWritable = true;
if (!is_dir($configDir)) {
    if (!@mkdir($configDir, 0755, true)) {
        $configDirWritable = false;
    }
} else {
    $configDirWritable = is_writable($configDir);
}

if (is_dir($configDir) && !file_exists($configDir . '/.htaccess')) {
    $configHtaccess = "<FilesMatch \"^(?!connection-public\\.json$).*\\.json$\">\n    <IfModule mod_authz_core.c>\n        Require all denied\n    </IfModule>\n    <IfModule !mod_authz_core.c>\n        Deny from all\n    </IfModule>\n</FilesMatch>\n";
    @file_put_contents($configDir . '/.htaccess', $configHtaccess);
}

// 2. Handle Plugin Download Request
if (isset($_GET['download_plugin']) || isset($_GET['download']) || (isset($_GET['action']) && $_GET['action'] === 'download')) {
    if (file_exists($pluginZipFile)) {
        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="foodgo-headless-connector.zip"');
        header('Content-Length: ' . filesize($pluginZipFile));
        header('Pragma: no-cache');
        header('Cache-Control: no-store, no-cache, must-revalidate');
        readfile($pluginZipFile);
        exit;
    } else {
        header('HTTP/1.1 404 Not Found');
        die('Foodgo Headless Connector ZIP file not found. Please build or place foodgo-headless-connector.zip in the document root.');
    }
}

// 3. Load Existing Server-side Saved Config
$savedConfig = [
    'wpUrl' => getenv('VITE_WP_URL') ?: '',
    'wpUsername' => getenv('WP_USERNAME') ?: '',
    'wpAppPassword' => getenv('WP_APP_PASSWORD') ?: '',
    'lastTested' => null,
    'connected' => false,
];

if (file_exists($configFile)) {
    $fileData = json_decode(@file_get_contents($configFile), true);
    if (is_array($fileData)) {
        $savedConfig = array_merge($savedConfig, $fileData);
    }
}

// 4. Robust HTTP Testing Function with Full SSL & Error Reporting
function testUrl($url, $username = '', $appPassword = '') {
    if (empty($url)) {
        return ['success' => false, 'code' => 0, 'data' => null, 'error' => 'URL is empty'];
    }

    if (!function_exists('curl_init')) {
        return [
            'success' => false,
            'code' => 0,
            'data' => null,
            'error' => 'PHP cURL extension is missing. Please enable php-curl in your web hosting control panel.',
        ];
    }
    
    $headers = [
        'User-Agent: Foodgo-Connector/3.0',
        'Accept: application/json',
    ];

    if (!empty($username) && !empty($appPassword)) {
        $auth = base64_encode(trim($username) . ':' . trim(str_replace(' ', '', $appPassword)));
        $headers[] = 'Authorization: Basic ' . $auth;
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    // Strict SSL verification in production
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErrorNo = curl_errno($ch);
    $curlErrorMsg = curl_error($ch);
    curl_close($ch);

    if ($curlErrorNo !== 0) {
        $errorMsg = $curlErrorMsg;
        if (strpos(strtolower($curlErrorMsg), 'ssl') !== false || strpos(strtolower($curlErrorMsg), 'certificate') !== false) {
            $errorMsg = 'SSL Handshake Error: Invalid or untrusted HTTPS SSL certificate on WordPress host (' . $curlErrorMsg . ')';
        }
        return ['success' => false, 'code' => $httpCode, 'data' => null, 'error' => $errorMsg];
    }

    $json = json_decode($response, true);
    $isSuccess = ($httpCode >= 200 && $httpCode < 300);

    return [
        'success' => $isSuccess,
        'code' => $httpCode,
        'data' => $json,
        'raw' => $response,
        'error' => $isSuccess ? null : ('HTTP ' . $httpCode)
    ];
}

// 5. System Health Check (?health=1 or ?health=json)
if (isset($_GET['health'])) {
    $phpVersion = PHP_VERSION;
    $hasCurl = function_exists('curl_init');
    $hasJson = function_exists('json_encode');
    $hasOpenSsl = extension_loaded('openssl');
    $hasZip = file_exists($pluginZipFile);

    // Optional quick test against configured WP if present
    $wpReachable = false;
    $wcReachable = false;
    $pluginReachable = false;

    if (!empty($savedConfig['wpUrl']) && $hasCurl) {
        $quickWp = testUrl($savedConfig['wpUrl'] . '/wp-json/', $savedConfig['wpUsername'], $savedConfig['wpAppPassword']);
        $wpReachable = $quickWp['success'];
        if ($wpReachable) {
            $quickWc = testUrl($savedConfig['wpUrl'] . '/wp-json/wc/store/v1/products?per_page=1', $savedConfig['wpUsername'], $savedConfig['wpAppPassword']);
            $wcReachable = $quickWc['success'];
            $quickPlugin = testUrl($savedConfig['wpUrl'] . '/wp-json/foodgo/v1/config', $savedConfig['wpUsername'], $savedConfig['wpAppPassword']);
            $pluginReachable = $quickPlugin['success'];
        }
    }

    $healthData = [
        'status' => 'ok',
        'php_runtime' => true,
        'php_version' => $phpVersion,
        'php_supported' => version_compare($phpVersion, '7.4.0', '>='),
        'extensions' => [
            'curl' => $hasCurl,
            'json' => $hasJson,
            'openssl' => $hasOpenSsl,
        ],
        'filesystem' => [
            'config_dir_exists' => is_dir($configDir),
            'config_dir_writable' => $configDirWritable,
            'plugin_zip_present' => $hasZip,
        ],
        'wordpress_connection' => [
            'configured' => !empty($savedConfig['wpUrl']),
            'wp_url' => !empty($savedConfig['wpUrl']) ? $savedConfig['wpUrl'] : null,
            'rest_api_reachable' => $wpReachable,
            'woocommerce_store_api' => $wcReachable,
            'foodgo_connector_plugin' => $pluginReachable,
        ],
        'timestamp' => date('c'),
    ];

    if ($_GET['health'] === 'json' || (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false)) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($healthData, JSON_PRETTY_PRINT);
        exit;
    }
}

// 6. Handle Form Submission (Save & Connect or Test)
$notice = null;
$noticeType = 'info';
$testResults = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'connect';
    $wpUrl = rtrim(trim($_POST['wp_url'] ?? ''), '/');
    $wpUsername = trim($_POST['wp_username'] ?? '');
    $wpAppPassword = trim($_POST['wp_app_password'] ?? '');

    // Preserve password if submitting masked placeholder
    if (strpos($wpAppPassword, '•') !== false && !empty($savedConfig['wpAppPassword'])) {
        $wpAppPassword = $savedConfig['wpAppPassword'];
    }

    // Check cURL extension before running tests
    if (!function_exists('curl_init')) {
        $notice = 'PHP cURL extension is missing on this server. Please enable php-curl in your web hosting control panel.';
        $noticeType = 'warning';
    } else {
        // Run Complete Diagnostics
        $wpCoreTest = testUrl($wpUrl . '/wp-json/', $wpUsername, $wpAppPassword);
        $wcStoreTest = testUrl($wpUrl . '/wp-json/wc/store/v1/products?per_page=1', $wpUsername, $wpAppPassword);
        $foodgoPluginTest = testUrl($wpUrl . '/wp-json/foodgo/v1/config', $wpUsername, $wpAppPassword);
        $wcCartTest = testUrl($wpUrl . '/wp-json/wc/store/v1/cart', $wpUsername, $wpAppPassword);

        $testResults = [
            'wpCore' => [
                'name' => 'WordPress Core REST API',
                'endpoint' => '/wp-json/',
                'connected' => $wpCoreTest['success'],
                'code' => $wpCoreTest['code'],
                'details' => $wpCoreTest['success'] ? 'WordPress REST engine reachable' : ($wpCoreTest['error'] ?: 'HTTP ' . $wpCoreTest['code'])
            ],
            'wcStore' => [
                'name' => 'WooCommerce Store API',
                'endpoint' => '/wp-json/wc/store/v1/products',
                'connected' => $wcStoreTest['success'],
                'code' => $wcStoreTest['code'],
                'details' => $wcStoreTest['success'] ? 'Store API active & returning catalog' : ($wcStoreTest['error'] ?: 'Not reachable (HTTP ' . $wcStoreTest['code'] . ')')
            ],
            'foodgoPlugin' => [
                'name' => 'Foodgo Headless Connector',
                'endpoint' => '/wp-json/foodgo/v1/config',
                'connected' => $foodgoPluginTest['success'],
                'code' => $foodgoPluginTest['code'],
                'details' => $foodgoPluginTest['success'] ? 'Bridge plugin active & providing config' : ($foodgoPluginTest['error'] ?: 'Plugin endpoint not found (HTTP ' . $foodgoPluginTest['code'] . ')')
            ],
            'wooCommerce' => [
                'name' => 'WooCommerce Core Engine',
                'endpoint' => '/wp-json/wc/store/v1/cart',
                'connected' => $wcStoreTest['success'] || $wcCartTest['success'],
                'code' => $wcStoreTest['code'] ?: $wcCartTest['code'],
                'details' => ($wcStoreTest['success'] || $wcCartTest['success']) ? 'WooCommerce commerce platform active' : 'WooCommerce Store API not responding'
            ]
        ];

        if ($action === 'connect') {
            $isConn = $testResults['wpCore']['connected'] && $testResults['wcStore']['connected'];
            
            $newConfig = [
                'wpUrl' => $wpUrl,
                'wpUsername' => $wpUsername,
                'wpAppPassword' => $wpAppPassword,
                'lastTested' => date('Y-m-d H:i:s'),
                'connected' => $isConn,
            ];

            if ($configDirWritable) {
                @file_put_contents($configFile, json_encode($newConfig, JSON_PRETTY_PRINT));

                // Save public config WITHOUT sensitive credentials
                $publicConfig = [
                    'wpUrl' => $wpUrl,
                    'connected' => $isConn,
                    'foodgoPlugin' => $testResults['foodgoPlugin']['connected']
                ];
                @file_put_contents($publicConfigFile, json_encode($publicConfig, JSON_PRETTY_PRINT));
                $savedConfig = $newConfig;
            } else {
                $notice = 'Warning: config directory is not writable. Settings could not be persisted to disk.';
                $noticeType = 'warning';
            }

            if ($isConn) {
                $notice = 'Connection configuration saved successfully! WordPress and WooCommerce are connected.';
                $noticeType = 'success';
            } else {
                $notice = 'Connection saved, but some endpoints could not be reached. Review the diagnostics below.';
                $noticeType = 'warning';
            }
        } else {
            $notice = 'Connection test completed. See diagnostic status below.';
            $noticeType = 'info';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foodgo — WordPress Connection Control Panel</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Cabinet+Grotesk:wght@700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #EF2A39;
            --primary-hover: #d81e2d;
            --dark: #1F191D;
            --surface: #FFFFFF;
            --surface-subtle: #F8F9FA;
            --border: #E5E7EB;
            --text-main: #1F191D;
            --text-muted: #6B7280;
            --success: #10B981;
            --danger: #EF4444;
            --warning: #F59E0B;
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        body {
            background-color: #0F0C0E;
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 16px;
        }

        .container {
            width: 100%;
            max-width: 680px;
        }

        .header {
            text-align: center;
            margin-bottom: 28px;
        }

        .brand-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(239, 42, 57, 0.12);
            color: #FF5A67;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 6px 14px;
            border-radius: 999px;
            margin-bottom: 12px;
            border: 1px solid rgba(239, 42, 57, 0.25);
        }

        .title {
            font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
            font-size: 32px;
            font-weight: 900;
            color: #FFFFFF;
            letter-spacing: -0.02em;
            margin-bottom: 8px;
        }

        .subtitle {
            font-size: 14px;
            color: #9CA3AF;
            line-height: 1.5;
            max-width: 520px;
            margin: 0 auto;
        }

        .card {
            background: var(--surface);
            border-radius: 20px;
            padding: 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
            margin-bottom: 24px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }

        .card-title {
            font-size: 18px;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .notice {
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .notice-success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
        .notice-warning { background: #FFFBEB; color: #92400E; border: 1px solid #FDE68A; }
        .notice-info { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .help-text {
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 5px;
            line-height: 1.4;
        }

        input[type="text"],
        input[type="url"],
        input[type="password"] {
            width: 100%;
            height: 48px;
            padding: 0 16px;
            border-radius: 12px;
            border: 1.5px solid var(--border);
            background: var(--surface-subtle);
            font-size: 14px;
            font-weight: 600;
            color: var(--text-main);
            transition: all 0.2s ease;
            outline: none;
        }

        input:focus {
            border-color: var(--primary);
            background: #FFFFFF;
            box-shadow: 0 0 0 4px rgba(239, 42, 57, 0.1);
        }

        .button-group {
            display: flex;
            gap: 12px;
            margin-top: 28px;
        }

        .btn {
            height: 50px;
            padding: 0 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
        }

        .btn-primary {
            background: var(--primary);
            color: #FFFFFF;
            flex: 2;
            box-shadow: 0 8px 16px rgba(239, 42, 57, 0.3);
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: var(--surface-subtle);
            color: var(--text-main);
            border: 1.5px solid var(--border);
            flex: 1;
        }

        .btn-secondary:hover {
            background: #EDF0F2;
        }

        .btn-download {
            background: #1F191D;
            color: #FFFFFF;
            width: 100%;
        }

        .btn-download:hover {
            background: #000000;
        }

        .status-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-top: 16px;
        }

        @media (max-width: 540px) {
            .status-grid {
                grid-template-columns: 1fr;
            }
            .button-group {
                flex-direction: column;
            }
        }

        .status-item {
            background: var(--surface-subtle);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .status-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .status-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }

        .status-pill {
            font-size: 11px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .status-pill.connected {
            background: #DEF7EC;
            color: #03543F;
        }

        .status-pill.failed {
            background: #FDE8E8;
            color: #9B1C1C;
        }

        .status-pill.pending {
            background: #E5E7EB;
            color: #4B5563;
        }

        .status-desc {
            font-size: 11px;
            color: var(--text-muted);
            line-height: 1.3;
        }

        .health-bar {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            padding: 14px 18px;
            margin-bottom: 20px;
            color: #D1D5DB;
            font-size: 12px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .health-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .health-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
        }

        .health-dot.ok { background: #10B981; box-shadow: 0 0 6px rgba(16, 185, 129, 0.6); }
        .health-dot.err { background: #EF4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.6); }

        .plugin-box {
            background: #FAF5FF;
            border: 1px solid #E9D5FF;
            border-radius: 16px;
            padding: 20px;
            margin-top: 24px;
        }

        .plugin-box-title {
            font-size: 15px;
            font-weight: 800;
            color: #581C87;
            margin-bottom: 6px;
        }

        .plugin-box-desc {
            font-size: 13px;
            color: #6B21A8;
            line-height: 1.4;
            margin-bottom: 16px;
        }

        .footer-note {
            text-align: center;
            font-size: 12px;
            color: #6B7280;
            margin-top: 16px;
        }

        .footer-link {
            color: #EF2A39;
            text-decoration: none;
            font-weight: 700;
        }
    </style>
</head>
<body>

<div class="container">
    <header class="header">
        <div class="brand-badge">⚡ Foodgo Headless Bridge</div>
        <h1 class="title">WordPress Connection</h1>
        <p class="subtitle">Connect your Foodgo customer storefront directly to your WordPress + WooCommerce backend.</p>
    </header>

    <!-- System Runtime Health Bar -->
    <div class="health-bar">
        <div class="health-item">
            <span class="health-dot ok"></span>
            <span>PHP <?php echo esc_html(PHP_VERSION); ?></span>
        </div>
        <div class="health-item">
            <span class="health-dot <?php echo function_exists('curl_init') ? 'ok' : 'err'; ?>"></span>
            <span>cURL: <?php echo function_exists('curl_init') ? 'Active' : 'Missing'; ?></span>
        </div>
        <div class="health-item">
            <span class="health-dot <?php echo extension_loaded('openssl') ? 'ok' : 'err'; ?>"></span>
            <span>OpenSSL: <?php echo extension_loaded('openssl') ? 'Active' : 'Missing'; ?></span>
        </div>
        <div class="health-item">
            <span class="health-dot <?php echo $configDirWritable ? 'ok' : 'err'; ?>"></span>
            <span>Storage: <?php echo $configDirWritable ? 'Writable' : 'Read-Only'; ?></span>
        </div>
        <a href="admin.php?health=json" target="_blank" style="color: #9CA3AF; text-decoration: underline; margin-left: auto;">Health JSON API &rarr;</a>
    </div>

    <?php if ($notice): ?>
        <div class="notice notice-<?php echo esc_attr($noticeType); ?>">
            <span><?php echo $noticeType === 'success' ? '✔' : ($noticeType === 'warning' ? '⚠' : 'ℹ'); ?></span>
            <span><?php echo esc_html($notice); ?></span>
        </div>
    <?php endif; ?>

    <main class="card">
        <div class="card-header">
            <h2 class="card-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Connection Settings
            </h2>
            <?php if (!empty($savedConfig['lastTested'])): ?>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Last tested: <?php echo esc_html($savedConfig['lastTested']); ?></span>
            <?php endif; ?>
        </div>

        <form method="POST" action="admin.php">
            <div class="form-group">
                <label for="wp_url">WordPress Website URL</label>
                <input type="url" id="wp_url" name="wp_url" required placeholder="https://wordpress.yourdomain.com" value="<?php echo esc_attr($savedConfig['wpUrl']); ?>">
                <p class="help-text">The base URL where your WordPress & WooCommerce installation is hosted.</p>
            </div>

            <div class="form-group">
                <label for="wp_username">WordPress Username</label>
                <input type="text" id="wp_username" name="wp_username" placeholder="admin" value="<?php echo esc_attr($savedConfig['wpUsername']); ?>">
                <p class="help-text">Your WordPress administrator or API user account username.</p>
            </div>

            <div class="form-group">
                <label for="wp_app_password">WordPress Application Password</label>
                <input type="password" id="wp_app_password" name="wp_app_password" placeholder="<?php echo !empty($savedConfig['wpAppPassword']) ? '••••••••••••••••••••••••' : 'abcd efgh ijkl mnop qrst uvwx'; ?>" autocomplete="new-password">
                <p class="help-text">
                    🔒 <strong>Security Note:</strong> For security, use an <em>Application Password</em> (WordPress Admin → Users → Profile → Application Passwords) instead of your primary login password.
                </p>
            </div>

            <div class="button-group">
                <button type="submit" name="action" value="connect" class="btn btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    CONNECT WORDPRESS
                </button>
                <button type="submit" name="action" value="test" class="btn btn-secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Test Connection
                </button>
            </div>
        </form>

        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border);">
            <label style="margin-bottom: 12px;">Connection Diagnostics</label>
            <div class="status-grid">
                <?php
                $statuses = [
                    'wpCore' => ['name' => 'WordPress Core REST API', 'res' => $testResults['wpCore'] ?? null],
                    'wooCommerce' => ['name' => 'WooCommerce Core Engine', 'res' => $testResults['wooCommerce'] ?? null],
                    'wcStore' => ['name' => 'WooCommerce Store API', 'res' => $testResults['wcStore'] ?? null],
                    'foodgoPlugin' => ['name' => 'Foodgo Connector Plugin', 'res' => $testResults['foodgoPlugin'] ?? null],
                ];

                foreach ($statuses as $key => $item):
                    $res = $item['res'];
                    $isConn = $res ? $res['connected'] : false;
                    $statusClass = $res ? ($isConn ? 'connected' : 'failed') : 'pending';
                    $statusLabel = $res ? ($isConn ? 'Connected' : 'Failed') : 'Untested';
                    $desc = $res ? $res['details'] : 'Click "Test Connection" to verify';
                ?>
                <div class="status-item">
                    <div class="status-header">
                        <span class="status-name"><?php echo esc_html($item['name']); ?></span>
                        <span class="status-pill <?php echo esc_attr($statusClass); ?>">
                            ● <?php echo esc_html($statusLabel); ?>
                        </span>
                    </div>
                    <span class="status-desc"><?php echo esc_html($desc); ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <div class="plugin-box">
            <h3 class="plugin-box-title">📦 Foodgo Headless Connector WordPress Plugin</h3>
            <p class="plugin-box-desc">
                Install this official plugin on your WordPress site to enable automatic frontend discovery, line item spice level/curry customization, and kitchen logistics.
            </p>
            <a href="admin.php?download_plugin=1" download="foodgo-headless-connector.zip" class="btn btn-download" id="downloadPluginBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                DOWNLOAD PLUGIN (.ZIP)
            </a>
            <div style="display: flex; justify-content: center; gap: 16px; margin-top: 10px; font-size: 12px;">
                <a href="admin.php?download_plugin=1" download="foodgo-headless-connector.zip" style="color: #6B21A8; font-weight: 700; text-decoration: underline;">Direct Link (admin.php)</a>
                <span style="color: #D8B4FE;">•</span>
                <a href="/foodgo-headless-connector.zip" download="foodgo-headless-connector.zip" style="color: #6B21A8; font-weight: 700; text-decoration: underline;">Static File Link</a>
            </div>
        </div>
    </main>

    <footer class="footer-note">
        <p>Looking for customer storefront? <a href="/" class="footer-link">Open Foodgo Customer App &rarr;</a></p>
        <p style="margin-top: 6px; color: #4B5563;">All products, inventory, orders, and payment settings are managed natively inside WordPress / WooCommerce.</p>
    </footer>
</div>

</body>
</html>
