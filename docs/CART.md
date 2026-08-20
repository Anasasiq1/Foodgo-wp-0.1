# Cart Architecture & WooCommerce Store API

Foodgo relies directly on the WooCommerce Store API (`/wp-json/wc/store/v1/cart`) for cart calculations, taxes, discounts, and item persistence.

---

## 1. Cart Operations
- `GET /wp-json/wc/store/v1/cart`: Retrieves customer session cart.
- `POST /wp-json/wc/store/v1/cart/add-item`: Adds an item with quantity and Foodgo extensions:
  ```json
  {
    "id": 12,
    "quantity": 1,
    "extensions": {
      "foodgo": {
        "spiceLevel": 75,
        "portion": 2,
        "curry": {
          "curryId": "curry-1",
          "curryName": "Chicken Curry",
          "totalUnits": 2,
          "unitLabel": "bowl"
        },
        "toppings": [{"id": "t-1", "name": "Extra Cheese", "price": 20}],
        "specialInstructions": "Extra crispy fries please"
      }
    }
  }
  ```
- `POST /wp-json/wc/store/v1/cart/update-item`: Modifies item quantity.
- `POST /wp-json/wc/store/v1/cart/remove-item`: Removes item by key.
- `POST /wp-json/wc/store/v1/cart/apply-coupon`: Applies coupon code.
