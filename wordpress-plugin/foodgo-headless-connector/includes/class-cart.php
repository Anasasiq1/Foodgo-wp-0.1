<?php
/**
 * WooCommerce Store API Cart Extensions & Line Item Customization
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Cart {
    public function __construct() {
        add_filter('woocommerce_store_api_add_to_cart_data', array($this, 'capture_cart_customization'), 10, 2);
        add_action('woocommerce_checkout_create_order_line_item', array($this, 'save_line_item_meta'), 10, 4);
    }

    public function capture_cart_customization($cart_item_data, $request) {
        $extensions = $request->get_param('extensions');
        if (!empty($extensions['foodgo'])) {
            $cart_item_data['foodgo_customization'] = $extensions['foodgo'];
        }
        return $cart_item_data;
    }

    public function save_line_item_meta($item, $cart_item_key, $values, $order) {
        if (isset($values['foodgo_customization'])) {
            $c = $values['foodgo_customization'];

            if (isset($c['spiceLevel'])) {
                $item->add_meta_data(__('Spiciness Level', 'foodgo-headless-connector'), $c['spiceLevel'] . '%', true);
                $item->add_meta_data('_foodgo_spice_level', $c['spiceLevel'], true);
            }

            if (isset($c['portion'])) {
                $item->add_meta_data('_foodgo_portion', $c['portion'], true);
            }

            if (!empty($c['curry']) && !empty($c['curry']['curryName'])) {
                $curry = $c['curry'];
                $label = sprintf('%s (%d %s)', $curry['curryName'], $curry['totalUnits'] ?? 1, $curry['unitLabel'] ?? 'portion');
                $item->add_meta_data(__('Selected Curry / Salna', 'foodgo-headless-connector'), $label, true);
                $item->add_meta_data('_foodgo_curry', $curry, true);
            }

            if (!empty($c['toppings']) && is_array($c['toppings'])) {
                $toppings = wp_list_pluck($c['toppings'], 'name');
                $item->add_meta_data(__('Extra Toppings', 'foodgo-headless-connector'), implode(', ', $toppings), true);
            }

            if (!empty($c['sides']) && is_array($c['sides'])) {
                $sides = wp_list_pluck($c['sides'], 'name');
                $item->add_meta_data(__('Sides & Beverages', 'foodgo-headless-connector'), implode(', ', $sides), true);
            }

            if (!empty($c['specialInstructions'])) {
                $item->add_meta_data(__('Kitchen Note', 'foodgo-headless-connector'), sanitize_text_field($c['specialInstructions']), true);
            }
        }
    }
}

new Foodgo_Cart();
