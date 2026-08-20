<?php
/**
 * Safe Dynamic CORS Headers
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_CORS {
    public function __construct() {
        add_action('init', array($this, 'handle_cors'), 1);
    }

    public function handle_cors() {
        $frontend_url = get_option('foodgo_frontend_url', '');
        $allowed_origins = array_filter(array_map('trim', explode("\n", get_option('foodgo_allowed_origins', ''))));

        if (!empty($frontend_url)) {
            $allowed_origins[] = rtrim($frontend_url, '/');
        }

        // Local environments
        $allowed_origins[] = 'http://localhost:3000';
        $allowed_origins[] = 'http://localhost:5173';
        $allowed_origins[] = 'http://127.0.0.1:3000';
        $allowed_origins[] = 'http://127.0.0.1:5173';

        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

        if (!empty($origin)) {
            $origin_clean = rtrim($origin, '/');
            if (in_array($origin_clean, $allowed_origins, true) || empty($frontend_url)) {
                header("Access-Control-Allow-Origin: {$origin}");
                header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
                header("Access-Control-Allow-Credentials: true");
                header("Access-Control-Allow-Headers: Authorization, Content-Type, Nonce, X-WC-Store-API-Nonce, X-Requested-With");
                header("Access-Control-Expose-Headers: Nonce, X-WC-Store-API-Nonce");
            }
        }

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
    }
}

new Foodgo_CORS();
