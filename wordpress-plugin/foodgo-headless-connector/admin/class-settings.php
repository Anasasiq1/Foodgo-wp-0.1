<?php
/**
 * Minimal WordPress Settings Page (WordPress -> Settings -> Foodgo Connector)
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Admin_Settings {
    public function __construct() {
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
    }

    public function add_settings_page() {
        add_options_page(
            __('Foodgo Headless Connector', 'foodgo-headless-connector'),
            __('Foodgo Connector', 'foodgo-headless-connector'),
            'manage_options',
            'foodgo-connector',
            array($this, 'render_settings_page')
        );
    }

    public function register_settings() {
        register_setting('foodgo_connector_group', 'foodgo_frontend_url');
        register_setting('foodgo_connector_group', 'foodgo_allowed_origins');
    }

    public function render_settings_page() {
        $frontend_url = get_option('foodgo_frontend_url', '');
        $allowed_origins = get_option('foodgo_allowed_origins', '');
        ?>
        <div class="wrap" style="max-width: 800px;">
            <h1>🍕 Foodgo Headless Connector</h1>
            <p>Connect your WooCommerce store to the Foodgo React frontend automatically.</p>

            <div style="background:#fff; border:1px solid #ccd0d4; border-radius:6px; padding:16px; margin: 20px 0;">
                <h3 style="margin-top:0;">⚡ System Status</h3>
                <ul style="margin-bottom:0;">
                    <li><strong>WooCommerce:</strong> <?php echo class_exists('WooCommerce') ? '<span style="color:green;">✔ Active</span>' : '<span style="color:red;">✖ Missing</span>'; ?></li>
                    <li><strong>Store API:</strong> <code><?php echo esc_url(rest_url('wc/store/v1/')); ?></code></li>
                    <li><strong>Foodgo Auto-Config:</strong> <a href="<?php echo esc_url(rest_url('foodgo/v1/config')); ?>" target="_blank"><code><?php echo esc_url(rest_url('foodgo/v1/config')); ?></code></a></li>
                </ul>
            </div>

            <form method="post" action="options.php">
                <?php settings_fields('foodgo_connector_group'); ?>
                <?php do_settings_sections('foodgo_connector_group'); ?>

                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">Frontend Website URL</th>
                        <td>
                            <input type="url" name="foodgo_frontend_url" value="<?php echo esc_attr($frontend_url); ?>" class="regular-text" placeholder="https://foodgo.yourdomain.com" />
                            <p class="description">Where your React frontend is hosted.</p>
                        </td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Allowed Origins (CORS)</th>
                        <td>
                            <textarea name="foodgo_allowed_origins" rows="3" class="large-text" placeholder="http://localhost:3000&#10;https://foodgo.yourdomain.com"><?php echo esc_textarea($allowed_origins); ?></textarea>
                            <p class="description">One URL per line.</p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(__('Save Settings', 'foodgo-headless-connector')); ?>
            </form>
        </div>
        <?php
    }
}

new Foodgo_Admin_Settings();
