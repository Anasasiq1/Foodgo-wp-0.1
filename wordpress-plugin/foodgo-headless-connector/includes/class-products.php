<?php
/**
 * WooCommerce Product Fields & Store API Data Extensions
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Products {
    public function __construct() {
        add_action('woocommerce_product_options_general_product_data', array($this, 'add_admin_fields'));
        add_action('woocommerce_process_product_meta', array($this, 'save_admin_fields'));
        add_action('woocommerce_blocks_loaded', array($this, 'register_store_api_extension'));
    }

    public function add_admin_fields() {
        echo '<div class="options_group">';
        woocommerce_wp_text_input(array(
            'id' => '_foodgo_prep_time',
            'label' => __('Kitchen Prep Time', 'foodgo-headless-connector'),
            'placeholder' => '15 - 20 mins',
            'desc_tip' => 'true',
            'description' => __('Estimated preparation duration displayed on the Foodgo frontend.', 'foodgo-headless-connector'),
        ));

        woocommerce_wp_text_input(array(
            'id' => '_foodgo_default_spice',
            'label' => __('Default Spice Level (%)', 'foodgo-headless-connector'),
            'placeholder' => '50',
            'type' => 'number',
            'custom_attributes' => array('min' => '0', 'max' => '100', 'step' => '5'),
        ));
        echo '</div>';
    }

    public function save_admin_fields($post_id) {
        if (isset($_POST['_foodgo_prep_time'])) {
            update_post_meta($post_id, '_foodgo_prep_time', sanitize_text_field($_POST['_foodgo_prep_time']));
        }
        if (isset($_POST['_foodgo_default_spice'])) {
            update_post_meta($post_id, '_foodgo_default_spice', intval($_POST['_foodgo_default_spice']));
        }
    }

    public function register_store_api_extension() {
        if (function_exists('woocommerce_store_api_register_endpoint_data')) {
            woocommerce_store_api_register_endpoint_data(array(
                'endpoint' => 'product',
                'namespace' => 'foodgo',
                'data_callback' => array($this, 'get_store_api_product_data'),
                'schema_callback' => '__return_empty_array',
                'schema_type' => ARRAY_A,
            ));
        }
    }

    public function get_store_api_product_data($product) {
        $product_id = $product->get_id();
        return array(
            'prepTime' => get_post_meta($product_id, '_foodgo_prep_time', true) ?: '15 - 20 mins',
            'defaultSpice' => intval(get_post_meta($product_id, '_foodgo_default_spice', true) ?: 50),
            'defaultPortion' => 1,
            'curryConfig' => array('enabled' => true),
        );
    }
}

new Foodgo_Products();
