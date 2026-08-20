<?php
/**
 * REST API Routes Registration for Foodgo
 * Namespace: /foodgo/v1/
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Rest_API {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes() {
        $namespace = 'foodgo/v1';

        // 1. Dynamic Public Configuration
        register_rest_route($namespace, '/config', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_config'),
            'permission_callback' => '__return_true',
        ));

        // 2. Authentication
        register_rest_route($namespace, '/auth/login', array(
            'methods' => 'POST',
            'callback' => array($this, 'auth_login'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($namespace, '/auth/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'auth_register'),
            'permission_callback' => '__return_true',
        ));

        register_rest_route($namespace, '/auth/me', array(
            'methods' => 'GET',
            'callback' => array($this, 'auth_me'),
            'permission_callback' => array('Foodgo_Permissions', 'check_authenticated_customer'),
        ));

        register_rest_route($namespace, '/auth/logout', array(
            'methods' => 'POST',
            'callback' => array($this, 'auth_logout'),
            'permission_callback' => '__return_true',
        ));

        // 3. Customer Orders
        register_rest_route($namespace, '/customer/orders', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_customer_orders'),
            'permission_callback' => array('Foodgo_Permissions', 'check_authenticated_customer'),
        ));

        register_rest_route($namespace, '/orders/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_order_detail'),
            'permission_callback' => array('Foodgo_Permissions', 'check_authenticated_customer'),
        ));

        // 4. Kitchen / Merchant Orders
        register_rest_route($namespace, '/merchant/orders', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_merchant_orders'),
            'permission_callback' => array('Foodgo_Permissions', 'check_merchant_permission'),
        ));

        register_rest_route($namespace, '/merchant/orders/(?P<id>\d+)/status', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_merchant_order_status'),
            'permission_callback' => array('Foodgo_Permissions', 'check_merchant_permission'),
        ));

        // 5. Delivery Partner Tasks
        register_rest_route($namespace, '/delivery/tasks', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_delivery_tasks'),
            'permission_callback' => array('Foodgo_Permissions', 'check_delivery_permission'),
        ));

        register_rest_route($namespace, '/delivery/tasks/(?P<id>\d+)/status', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_delivery_status'),
            'permission_callback' => array('Foodgo_Permissions', 'check_delivery_permission'),
        ));
    }

    public function get_config() {
        return rest_ensure_response(Foodgo_Config::get_public_config());
    }

    public function auth_login($request) {
        $params = $request->get_json_params();
        $username = sanitize_user($params['username'] ?? '');
        $password = $params['password'] ?? '';

        $user = wp_authenticate($username, $password);
        if (is_wp_error($user)) {
            return new WP_Error('invalid_credentials', __('Invalid username or password.', 'foodgo-headless-connector'), array('status' => 401));
        }

        $token = Foodgo_Auth::generate_token($user->ID);

        return rest_ensure_response(array(
            'success' => true,
            'token' => $token,
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'displayName' => $user->display_name,
                'phone' => get_user_meta($user->ID, 'billing_phone', true) ?: '',
                'address' => get_user_meta($user->ID, 'billing_address_1', true) ?: '',
                'avatar' => get_avatar_url($user->ID),
                'role' => reset($user->roles) ?: 'customer',
            ),
        ));
    }

    public function auth_register($request) {
        $params = $request->get_json_params();
        $username = sanitize_user($params['username'] ?? '');
        $email = sanitize_email($params['email'] ?? '');
        $password = $params['password'] ?? '';

        if (empty($username) || empty($email) || empty($password)) {
            return new WP_Error('missing_fields', __('Username, email and password are required.', 'foodgo-headless-connector'), array('status' => 400));
        }

        if (username_exists($username) || email_exists($email)) {
            return new WP_Error('user_exists', __('User or email already registered.', 'foodgo-headless-connector'), array('status' => 409));
        }

        $user_id = wp_create_user($username, $password, $email);
        if (is_wp_error($user_id)) {
            return $user_id;
        }

        if (!empty($params['phone'])) {
            update_user_meta($user_id, 'billing_phone', sanitize_text_field($params['phone']));
        }
        if (!empty($params['address'])) {
            update_user_meta($user_id, 'billing_address_1', sanitize_text_field($params['address']));
        }

        $user = get_user_by('id', $user_id);
        $token = Foodgo_Auth::generate_token($user_id);

        return rest_ensure_response(array(
            'success' => true,
            'token' => $token,
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'displayName' => $user->display_name,
                'phone' => get_user_meta($user_id, 'billing_phone', true) ?: '',
                'address' => get_user_meta($user_id, 'billing_address_1', true) ?: '',
                'avatar' => get_avatar_url($user_id),
                'role' => 'customer',
            ),
        ));
    }

    public function auth_me() {
        $user = Foodgo_Auth::get_authenticated_user();
        if (!$user) {
            return new WP_Error('unauthorized', __('Unauthorized', 'foodgo-headless-connector'), array('status' => 401));
        }

        return rest_ensure_response(array(
            'success' => true,
            'user' => array(
                'id' => $user->ID,
                'username' => $user->user_login,
                'email' => $user->user_email,
                'displayName' => $user->display_name,
                'phone' => get_user_meta($user->ID, 'billing_phone', true) ?: '',
                'address' => get_user_meta($user->ID, 'billing_address_1', true) ?: '',
                'avatar' => get_avatar_url($user->ID),
                'role' => reset($user->roles) ?: 'customer',
            ),
        ));
    }

    public function auth_logout() {
        wp_logout();
        return rest_ensure_response(array('success' => true));
    }

    public function get_customer_orders() {
        $user = Foodgo_Auth::get_authenticated_user();
        if (!$user || !class_exists('WooCommerce')) {
            return rest_ensure_response(array());
        }

        $orders = wc_get_orders(array(
            'customer' => $user->ID,
            'limit' => 20,
            'orderby' => 'date',
            'order' => 'DESC',
        ));

        $data = array();
        foreach ($orders as $order) {
            $data[] = $order->get_data();
        }

        return rest_ensure_response($data);
    }

    public function get_order_detail($request) {
        $order_id = intval($request['id']);
        if (!class_exists('WooCommerce')) {
            return new WP_Error('not_found', 'WooCommerce not found', array('status' => 404));
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('order_not_found', 'Order not found', array('status' => 404));
        }

        return rest_ensure_response($order->get_data());
    }

    public function get_merchant_orders() {
        return rest_ensure_response(Foodgo_Merchant::get_orders());
    }

    public function update_merchant_order_status($request) {
        $order_id = intval($request['id']);
        $params = $request->get_json_params();
        $status = sanitize_text_field($params['status'] ?? '');

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        if ($status === 'Preparing') $order->update_status('wc-preparing');
        elseif ($status === 'Ready for Pickup') $order->update_status('wc-ready-pickup');
        elseif ($status === 'Completed') $order->update_status('wc-completed');

        return rest_ensure_response(array('success' => true));
    }

    public function get_delivery_tasks() {
        return rest_ensure_response(Foodgo_Delivery::get_tasks());
    }

    public function update_delivery_status($request) {
        $order_id = intval($request['id']);
        $params = $request->get_json_params();
        $status = sanitize_text_field($params['status'] ?? '');

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', array('status' => 404));
        }

        if ($status === 'Out for Delivery') $order->update_status('wc-out-delivery');
        elseif ($status === 'Delivered') $order->update_status('wc-completed');

        return rest_ensure_response(array('success' => true));
    }
}

new Foodgo_Rest_API();
