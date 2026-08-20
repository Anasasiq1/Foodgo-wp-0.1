# Authentication & Customer Profiles

## 1. Authentication Architecture
- Customers authenticate against standard WordPress users via `/wp-json/foodgo/v1/auth/login` and `/wp-json/foodgo/v1/auth/register`.
- Authentication uses secure token signing without exposing WordPress admin credentials.

## 2. Customer Order History
- Customer orders are queried dynamically from WooCommerce via `/wp-json/foodgo/v1/customer/orders`.
- Only orders matching the authenticated customer's WordPress User ID are returned.
