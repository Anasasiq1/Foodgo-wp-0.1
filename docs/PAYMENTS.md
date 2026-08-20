# Payment Gateway Integration

## Dynamic Payment Discovery
Payment gateways are managed exclusively in WordPress Admin (**WooCommerce → Settings → Payments**).

Supported gateway adapters:
- **Cash on Delivery (COD)**: Native out-of-the-box support.
- **Razorpay**: Native UPI / Card / Netbanking adapter.
- **Stripe**: Credit/Debit card tokenization.
- **PayPal & Other Standard Gateways**: Dynamically detected from Store API available gateways list.

> 🔒 **Security:** No payment secrets or private API keys are ever exposed in client-side code.
