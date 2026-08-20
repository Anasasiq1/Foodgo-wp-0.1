<?php
/**
 * Merchant & Kitchen Order Management
 */

if (!defined('ABSPATH')) {
    exit;
}

class Foodgo_Merchant {
    public static function get_orders() {
        if (!class_exists('WooCommerce')) return array();

        $orders = wc_get_orders(array(
            'limit' => 20,
            'orderby' => 'date',
            'order' => 'DESC',
            'status' => array('wc-processing', 'wc-preparing', 'wc-ready-pickup', 'wc-pending'),
        ));

        $result = array();
        foreach ($orders as $order) {
            $items = array();
            foreach ($order->get_items() as $item) {
                $items[] = array(
                    'id' => $item->get_id(),
                    'name' => $item->get_name(),
                    'quantity' => $item->get_quantity(),
                    'notes' => $item->get_meta(__('Kitchen Note', 'foodgo-headless-connector')),
                );
            }

            $result[] = array(
                'id' => $order->get_id(),
                'orderNumber' => '#' . $order->get_order_number(),
                'customerName' => $order->get_formatted_billing_full_name() ?: 'Customer',
                'items' => $items,
                'total' => floatval($order->get_total()),
                'status' => ucfirst(str_replace('wc-', '', $order->get_status())),
                'date' => $order->get_date_created()->date('Y-m-d H:i:s'),
            );
        }

        return $result;
    }
}
