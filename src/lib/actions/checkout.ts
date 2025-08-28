"use server"

import { revalidatePath } from "next/cache"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import { getCurrentUser } from "@/lib/pocketbase-helpers"

export interface CheckoutData {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  notes?: string
}

export interface CartItem {
  id: string
  cart: string
  product: string
  quantity: number
  expand?: {
    product?: {
      id: string
      name: string
      price: string
    }
  }
}

export async function processOrder(
  checkoutData: CheckoutData,
  cartItems: CartItem[]
) {
  try {
    const user = await getCurrentUser()
    
    if (!cartItems.length) {
      return {
        success: false,
        error: "Cart is empty"
      }
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce((total, item) => {
      const price = item.expand?.product?.price ? parseFloat(item.expand.product.price) : 0
      return total + (price * item.quantity)
    }, 0)

    // Create address record first
    const addressData = {
      line1: checkoutData.address,
      line2: "", // Optional second line
      city: checkoutData.city,
      state: checkoutData.state,
      postal_code: checkoutData.postalCode,
      country: checkoutData.country,
      user: user?.id || "", // Can be empty for guest orders
    }

    const addressRecord = await pb.collection(COLLECTIONS.ADDRESSES).create(addressData)

    // Group items by store (assuming all items are from same store for now)
    const storeId = cartItems[0]?.expand?.product?.id ? 
      await getProductStore(cartItems[0].expand.product.id) : 
      null

    if (!storeId) {
      return {
        success: false,
        error: "Unable to determine store for order"
      }
    }

    // Prepare order items data
    const orderItems = cartItems.map(item => ({
      productId: item.product,
      productName: item.expand?.product?.name || "",
      price: item.expand?.product?.price || "0",
      quantity: item.quantity,
    }))

    // Create order
    const orderData = {
      user: user?.id || "", // Can be empty for guest orders
      store: storeId,
      items: orderItems, // Store as JSON
      quantity: cartItems.reduce((total, item) => total + item.quantity, 0),
      amount: totalAmount.toString(),
      status: "pending",
      name: checkoutData.name,
      email: checkoutData.email,
      address: addressRecord.id,
      // Add notes to the order data if provided
      ...(checkoutData.notes && { notes: checkoutData.notes }),
    }

    const orderRecord = await pb.collection(COLLECTIONS.ORDERS).create(orderData)

    // Clear the user's cart after successful order
    if (user) {
      await clearUserCart(user.id)
    }

    revalidatePath("/dashboard/purchases")

    return {
      success: true,
      orderId: orderRecord.id,
      orderNumber: `ORD-${orderRecord.id.slice(-8).toUpperCase()}`,
    }
  } catch (error) {
    console.error("Order processing error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process order"
    }
  }
}

// Helper function to get the store ID for a product
async function getProductStore(productId: string): Promise<string | null> {
  try {
    const product = await pb.collection(COLLECTIONS.PRODUCTS).getOne(productId)
    return product.store || null
  } catch (error) {
    console.error("Error getting product store:", error)
    return null
  }
}

// Helper function to clear user's cart
async function clearUserCart(userId: string): Promise<void> {
  try {
    // Get user's cart
    const carts = await pb.collection(COLLECTIONS.CARTS).getFullList({
      filter: `user = "${userId}"`,
    })

    // Delete all cart items for each cart
    for (const cart of carts) {
      const cartItems = await pb.collection(COLLECTIONS.CART_ITEMS).getFullList({
        filter: `cart = "${cart.id}"`,
      })

      for (const item of cartItems) {
        await pb.collection(COLLECTIONS.CART_ITEMS).delete(item.id)
      }
    }
  } catch (error) {
    console.error("Error clearing user cart:", error)
    // Don't throw error here as order was successful
  }
}