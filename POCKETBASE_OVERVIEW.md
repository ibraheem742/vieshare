# PocketBase Tổng quan

### 1. 📦 PocketBase Types & Interfaces
- **File**: `src/lib/pocketbase.ts`
- **Cập nhật**: Định nghĩa đầy đủ types cho tất cả collections theo schema
- **Thêm mới**: 
  - `BaseRecord` interface
  - `COLLECTIONS` constants
  - Expanded relation types (ProductWithRelations, OrderWithRelations, etc.)
  - Proper typing cho CheckoutItem và OrderStatus

### 2. 🔐 Authentication System  
- **File**: `src/lib/queries/user.ts`
- **Cập nhật**: Server-side authentication với PocketBase cookies
- **Features**:
  - `getCachedUser()` - Server-side cached user retrieval
  - `getUserUsageMetrics()` - Real usage counting from PocketBase
  - `getUserPlanMetrics()` - Plan limits based on store data

- **File**: `src/lib/hooks/use-auth.tsx`
- **Cập nhật**: Client-side auth hooks
- **Features**:
  - Integrated với PocketBase auth store
  - Auto cookie management
  - Email verification support

### 3. 🏪 Store Operations
- **File**: `src/lib/queries/store.ts` 
- **Cập nhật**: Hoàn toàn migrate sang PocketBase
- **Functions**:
  - `getFeaturedStores()` - Cached featured stores
  - `getStoresByUserId()` - User's stores with relations
  - `getStoreOrders()`, `getStoreProducts()`, `getStoreCustomers()` - Store data with pagination

### 4. 🛍️ Product Operations
- **File**: `src/lib/queries/product.ts`
- **Cập nhật**: PocketBase product queries with advanced filtering
- **Features**:
  - Complex filtering by category, subcategory, price range
  - Full-text search capabilities
  - Proper relation expansion (category, subcategory, store)

### 5. 📦 Order & Customer Management
- **File**: `src/lib/actions/order.ts`
- **Cập nhật**: Order operations với PocketBase
- **Features**:
  - Order creation và line items
  - Sales metrics calculations
  - Customer analytics

### 6. 🛒 Cart System
- **File**: `src/lib/actions/cart.ts`
- **Cập nhật**: Session-based cart management
- **Features**:
  - Guest cart support with session IDs
  - Automatic cart creation
  - Cart item management

### 7. 🛠️ Helper Functions
- **File**: `src/lib/pocketbase-helpers.ts` (Mới)
- **Features**:
  - Auth helpers (signIn, signUp, signOut)
  - Collection shortcuts với proper typing
  - Error handling utilities
  - Filter builders
  - File upload helpers
  - Real-time subscriptions

### 8. ✅ Validation Updates
- **File**: `src/lib/validations/store.ts`
- **Cập nhật**: String IDs thay vì number IDs
- **File**: `src/lib/validations/product.ts`
- **Đã phù hợp**: PocketBase schema requirements

## Cấu trúc Database PocketBase

### Collections được implement:
1. **users** (Built-in PocketBase auth)
2. **categories** - Product categories
3. **subcategories** - Product subcategories  
4. **stores** - User stores với plan limits
5. **products** - Products với inventory, rating, images
6. **carts** - Shopping carts (guest + authenticated)
7. **cart_items** - Cart line items
8. **addresses** - User shipping addresses
9. **orders** - Order management với status tracking
10. **customers** - Store customer analytics
11. **notifications** - Email preferences

### Key Features:
- **Proper Relations**: Expand support cho tất cả relations
- **File Uploads**: Image handling cho products và categories
- **Real-time**: Subscription capabilities
- **Guest Support**: Anonymous carts với session tracking
- **Plan Limits**: Store và product limits based on subscription
