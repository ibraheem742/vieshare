# PocketBase Schema Design for VieShare

## Overview
Thiết kế schema PocketBase dựa trên cấu trúc vieshare e-commerce platform với PocketBase auth thay thế Clerk + PostgreSQL/Drizzle.

## Core Collections

### 1. **users** (Built-in PocketBase Auth)
PocketBase sẽ tự động quản lý users collection với các trường cơ bản:
- `id` (string, primary key)
- `email` (string, unique)
- `username` (string, unique) 
- `name` (string, optional)
- `verified` (boolean)
- `avatar` (file, optional)

### 2. **categories**
Danh mục sản phẩm chính (Vieboards, Clothing, Shoes, Accessories)

```javascript
{
  "id": "string (auto)", 
  "name": "string (required, unique)",
  "slug": "string (required, unique)", 
  "description": "string (optional)",
  "image": "file (optional)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth != null` (authenticated users can view)
- View: `@request.auth != null`
- Create: `@request.auth.id != null && @request.auth.role = "admin"`
- Update: `@request.auth.id != null && @request.auth.role = "admin"`
- Delete: `@request.auth.id != null && @request.auth.role = "admin"`

### 3. **subcategories**
Danh mục phụ (Decks, Wheels, T-shirts, etc.)

```javascript
{
  "id": "string (auto)",
  "name": "string (required)", 
  "slug": "string (required)",
  "description": "string (optional)",
  "category": "relation (categories, required)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:** Same as categories

### 4. **stores**
Cửa hàng của người bán

```javascript
{
  "id": "string (auto)",
  "name": "string (required, max=50)",
  "slug": "string (required, unique)",
  "description": "text (optional)",
  "user": "relation (users, required)", // owner
  "plan": "select (free, standard, pro, default=free)",
  "plan_ends_at": "datetime (optional)",
  "cancel_plan_at_end": "bool (default=false)",
  "product_limit": "number (default=10)",
  "tag_limit": "number (default=5)", 
  "variant_limit": "number (default=5)",
  "active": "bool (default=true)", // Store active status
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth != null`
- View: `@request.auth != null` 
- Create: `@request.auth != null && @request.auth.id = @request.data.user`
- Update: `@request.auth != null && @request.auth.id = user`
- Delete: `@request.auth != null && @request.auth.id = user`

### 5. **products**
Sản phẩm

```javascript
{
  "id": "string (auto)",
  "name": "string (required)",
  "description": "text (optional)",
  "images": "file (multiple, optional)",
  "category": "relation (categories, required)",
  "subcategory": "relation (subcategories, optional)",
  "price": "string (required)", // stored as string for precision
  "inventory": "number (default=0)",
  "rating": "number (default=0, max=5)",
  "store": "relation (stores, required)",
  "active": "bool (default=true)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth != null && active = true`
- View: `@request.auth != null && active = true`
- Create: `@request.auth != null && @request.auth.id = store.user`
- Update: `@request.auth != null && @request.auth.id = store.user`
- Delete: `@request.auth != null && @request.auth.id = store.user`

### 6. **carts** 
Giỏ hàng

```javascript
{
  "id": "string (auto)",
  "user": "relation (users, optional)", // null for guest carts
  "session_id": "string (optional)", // for guest carts
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = user || @request.data.session_id = @request.headers.x_session_id`
- View: `@request.auth.id = user || @request.data.session_id = @request.headers.x_session_id`
- Create: `@request.auth != null || @request.data.session_id != ""`
- Update: `@request.auth.id = user || @request.data.session_id = @request.headers.x_session_id`
- Delete: `@request.auth.id = user || @request.data.session_id = @request.headers.x_session_id`

### 7. **cart_items**
Items trong giỏ hàng

```javascript
{
  "id": "string (auto)",
  "cart": "relation (carts, required)",
  "product": "relation (products, required)",
  "quantity": "number (required, min=1)",
  "subcategory": "relation (subcategories, optional)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id`
- View: `@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id`
- Create: `@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id`
- Update: `@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id`
- Delete: `@request.auth.id = cart.user || cart.session_id = @request.headers.x_session_id`

### 8. **addresses**
Địa chỉ giao hàng

```javascript
{
  "id": "string (auto)", 
  "line1": "string (required)",
  "line2": "string (optional)",
  "city": "string (required)",
  "state": "string (required)",
  "postal_code": "string (required)",
  "country": "string (required)",
  "user": "relation (users, required)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = user`
- View: `@request.auth.id = user`
- Create: `@request.auth.id = @request.data.user`
- Update: `@request.auth.id = user`
- Delete: `@request.auth.id = user`

### 9. **orders**
Đơn hàng

```javascript
{
  "id": "string (auto)",
  "user": "relation (users, optional)", // guest orders allowed
  "store": "relation (stores, required)",
  "items": "json (required)", // CheckoutItemSchema[]
  "quantity": "number (optional)",
  "amount": "string (required)", // decimal as string
  "status": "select (pending, processing, shipped, delivered, cancelled, default=pending)",
  "name": "string (required)", // customer name
  "email": "email (required)", // customer email
  "address": "relation (addresses, required)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = user || @request.auth.id = store.user`
- View: `@request.auth.id = user || @request.auth.id = store.user`
- Create: `@request.auth != null` (system creates via API)
- Update: `@request.auth.id = store.user` (only store owners can update)
- Delete: `@request.auth.id = store.user`

### 10. **customers**
Khách hàng theo store

```javascript
{
  "id": "string (auto)",
  "name": "string (optional)",
  "email": "email (required)",
  "store": "relation (stores, required)",
  "total_orders": "number (default=0)",
  "total_spent": "string (default='0')", // decimal as string
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = store.user`
- View: `@request.auth.id = store.user`
- Create: `@request.auth.id = store.user`
- Update: `@request.auth.id = store.user`
- Delete: `@request.auth.id = store.user`

### 11. **notifications**
Email subscriptions & notifications

```javascript
{
  "id": "string (auto)",
  "email": "email (required, unique)",
  "token": "string (required, unique)",
  "user": "relation (users, optional)",
  "communication": "bool (default=false)",
  "newsletter": "bool (default=false)", 
  "marketing": "bool (default=false)",
  "created": "datetime (auto)",
  "updated": "datetime (auto)"
}
```

**Rules:**
- List: `@request.auth.id = user`
- View: `@request.auth.id = user || @request.data.token = @request.query.token`
- Create: `@request.data.email != ""` (anyone can subscribe)
- Update: `@request.auth.id = user || @request.data.token = @request.query.token`
- Delete: `@request.auth.id = user`

## Indexes for Performance

### Categories
- `slug` (unique)

### Subcategories  
- `category` (relation index)
- `slug` (unique per category)

### Stores
- `user` (relation index)
- `slug` (unique)

### Products
- `store` (relation index)  
- `category` (relation index)
- `subcategory` (relation index)
- `active` (boolean index)
- `name` (text index for search)

### Cart Items
- `cart` (relation index)
- `product` (relation index)

### Orders
- `user` (relation index)
- `store` (relation index)
- `status` (enum index)
- `created` (datetime index)

### Customers
- `store` (relation index)
- `email` (text index)

### Notifications
- `email` (unique)
- `token` (unique)

## Sample Data Structure

### Category Example:
```json
{
  "id": "cat_vieboard_123",
  "name": "Vieboards", 
  "slug": "vieboards",
  "description": "The best vieboards for all levels of viers.",
  "image": "images/categories/vieboard-one.webp"
}
```

### Product Example:
```json
{
  "id": "prod_deck_456",
  "name": "Street Vieboard Deck",
  "description": "High-quality maple deck perfect for street skating",
  "images": ["images/products/deck-1.webp", "images/products/deck-2.webp"],
  "category": "cat_vieboard_123",
  "subcategory": "subcat_decks_789", 
  "price": "59.99",
  "inventory": 25,
  "rating": 4.5,
  "store": "store_abc_123",
  "active": true
}
```

## Migration Strategy

1. **Phase 1**: Setup PocketBase collections với basic fields
2. **Phase 2**: Import sample data từ productConfig  
3. **Phase 3**: Setup proper access rules và indexes
4. **Phase 4**: Integrate với frontend components
5. **Phase 5**: Implement real-time subscriptions cho cart/orders

## Security Considerations

- **Role-based access**: Admin role cho việc manage categories/subcategories
- **Owner permissions**: Users chỉ có thể manage stores/products của họ
- **Guest support**: Anonymous carts với session-based tracking
- **Data validation**: PocketBase built-in validation + custom rules
- **File uploads**: Secure image upload với size/type restrictions

## Next Steps

1. Setup PocketBase instance
2. Create collections với schema trên
3. Import initial categories/subcategories data
4. Update frontend để connect với PocketBase APIs
5. Implement authentication flows
6. Test data flows và permissions