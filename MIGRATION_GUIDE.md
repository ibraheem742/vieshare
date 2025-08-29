# PocketBase to Axios Migration Guide

## Overview
Bài hướng dẫn này giải thích cách chuyển đổi từ PocketBase SDK sang Axios để gọi PocketBase API trực tiếp.

## Key Changes

### 1. Import Changes

**Before (PocketBase SDK):**
```typescript
import { pb, COLLECTIONS, type PBUser } from "@/lib/pocketbase"
import { getCurrentUser, signInWithPassword } from "@/lib/pocketbase-helpers"
import { useAuth } from "@/lib/hooks/use-auth"
```

**After (Axios):**
```typescript
import { authApi, productsApi, API_COLLECTIONS, type User } from "@/lib/api"
import { getCurrentUser, signInWithPassword } from "@/lib/api/helpers"
import { useAuth } from "@/lib/hooks/use-auth-axios"
```

### 2. Authentication

**Before:**
```typescript
// Sign in
const authData = await pb.collection('users').authWithPassword(email, password)

// Get current user
if (pb.authStore.isValid) {
  const user = pb.authStore.model
}

// Sign out
pb.authStore.clear()
```

**After:**
```typescript
// Sign in
const authData = await authApi.signIn({ email, password })

// Get current user
const user = await authApi.getCurrentUser()

// Sign out
await authApi.signOut()
```

### 3. Data Fetching

**Before:**
```typescript
// Get products
const records = await pb.collection('products').getList(page, perPage, {
  filter: 'active = true',
  sort: '-created',
  expand: 'category,store'
})
```

**After:**
```typescript
// Get products
const result = await productsApi.getProducts({
  page,
  perPage,
  active: true,
  sort: 'created.desc'
})
```

### 4. CRUD Operations

**Before:**
```typescript
// Create
const record = await pb.collection('products').create(data)

// Update
const record = await pb.collection('products').update(id, data)

// Delete
await pb.collection('products').delete(id)
```

**After:**
```typescript
// Create
const record = await productsApi.createProduct(storeId, data)

// Update
const record = await productsApi.updateProduct(id, data)

// Delete
await productsApi.deleteProduct(id)
```

## File-by-File Migration

### 1. Update Auth Hook Usage

**Files to update:**
- Any component using `useAuth` from `@/lib/hooks/use-auth`

**Changes needed:**
```typescript
// Change import
import { useAuth } from "@/lib/hooks/use-auth-axios"

// Usage remains the same
const { user, signIn, signOut, isLoading } = useAuth()
```

### 2. Update Product Queries

**Files to update:**
- `src/lib/queries/product.ts`
- Components using product data

**Example migration:**
```typescript
// Before
import { pb, COLLECTIONS } from "@/lib/pocketbase"

export async function getFeaturedProducts() {
  const records = await pb.collection(COLLECTIONS.PRODUCTS).getList(1, 8, {
    filter: 'active = true && rating >= 4',
    sort: '-rating,-created'
  })
  return records.items
}

// After
import { productsApi } from "@/lib/api"

export async function getFeaturedProducts() {
  return await productsApi.getFeaturedProducts()
}
```

### 3. Update Store Actions

**Files to update:**
- `src/lib/actions/product.ts`
- `src/lib/actions/store.ts`

**Example migration:**
```typescript
// Before
import { pb } from "@/lib/pocketbase"

export async function updateProduct(productId: string, data: any) {
  await pb.collection('products').update(productId, data)
}

// After
import { productsApi } from "@/lib/api"

export async function updateProduct(productId: string, data: any) {
  return await productsApi.updateProduct(productId, data)
}
```

## Environment Variables

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_POCKETBASE_URL="https://pocketbase.vietopik.com"
```

## Error Handling

**Before:**
```typescript
try {
  const record = await pb.collection('products').create(data)
} catch (error) {
  if (error.status === 400) {
    // Handle validation error
  }
}
```

**After:**
```typescript
try {
  const record = await productsApi.createProduct(storeId, data)
} catch (error) {
  const message = getApiErrorMessage(error)
  // Handle error
}
```

## Real-time Features

PocketBase real-time subscriptions are not yet implemented in the Axios version. For now, you'll need to:

1. Remove real-time subscription code
2. Use periodic polling if needed
3. Or implement WebSocket connections separately

## File URLs

**Before:**
```typescript
import { pb } from "@/lib/pocketbase"
const imageUrl = pb.files.getURL(record, filename)
```

**After:**
```typescript
import { getFileUrl } from "@/lib/api/helpers"
const imageUrl = getFileUrl(record, filename)
```

## Testing the Migration

1. Update one component at a time
2. Test authentication flow first
3. Test data fetching
4. Test CRUD operations
5. Verify file uploads/images work

## Common Issues

1. **Token not being sent**: Make sure axios interceptor is properly configured
2. **CORS issues**: Verify PocketBase CORS settings
3. **Field name mismatches**: Use `transformPocketBaseRecord` helper if needed
4. **Date format differences**: Handle date parsing in components

## Rollback Plan

If you need to rollback:
1. Keep the original PocketBase files
2. Switch imports back to PocketBase
3. Update auth provider in main layout