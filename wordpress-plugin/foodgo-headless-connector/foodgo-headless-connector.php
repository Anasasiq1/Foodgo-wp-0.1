<?php
/**
 * Plugin Name: Foodgo Headless Connector
 * Plugin URI: https://github.com/Anasasiq1/Foodgo-0.2
 * Description: High-performance decoupled bridge connecting WooCommerce to the Foodgo React storefront with dynamic feature auto-discovery, Store API cart extensions, kitchen logistics, and customer support.
 * Version: 3.0.0
 * Author: Foodgo Team
 * Author URI: https://foodgo.app
 * Text Domain: foodgo-headless-connector
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * WC requires at least: 7.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('FOODGO_VERSION', '3.0.0');
define('FOODGO_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('FOODGO_PLUGIN_URL', plugin_dir_url(__FILE__));

final class Foodgo_Headless_Connector {

    private static $instance = null;

    public static function get_instance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->includes();
        $this->init_hooks();
    }

    private function includes() {
        require_once FOODGO_PLUGIN_DIR . 'includes/class-security.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-cors.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-permissions.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-auth.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-products.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-cart.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-checkout.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-orders.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-merchant.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-delivery.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-config.php';
        require_once FOODGO_PLUGIN_DIR . 'includes/class-rest-api.php';
        require_once FOODGO_PLUGIN_DIR . 'admin/class-settings.php';
    }

    private function init_hooks() {
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        add_action('admin_notices', array($this, 'check_woocommerce_dependency'));
    }

    public function activate() {
        // Register Foodgo custom roles if not present
        if (!get_role('foodgo_merchant')) {
            add_role('foodgo_merchant', __('Foodgo Merchant / Kitchen', 'foodgo-headless-connector'), array(
                'read' => true,
                'manage_foodgo_kitchen' => true,
                'edit_shop_orders' => true,
            ));
        }

        if (!get_role('foodgo_delivery')) {
            add_role('foodgo_delivery', __('Foodgo Delivery Partner', 'foodgo-headless-connector'), array(
                'read' => true,
                'manage_foodgo_deliveries' => true,
            ));
        }

        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('manage_foodgo_settings');
            $admin_role->add_cap('manage_foodgo_kitchen');
            $admin_role->add_cap('manage_foodgo_deliveries');
        }

        flush_rewrite_rules();
    }

    public function deactivate() {
        flush_rewrite_rules();
    }

    public function check_woocommerce_dependency() {
        if (!class_exists('WooCommerce')) {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p><strong><?php _e('Foodgo Headless Connector requires WooCommerce to be installed and active.', 'foodgo-headless-connector'); ?></strong></p>
            </div>
            <?php
        }
    }
}

function foodgo_headless_connector() {
    return Foodgo_Headless_Connector::get_instance();
}

foodgo_headless_connector();
