import { api, handleApiError } from '@/lib/axios'
import { Cart, CartItem } from './types'

// Cart API endpoints
export const cartApi = {
  // Get or create cart
  getOrCreateCart: async (sessionId?: string): Promise<Cart> => {
    try {
      // First try to find existing cart
      let filter = ''
      if (sessionId) {
        filter = `sessionId = "${sessionId}"`
      } else {
        // For authenticated users, find by user relation
        filter = `user != null`
      }

      const existingResponse = await api.get('/collections/carts/records', {
        params: {
          filter,
          perPage: 1
        }
      })

      if (existingResponse.data.items.length > 0) {
        return existingResponse.data.items[0]
      }

      // Create new cart if none exists
      const cartData: Partial<Cart> = {}
      if (sessionId) {
        cartData.sessionId = sessionId
      }

      const response = await api.post('/collections/carts/records', cartData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get cart items
  getCartItems: async (cartId: string): Promise<CartItem[]> => {
    try {
      const response = await api.get('/collections/cart_items/records', {
        params: {
          filter: `cart = "${cartId}"`,
          expand: 'product,product.category,product.subcategory,product.store',
          sort: 'created'
        }
      })
      return response.data.items
    } catch (error) {
      console.error('Error fetching cart items:', error)
      return []
    }
  },

  // Add item to cart
  addToCart: async (cartId: string, productId: string, quantity: number, subcategoryId?: string): Promise<CartItem> => {
    try {
      console.log('=== CART API ADD TO CART ===')
      console.log('CartId:', cartId)
      console.log('ProductId:', productId)
      console.log('Quantity:', quantity)
      
      // Check if item already exists in cart
      const filter = `cart = "${cartId}" && product = "${productId}"${subcategoryId ? ` && subcategory = "${subcategoryId}"` : ''}`
      console.log('Filter query:', filter)
      
      const existingResponse = await api.get('/collections/cart_items/records', {
        params: {
          filter,
          perPage: 1
        }
      })
      
      console.log('Existing items response:', existingResponse.data)

      if (existingResponse.data.items.length > 0) {
        // Update existing item quantity
        const existingItem = existingResponse.data.items[0]
        const newQuantity = existingItem.quantity + quantity
        
        const response = await api.patch(`/collections/cart_items/records/${existingItem.id}`, {
          quantity: newQuantity
        })
        return response.data
      }

      // Create new cart item (use PocketBase field names)
      const cartItemData = {
        cart: cartId,      // PocketBase relation field name
        product: productId, // PocketBase relation field name  
        quantity,
        subcategory: subcategoryId || undefined
      }
      
      console.log('Creating new cart item with data:', cartItemData)
      const response = await api.post('/collections/cart_items/records', cartItemData)
      console.log('New cart item response:', response.data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId: string, quantity: number): Promise<CartItem> => {
    try {
      if (quantity <= 0) {
        await api.delete(`/collections/cart_items/records/${cartItemId}`)
        throw new Error('Item removed from cart')
      }

      const response = await api.patch(`/collections/cart_items/records/${cartItemId}`, {
        quantity
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId: string): Promise<void> => {
    try {
      await api.delete(`/collections/cart_items/records/${cartItemId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Clear entire cart
  clearCart: async (cartId: string): Promise<void> => {
    try {
      // Get all cart items
      const response = await api.get('/collections/cart_items/records', {
        params: {
          filter: `cart = "${cartId}"`
        }
      })

      // Delete all items
      await Promise.all(
        response.data.items.map((item: CartItem) =>
          api.delete(`/collections/cart_items/records/${item.id}`)
        )
      )
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get cart summary (total items, total price)
  getCartSummary: async (cartId: string): Promise<{ totalItems: number; totalPrice: string }> => {
    try {
      const response = await api.get('/collections/cart_items/records', {
        params: {
          filter: `cart = "${cartId}"`,
          expand: 'product'
        }
      })

      let totalItems = 0
      let totalPrice = 0

      response.data.items.forEach((item: any) => {
        totalItems += item.quantity
        const itemPrice = parseFloat(item.expand.product.price) * item.quantity
        totalPrice += itemPrice
      })

      return {
        totalItems,
        totalPrice: totalPrice.toFixed(2)
      }
    } catch (error) {
      console.error('Error fetching cart summary:', error)
      return { totalItems: 0, totalPrice: '0.00' }
    }
  },
}