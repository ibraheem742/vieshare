"use client"

import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { useEffect, useState } from "react"
import { addToCart, getCartItems, getOrCreateCart, updateCartItem, deleteCartItem } from "@/lib/actions/cart"
import { toast } from "sonner"

interface CartItem {
  id: string
  cart: string
  product: string
  quantity: number
  created: string
  updated: string
  expand?: {
    product?: {
      id: string
      name: string
      price: string
      images: string[]
    }
  }
}

interface CartStore {
  items: CartItem[]
  itemCount: number
  isLoading: boolean
  error: string | null
  cartId: string | null
  
  // Actions
  loadCart: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => void
  getItemCount: () => number
  getTotalPrice: () => number
}

export const useCart = create<CartStore>()(
  subscribeWithSelector((set, get) => ({
    items: [],
    itemCount: 0,
    isLoading: false,
    error: null,
    cartId: null,

    loadCart: async () => {
      set({ isLoading: true, error: null })
      try {
        const cartId = await getOrCreateCart()
        const items = await getCartItems({ cartId }) as unknown as CartItem[]
        const itemCount = items.reduce((total, item) => total + item.quantity, 0)
        
        set({ 
          cartId,
          items, 
          itemCount,
          isLoading: false 
        })
      } catch (error) {
        console.error('Error loading cart:', error)
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load cart',
          isLoading: false 
        })
      }
    },

    addItem: async (productId: string, quantity = 1) => {
      set({ isLoading: true, error: null })
      try {
        const result = await addToCart(productId, quantity)
        if (result.success) {
          // Reload cart to get updated items
          await get().loadCart()
          toast.success("Product added to cart")
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add item to cart'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
        throw error
      }
    },

    updateItem: async (itemId: string, quantity: number) => {
      set({ isLoading: true, error: null })
      try {
        const result = await updateCartItem(itemId, quantity)
        if (result.success) {
          // Update local state immediately
          const currentItems = get().items
          const updatedItems = quantity <= 0 
            ? currentItems.filter(item => item.id !== itemId)
            : currentItems.map(item => 
                item.id === itemId ? { ...item, quantity } : item
              )
          const itemCount = updatedItems.reduce((total, item) => total + item.quantity, 0)
          
          set({ 
            items: updatedItems, 
            itemCount,
            isLoading: false 
          })
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update item'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    },

    removeItem: async (itemId: string) => {
      set({ isLoading: true, error: null })
      try {
        const result = await deleteCartItem(itemId)
        if (result.success) {
          // Update local state immediately
          const currentItems = get().items
          const updatedItems = currentItems.filter(item => item.id !== itemId)
          const itemCount = updatedItems.reduce((total, item) => total + item.quantity, 0)
          
          set({ 
            items: updatedItems, 
            itemCount,
            isLoading: false 
          })
          toast.success("Item removed from cart")
        } else {
          throw new Error(result.error)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove item'
        set({ error: errorMessage, isLoading: false })
        toast.error(errorMessage)
      }
    },

    clearCart: () => {
      set({ items: [], itemCount: 0 })
    },

    getItemCount: () => get().itemCount,

    getTotalPrice: () => {
      const items = get().items
      return items.reduce((total, item) => {
        const price = item.expand?.product?.price ? parseFloat(item.expand.product.price) : 0
        return total + (price * item.quantity)
      }, 0)
    }
  }))
)

// Hook to initialize cart on mount
export function useCartInitializer() {
  const loadCart = useCart((state) => state.loadCart)

  useEffect(() => {
    void loadCart()
  }, [loadCart])
}

// SSR-safe cart hook
export function useCartSafe() {
  const [mounted, setMounted] = useState(false)
  const cart = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return safe defaults during SSR
  if (!mounted) {
    return {
      items: [],
      itemCount: 0,
      isLoading: false,
      error: null,
      cartId: null,
      loadCart: async () => {},
      addItem: async () => {},
      updateItem: async () => {},
      removeItem: async () => {},
      clearCart: () => {},
      getItemCount: () => 0,
      getTotalPrice: () => 0,
    }
  }

  return cart
}