"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { pb, COLLECTIONS, type Cart, type CartItem, type Product } from "@/lib/pocketbase"

export async function getOrCreateCart(): Promise<string> {
  const cookieStore = await cookies()
  const existingCartId = cookieStore.get('cartId')?.value
  
  if (existingCartId) {
    try {
      await pb.collection(COLLECTIONS.CARTS).getOne(existingCartId)
      return existingCartId
    } catch {
      // Cart not found, create new one
    }
  }
  
  const newCart = await pb.collection(COLLECTIONS.CARTS).create<Cart>({
    session_id: crypto.randomUUID()
  })
  
  cookieStore.set('cartId', newCart.id, { maxAge: 60 * 60 * 24 * 30 }) // 30 days
  return newCart.id
}

export async function getCartItems(input: { cartId?: string }): Promise<CartItem[]> {
  try {
    if (!input.cartId) return []
    
    const records = await pb.collection(COLLECTIONS.CART_ITEMS).getFullList<CartItem>({
      filter: `cart = "${input.cartId}"`,
      expand: 'product,subcategory'
    })
    
    return records
  } catch (err) {
    console.error('Error fetching cart items:', err)
    return []
  }
}

export async function addToCart(productId: string, quantity = 1) {
  try {
    let cartId: string
    
    // Get or create cart
    const cookieStore = await cookies()
    const existingCartId = cookieStore.get('cartId')?.value
    
    if (existingCartId) {
      try {
        await pb.collection(COLLECTIONS.CARTS).getOne(existingCartId)
        cartId = existingCartId
      } catch {
        // Cart not found, create new one
        const newCart = await pb.collection(COLLECTIONS.CARTS).create<Cart>({
          session_id: crypto.randomUUID()
        })
        cartId = newCart.id
        cookieStore.set('cartId', cartId, { maxAge: 60 * 60 * 24 * 30 }) // 30 days
      }
    } else {
      const newCart = await pb.collection(COLLECTIONS.CARTS).create<Cart>({
        session_id: crypto.randomUUID()
      })
      cartId = newCart.id
      cookieStore.set('cartId', cartId, { maxAge: 60 * 60 * 24 * 30 })
    }
    
    // Check if item already exists in cart
    const existingItems = await pb.collection(COLLECTIONS.CART_ITEMS).getFullList<CartItem>({
      filter: `cart = "${cartId}" && product = "${productId}"`
    })
    
    if (existingItems.length > 0) {
      // Update quantity
      await pb.collection(COLLECTIONS.CART_ITEMS).update(existingItems[0]!.id, {
        quantity: existingItems[0]!.quantity + quantity
      })
    } else {
      // Create new cart item
      await pb.collection(COLLECTIONS.CART_ITEMS).create<CartItem>({
        cart: cartId,
        product: productId,
        quantity
      })
    }
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error adding to cart:', err)
    return { success: false, error: "Failed to add to cart" }
  }
}

export async function deleteCartItem(itemId: string) {
  try {
    await pb.collection(COLLECTIONS.CART_ITEMS).delete(itemId)
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error deleting cart item:', err)
    return { success: false, error: "Failed to delete cart item" }
  }
}

export async function updateCartItem(input: { id: string; quantity: number }) {
  try {
    if (input.quantity <= 0) {
      // Delete if quantity is 0 or negative
      await pb.collection(COLLECTIONS.CART_ITEMS).delete(input.id)
    } else {
      await pb.collection(COLLECTIONS.CART_ITEMS).update(input.id, {
        quantity: input.quantity
      })
    }
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error updating cart item:', err)
    return { success: false, error: "Failed to update cart item" }
  }
}