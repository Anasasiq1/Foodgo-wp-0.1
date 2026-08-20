<?php
/**
 * Checkout & Payment Gateway Detection
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Checkout {
    public static function get_available_gateways() {
        $gateways = array();
        if (class_exists('WooCommerce') && WC()->payment_gateways()) {
            foreach (WC()->payment_gateways()->get_available_payment_gateways() as $id => $gateway) {
                $gateways[] = array(
                    'id' => $id,
                    'title' => $gateway->get_title(),
                    'description' => $gateway->get_description(),
                    'order' => $gateway->get_method_title() ? 1 : 2,
                    'enabled' => true,
                    'icon' => $gateway->get_icon(),
                );
            }
        }

        if (empty($gateways)) {
            $gateways = array(
                array(
                    'id' => 'cod',
                    'title' => __('Cash on Delivery', 'foodgo-headless-connector'),
                    'description' => __('Pay cash upon delivery at your door.', 'foodgo-headless-connector'),
                    'order' => 1,
                    'enabled' => true,
                ),
            );
        }

        return $gateways;
    }
}
