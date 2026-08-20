<?php
/**
 * Delivery Logistics & Driver Assignment
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Delivery {
    public static function get_tasks() {
        if (!class_exists('WooCommerce')) return array();

        $orders = wc_get_orders(array(
            'limit' => 20,
            'orderby' => 'date',
            'order' => 'DESC',
            'status' => array('wc-processing', 'wc-preparing', 'wc-ready-pickup', 'wc-out-delivery'),
        ));

        $tasks = array();
        foreach ($orders as $order) {
            $tasks[] = array(
                'id' => $order->get_id(),
                'orderNumber' => '#' . $order->get_order_number(),
                'customerName' => $order->get_formatted_billing_full_name() ?: 'Customer',
                'customerPhone' => $order->get_billing_phone() ?: '',
                'deliveryAddress' => $order->get_formatted_shipping_address() ?: $order->get_formatted_billing_address(),
                'total' => floatval($order->get_total()),
                'paymentMethod' => $order->get_payment_method_title() ?: 'Cash on Delivery',
                'status' => $order->get_status() === 'out-delivery' ? 'Out for Delivery' : ($order->get_status() === 'ready-pickup' ? 'Picked Up' : 'Assigned'),
            );
        }

        return $tasks;
    }
}
