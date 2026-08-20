<?php
/**
 * WooCommerce Order Status Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Orders {
    public function __construct() {
        add_filter('wc_order_statuses', array($this, 'add_order_statuses'));
        add_action('init', array($this, 'register_post_statuses'));
    }

    public function add_order_statuses($order_statuses) {
        $new_statuses = array();
        foreach ($order_statuses as $key => $status) {
            $new_statuses[$key] = $status;
            if ('wc-processing' === $key) {
                $new_statuses['wc-preparing'] = _x('Food Preparing', 'Order status', 'foodgo-headless-connector');
                $new_statuses['wc-ready-pickup'] = _x('Ready for Pickup', 'Order status', 'foodgo-headless-connector');
                $new_statuses['wc-out-delivery'] = _x('Out for Delivery', 'Order status', 'foodgo-headless-connector');
            }
        }
        return $new_statuses;
    }

    public function register_post_statuses() {
        register_post_status('wc-preparing', array(
            'label' => _x('Food Preparing', 'Order status', 'foodgo-headless-connector'),
            'public' => true,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
        ));

        register_post_status('wc-ready-pickup', array(
            'label' => _x('Ready for Pickup', 'Order status', 'foodgo-headless-connector'),
            'public' => true,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
        ));

        register_post_status('wc-out-delivery', array(
            'label' => _x('Out for Delivery', 'Order status', 'foodgo-headless-connector'),
            'public' => true,
            'show_in_admin_all_list' => true,
            'show_in_admin_status_list' => true,
        ));
    }
}

new Foodgo_Orders();
