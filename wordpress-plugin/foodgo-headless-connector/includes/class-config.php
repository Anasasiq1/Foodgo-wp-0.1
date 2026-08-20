<?php
/**
 * Dynamic Public Configuration & Feature Auto-Discovery
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Config {
    public static function get_public_config() {
        $currency = function_exists('get_woocommerce_currency') ? get_woocommerce_currency() : 'INR';
        $currency_symbol = function_exists('get_woocommerce_currency_symbol') ? get_woocommerce_currency_symbol() : '₹';

        $available_gateways = Foodgo_Checkout::get_available_gateways();
        $has_coupons = function_exists('wc_coupons_enabled') ? wc_coupons_enabled() : true;
        $guest_checkout = function_exists('wc_get_checkout_url') ? (get_option('woocommerce_enable_guest_checkout') === 'yes') : true;

        return array(
            'site' => array(
                'name' => get_bloginfo('name') ?: 'Foodgo Gourmet Kitchen',
                'url' => home_url(),
            ),
            'api' => array(
                'wordpress' => rest_url('wp/v2'),
                'woocommerceStore' => rest_url('wc/store/v1'),
                'foodgo' => rest_url('foodgo/v1'),
            ),
            'currency' => $currency,
            'currencySymbol' => $currency_symbol,
            'features' => array(
                'products' => true,
                'cart' => true,
                'checkout' => true,
                'coupons' => $has_coupons,
                'guestCheckout' => $guest_checkout,
                'variations' => true,
                'merchant' => true,
                'delivery' => true,
                'customization' => true,
            ),
            'paymentGateways' => $available_gateways,
            'deliverySettings' => array(
                'slots' => array(
                    array('id' => 'slot-1', 'timeLabel' => '1:00 PM', 'fee' => 0, 'active' => true, 'order' => 1),
                    array('id' => 'slot-2', 'timeLabel' => '3:00 PM', 'fee' => 0, 'active' => true, 'order' => 2),
                    array('id' => 'slot-3', 'timeLabel' => '5:00 PM', 'fee' => 0, 'active' => true, 'order' => 3),
                ),
                'urgentDelivery' => array(
                    'enabled' => true,
                    'fee' => 30,
                    'label' => 'Urgent Delivery (15-25 mins)',
                ),
            ),
        );
    }
}
