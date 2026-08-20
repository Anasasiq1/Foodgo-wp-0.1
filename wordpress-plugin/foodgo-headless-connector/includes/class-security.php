<?php
/**
 * Security & Input Sanitization
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Security {
    public static function sanitize_deep($data) {
        if (is_array($data)) {
            return array_map(array(__CLASS__, 'sanitize_deep'), $data);
        }
        return is_string($data) ? sanitize_text_field($data) : $data;
    }
}
