<?php
/**
 * Permissions & Capability Checks
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Permissions {
    public static function check_public() {
        return true;
    }

    public static function check_authenticated_customer() {
        return is_user_logged_in() || !empty(Foodgo_Auth::get_authenticated_user());
    }

    public static function check_merchant_permission() {
        $user = Foodgo_Auth::get_authenticated_user();
        if (!$user) {
            return current_user_can('manage_foodgo_kitchen') || current_user_can('manage_options');
        }
        return user_can($user, 'manage_foodgo_kitchen') || user_can($user, 'manage_options');
    }

    public static function check_delivery_permission() {
        $user = Foodgo_Auth::get_authenticated_user();
        if (!$user) {
            return current_user_can('manage_foodgo_deliveries') || current_user_can('manage_options');
        }
        return user_can($user, 'manage_foodgo_deliveries') || user_can($user, 'manage_options');
    }
}
