"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { cookies } from "next/headers"

import { cartApi, type Cart, type CartItem, type Product } from "@/lib/api"

export async function getOrCreateCart(): Promise<string> {
  const cookieStore = await cookies()
  const existingCartId = cookieStore.get('cartId')?.value
  const sessionId = crypto.randomUUID()
  
  if (existingCartId) {
    try {
      // Try to get existing cart - this is simplified, would need API endpoint
      return existingCartId
    } catch {
      // Cart not found, create new one
    }
  }
  
  const newCart = await cartApi.getOrCreateCart(sessionId)
  
  cookieStore.set('cartId', newCart.id, { maxAge: 60 * 60 * 24 * 30 }) // 30 days
  return newCart.id
}

export async function getCartItems(input: { cartId?: string }): Promise<CartItem[]> {
  try {
    if (!input.cartId) return []
    
    const items = await cartApi.getCartItems(input.cartId)
    return items
  } catch (err) {
    console.error('Error fetching cart items:', err)
    return []
  }
}

export async function addToCart(productId: string, quantity = 1) {
  try {
    console.log('=== ADD TO CART ACTION ===')
    console.log('Product ID:', productId)
    console.log('Quantity:', quantity)
    
    // Get or create cart
    const cartId = await getOrCreateCart()
    console.log('Cart ID:', cartId)
    
    // Add item to cart
    const result = await cartApi.addToCart(cartId, productId, quantity)
    console.log('Add to cart result:', result)
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error adding to cart:', err)
    return { success: false, error: err instanceof Error ? err.message : "Failed to add to cart" }
  }
}

export async function deleteCartItem(itemId: string) {
  try {
    await cartApi.removeFromCart(itemId)
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error deleting cart item:', err)
    return { success: false, error: "Failed to delete item" }
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    await cartApi.updateCartItem(itemId, quantity)
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error updating cart item:', err)
    return { success: false, error: "Failed to update item" }
  }
}

export async function clearCart(cartId: string) {
  try {
    await cartApi.clearCart(cartId)
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error('Error clearing cart:', err)
    return { success: false, error: "Failed to clear cart" }
  }
}

export async function getCartSummary(cartId?: string) {
  noStore()
  try {
    if (!cartId) return { totalItems: 0, totalPrice: "0.00" }
    
    return await cartApi.getCartSummary(cartId)
  } catch (err) {
    console.error('Error fetching cart summary:', err)
    return { totalItems: 0, totalPrice: "0.00" }
  }
}