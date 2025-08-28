/**
 * PocketBase Migration Script for VieShare
 * 
 * Run this script to setup all necessary collections and data
 * Usage: node pocketbase-migrate.js
 */

// This is a PocketBase migration script
// Copy this content to your PocketBase admin panel > Settings > Import collections

const collections = [
  // 1. Categories Collection
  {
    "id": "categories",
    "name": "categories", 
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "unique": true,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "slug", 
        "name": "slug",
        "type": "text",
        "system": false,
        "required": true,
        "unique": true,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        }
      },
      {
        "id": "description",
        "name": "description", 
        "type": "text",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "id": "image",
        "name": "image",
        "type": "file",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/jpeg",
            "image/png", 
            "image/webp"
          ],
          "thumbs": [
            "100x100"
          ]
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`)"
    ],
    "listRule": "@request.auth != null",
    "viewRule": "@request.auth != null", 
    "createRule": "@request.auth.role ?= 'admin'",
    "updateRule": "@request.auth.role ?= 'admin'",
    "deleteRule": "@request.auth.role ?= 'admin'",
    "options": {}
  },

  // 2. Subcategories Collection  
  {
    "id": "subcategories",
    "name": "subcategories",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "slug",
        "name": "slug", 
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        }
      },
      {
        "id": "description",
        "name": "description",
        "type": "text", 
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 500,
          "pattern": ""
        }
      },
      {
        "id": "category",
        "name": "category",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "categories",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_subcategories_category` ON `subcategories` (`category`)"
    ],
    "listRule": "@request.auth != null",
    "viewRule": "@request.auth != null",
    "createRule": "@request.auth.role ?= 'admin'", 
    "updateRule": "@request.auth.role ?= 'admin'",
    "deleteRule": "@request.auth.role ?= 'admin'",
    "options": {}
  },

  // 3. Stores Collection
  {
    "id": "stores",
    "name": "stores",
    "type": "base", 
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 3,
          "max": 50,
          "pattern": ""
        }
      },
      {
        "id": "slug",
        "name": "slug",
        "type": "text",
        "system": false,
        "required": true,
        "unique": true,
        "options": {
          "min": 3,
          "max": 50,
          "pattern": "^[a-z0-9]+(?:-[a-z0-9]+)*$"
        }
      },
      {
        "id": "description",
        "name": "description",
        "type": "editor",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
        "id": "user",
        "name": "user",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_", 
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["username", "email"]
        }
      },
      {
        "id": "plan",
        "name": "plan",
        "type": "select",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "free",
            "standard", 
            "pro"
          ]
        }
      },
      {
        "id": "plan_ends_at",
        "name": "plan_ends_at",
        "type": "date",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": "",
          "max": ""
        }
      },
      {
        "id": "cancel_plan_at_end",
        "name": "cancel_plan_at_end", 
        "type": "bool",
        "system": false,
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "product_limit",
        "name": "product_limit",
        "type": "number",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": null
        }
      },
      {
        "id": "tag_limit",
        "name": "tag_limit",
        "type": "number",
        "system": false,
        "required": true, 
        "unique": false,
        "options": {
          "min": 1,
          "max": null
        }
      },
      {
        "id": "variant_limit",
        "name": "variant_limit",
        "type": "number",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": null
        }
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_stores_slug` ON `stores` (`slug`)",
      "CREATE INDEX `idx_stores_user` ON `stores` (`user`)"
    ],
    "listRule": "@request.auth != null",
    "viewRule": "@request.auth != null",
    "createRule": "@request.auth != null && @request.auth.id = @request.data.user",
    "updateRule": "@request.auth != null && @request.auth.id = user", 
    "deleteRule": "@request.auth != null && @request.auth.id = user",
    "options": {}
  },

  // 4. Products Collection
  {
    "id": "products",
    "name": "products",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 200,
          "pattern": ""
        }
      },
      {
        "id": "description",
        "name": "description",
        "type": "editor",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "convertUrls": false
        }
      },
      {
        "id": "images",
        "name": "images", 
        "type": "file",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "maxSelect": 5,
          "maxSize": 5242880,
          "mimeTypes": [
            "image/jpeg",
            "image/png",
            "image/webp"
          ],
          "thumbs": [
            "100x100",
            "300x300"
          ]
        }
      },
      {
        "id": "category",
        "name": "category",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "categories",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "subcategory",
        "name": "subcategory",
        "type": "relation",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "subcategories",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "price",
        "name": "price",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^\\d+(\\.\\d{1,2})?$"
        }
      },
      {
        "id": "inventory",
        "name": "inventory",
        "type": "number",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 0,
          "max": null
        }
      },
      {
        "id": "rating",
        "name": "rating",
        "type": "number",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": 5
        }
      },
      {
        "id": "store",
        "name": "store",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "stores",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "active",
        "name": "active",
        "type": "bool",
        "system": false,
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_products_store` ON `products` (`store`)",
      "CREATE INDEX `idx_products_category` ON `products` (`category`)",
      "CREATE INDEX `idx_products_active` ON `products` (`active`)",
      "CREATE INDEX `idx_products_name` ON `products` (`name`)"
    ],
    "listRule": "@request.auth != null && active = true",
    "viewRule": "@request.auth != null && active = true",
    "createRule": "@request.auth != null && @request.auth.id = store.user",
    "updateRule": "@request.auth != null && @request.auth.id = store.user",
    "deleteRule": "@request.auth != null && @request.auth.id = store.user", 
    "options": {}
  },

  // 5. Carts Collection
  {
    "id": "carts",
    "name": "carts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "user",
        "name": "user",
        "type": "relation",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["username", "email"]
        }
      },
      {
        "id": "session_id",
        "name": "session_id",
        "type": "text",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_carts_user` ON `carts` (`user`)",
      "CREATE INDEX `idx_carts_session_id` ON `carts` (`session_id`)"
    ],
    "listRule": "@request.auth.id = user || session_id = @request.headers.x_session_id",
    "viewRule": "@request.auth.id = user || session_id = @request.headers.x_session_id", 
    "createRule": "@request.auth != null || @request.data.session_id != ''",
    "updateRule": "@request.auth.id = user || session_id = @request.headers.x_session_id",
    "deleteRule": "@request.auth.id = user || session_id = @request.headers.x_session_id",
    "options": {}
  },

  // 6. Cart Items Collection
  {
    "id": "cart_items",
    "name": "cart_items",
    "type": "base", 
    "system": false,
    "schema": [
      {
        "id": "cart",
        "name": "cart",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "carts",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["id"]
        }
      },
      {
        "id": "product",
        "name": "product",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "products",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "quantity",
        "name": "quantity",
        "type": "number",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": null
        }
      },
      {
        "id": "subcategory",
        "name": "subcategory",
        "type": "relation",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "subcategories",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_cart_items_cart` ON `cart_items` (`cart`)",
      "CREATE INDEX `idx_cart_items_product` ON `cart_items` (`product`)"
    ],
    "listRule": "@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id",
    "viewRule": "@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id",
    "createRule": "@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id",
    "updateRule": "@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id",
    "deleteRule": "@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id",
    "options": {}
  },

  // 7. Addresses Collection
  {
    "id": "addresses", 
    "name": "addresses",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "line1",
        "name": "line1",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "id": "line2",
        "name": "line2",
        "type": "text",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "id": "city",
        "name": "city",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "state",
        "name": "state",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "postal_code",
        "name": "postal_code",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 20,
          "pattern": ""
        }
      },
      {
        "id": "country", 
        "name": "country",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 100,
          "pattern": ""
        }
      },
      {
        "id": "user",
        "name": "user",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["username", "email"]
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_addresses_user` ON `addresses` (`user`)"
    ],
    "listRule": "@request.auth.id = user",
    "viewRule": "@request.auth.id = user",
    "createRule": "@request.auth.id = @request.data.user",
    "updateRule": "@request.auth.id = user",
    "deleteRule": "@request.auth.id = user",
    "options": {}
  },

  // 8. Orders Collection
  {
    "id": "orders",
    "name": "orders",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "user",
        "name": "user",
        "type": "relation",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["username", "email"]
        }
      },
      {
        "id": "store",
        "name": "store",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "stores",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "items",
        "name": "items",
        "type": "json",
        "system": false,
        "required": true,
        "unique": false,
        "options": {}
      },
      {
        "id": "quantity",
        "name": "quantity",
        "type": "number",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "id": "amount",
        "name": "amount",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^\\d+(\\.\\d{1,2})?$"
        }
      },
      {
        "id": "status",
        "name": "status",
        "type": "select",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "pending",
            "processing", 
            "shipped",
            "delivered",
            "cancelled"
          ]
        }
      },
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "min": 1,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "id": "email",
        "name": "email",
        "type": "email",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "id": "address",
        "name": "address",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "addresses",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["line1", "city"]
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_orders_user` ON `orders` (`user`)",
      "CREATE INDEX `idx_orders_store` ON `orders` (`store`)",
      "CREATE INDEX `idx_orders_status` ON `orders` (`status`)",
      "CREATE INDEX `idx_orders_created` ON `orders` (`created`)"
    ],
    "listRule": "@request.auth.id = user || @request.auth.id = store.user",
    "viewRule": "@request.auth.id = user || @request.auth.id = store.user",
    "createRule": null,
    "updateRule": "@request.auth.id = store.user",
    "deleteRule": "@request.auth.id = store.user",
    "options": {}
  },

  // 9. Customers Collection
  {
    "id": "customers",
    "name": "customers", 
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "name",
        "name": "name",
        "type": "text",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "id": "email",
        "name": "email",
        "type": "email",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "id": "store",
        "name": "store",
        "type": "relation",
        "system": false,
        "required": true,
        "unique": false,
        "options": {
          "collectionId": "stores",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["name"]
        }
      },
      {
        "id": "total_orders",
        "name": "total_orders",
        "type": "number",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": 0,
          "max": null
        }
      },
      {
        "id": "total_spent",
        "name": "total_spent",
        "type": "text",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": "^\\d+(\\.\\d{1,2})?$"
        }
      }
    ],
    "indexes": [
      "CREATE INDEX `idx_customers_store` ON `customers` (`store`)",
      "CREATE INDEX `idx_customers_email` ON `customers` (`email`)"
    ],
    "listRule": "@request.auth.id = store.user",
    "viewRule": "@request.auth.id = store.user",
    "createRule": "@request.auth.id = store.user",
    "updateRule": "@request.auth.id = store.user",
    "deleteRule": "@request.auth.id = store.user",
    "options": {}
  },

  // 10. Notifications Collection
  {
    "id": "notifications",
    "name": "notifications",
    "type": "base",
    "system": false,
    "schema": [
      {
        "id": "email",
        "name": "email",
        "type": "email",
        "system": false,
        "required": true,
        "unique": true,
        "options": {
          "exceptDomains": null,
          "onlyDomains": null
        }
      },
      {
        "id": "token",
        "name": "token",
        "type": "text",
        "system": false,
        "required": true,
        "unique": true,
        "options": {
          "min": 1,
          "max": 255,
          "pattern": ""
        }
      },
      {
        "id": "user",
        "name": "user",
        "type": "relation",
        "system": false,
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "_pb_users_auth_",
          "cascadeDelete": true,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": ["username", "email"]
        }
      },
      {
        "id": "communication",
        "name": "communication",
        "type": "bool",
        "system": false,
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "newsletter",
        "name": "newsletter",
        "type": "bool",
        "system": false,
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "id": "marketing",
        "name": "marketing",
        "type": "bool",
        "system": false,
        "required": false,
        "unique": false,
        "options": {}
      }
    ],
    "indexes": [
      "CREATE UNIQUE INDEX `idx_notifications_email` ON `notifications` (`email`)",
      "CREATE UNIQUE INDEX `idx_notifications_token` ON `notifications` (`token`)",
      "CREATE INDEX `idx_notifications_user` ON `notifications` (`user`)"
    ],
    "listRule": "@request.auth.id = user",
    "viewRule": "@request.auth.id = user || @request.query.token = token",
    "createRule": "@request.data.email != ''",
    "updateRule": "@request.auth.id = user || @request.query.token = token",
    "deleteRule": "@request.auth.id = user",
    "options": {}
  }
];

// Initial data for categories and subcategories 
const initialData = {
  categories: [
    {
      "id": "cat_vieboards",
      "name": "Vieboards",
      "slug": "vieboards", 
      "description": "The best vieboards for all levels of viers."
    },
    {
      "id": "cat_clothing",
      "name": "Clothing",
      "slug": "clothing",
      "description": "Stylish and comfortable vieboarding clothing."
    },
    {
      "id": "cat_shoes", 
      "name": "Shoes",
      "slug": "shoes",
      "description": "Rad shoes for long vie sessions."
    },
    {
      "id": "cat_accessories",
      "name": "Accessories", 
      "slug": "accessories",
      "description": "The essential vieboarding accessories to keep you rolling."
    }
  ],
  subcategories: [
    // Vieboard subcategories
    { "name": "Decks", "slug": "decks", "description": "The board itself.", "category": "cat_vieboards" },
    { "name": "Wheels", "slug": "wheels", "description": "The wheels that go on the board.", "category": "cat_vieboards" },
    { "name": "Trucks", "slug": "trucks", "description": "The trucks that go on the board.", "category": "cat_vieboards" },
    { "name": "Bearings", "slug": "bearings", "description": "The bearings that go in the wheels.", "category": "cat_vieboards" },
    { "name": "Griptape", "slug": "griptape", "description": "The griptape that goes on the board.", "category": "cat_vieboards" },
    { "name": "Hardware", "slug": "hardware", "description": "The hardware that goes on the board.", "category": "cat_vieboards" },
    { "name": "Tools", "slug": "tools", "description": "The tools that go with the board.", "category": "cat_vieboards" },
    
    // Clothing subcategories  
    { "name": "T-shirts", "slug": "t-shirts", "description": "Cool and comfy tees for effortless style.", "category": "cat_clothing" },
    { "name": "Hoodies", "slug": "hoodies", "description": "Cozy up in trendy hoodies.", "category": "cat_clothing" },
    { "name": "Pants", "slug": "pants", "description": "Relaxed and stylish pants for everyday wear.", "category": "cat_clothing" },
    { "name": "Shorts", "slug": "shorts", "description": "Stay cool with casual and comfortable shorts.", "category": "cat_clothing" },
    { "name": "Hats", "slug": "hats", "description": "Top off your look with stylish and laid-back hats.", "category": "cat_clothing" },
    
    // Shoes subcategories
    { "name": "Low Tops", "slug": "low-tops", "description": "Rad low tops shoes for a stylish low-profile look.", "category": "cat_shoes" },
    { "name": "High Tops", "slug": "high-tops", "description": "Elevate your style with rad high top shoes.", "category": "cat_shoes" },
    { "name": "Slip-ons", "slug": "slip-ons", "description": "Effortless style with rad slip-on shoes.", "category": "cat_shoes" },
    { "name": "Pros", "slug": "pros", "description": "Performance-driven rad shoes for the pros.", "category": "cat_shoes" },
    { "name": "Classics", "slug": "classics", "description": "Timeless style with rad classic shoes.", "category": "cat_shoes" },
    
    // Accessories subcategories
    { "name": "Vie Tools", "slug": "vie-tools", "description": "Essential tools for maintaining your vieboard, all rad.", "category": "cat_accessories" },
    { "name": "Bushings", "slug": "bushings", "description": "Upgrade your ride with our rad selection of bushings.", "category": "cat_accessories" },
    { "name": "Shock & Riser Pads", "slug": "shock-riser-pads", "description": "Enhance your vieboard's performance with rad shock and riser pads.", "category": "cat_accessories" },
    { "name": "Vie Rails", "slug": "vie-rails", "description": "Add creativity and style to your tricks with our rad vie rails.", "category": "cat_accessories" },
    { "name": "Wax", "slug": "wax", "description": "Keep your board gliding smoothly with our rad vie wax.", "category": "cat_accessories" },
    { "name": "Socks", "slug": "socks", "description": "Keep your feet comfy and stylish with our rad socks.", "category": "cat_accessories" },
    { "name": "Backpacks", "slug": "backpacks", "description": "Carry your gear in style with our rad backpacks.", "category": "cat_accessories" }
  ]
};

console.log('PocketBase Collections Schema:');
console.log(JSON.stringify(collections, null, 2));

console.log('\nInitial Data:'); 
console.log(JSON.stringify(initialData, null, 2));

console.log('\n=== SETUP INSTRUCTIONS ===');
console.log('1. Start your PocketBase server: ./pocketbase serve');
console.log('2. Go to PocketBase Admin UI (usually http://127.0.0.1:8090/_/)'); 
console.log('3. Go to Settings > Import collections');
console.log('4. Copy the collections JSON above and paste it');
console.log('5. Click Import to create all collections');
console.log('6. Manually create initial categories and subcategories using the data above');
console.log('7. Update your .env file with NEXT_PUBLIC_POCKETBASE_URL');
console.log('8. Test the setup by creating a user and running the Next.js app');

// Export for usage in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { collections, initialData };
}