import { api, handleApiError, PaginatedResponse } from '@/lib/axios'
import { Store, StoreWithRelations, Customer, Order, OrderWithRelations } from './types'

// Stores API endpoints
export const storesApi = {
  // Get all stores for current user
  getUserStores: async (userId?: string): Promise<Store[]> => {
    try {
      const params: any = {
        expand: 'user'
      }
      
      // Add filter for specific user if provided
      if (userId) {
        params.filter = `user = "${userId}"`
      }
      
      const response = await api.get('/collections/stores/records', { params })
      return response.data.items || []
    } catch (error) {
      console.error('Error fetching user stores:', error)
      return []
    }
  },

  // Get single store by ID
  getStore: async (storeId: string): Promise<StoreWithRelations | null> => {
    try {
      const response = await api.get(`/collections/stores/records/${storeId}`, {
        params: {
          expand: 'user'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching store:', error)
      return null
    }
  },

  // Create new store
  createStore: async (storeData: Partial<Store>): Promise<Store> => {
    try {
      const response = await api.post('/collections/stores/records', storeData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update store
  updateStore: async (storeId: string, storeData: Partial<Store>): Promise<Store> => {
    try {
      const response = await api.patch(`/collections/stores/records/${storeId}`, storeData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete store
  deleteStore: async (storeId: string): Promise<void> => {
    try {
      await api.delete(`/collections/stores/records/${storeId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get store customers
  getStoreCustomers: async (storeId: string, page = 1, perPage = 10): Promise<PaginatedResponse<Customer>> => {
    try {
      const response = await api.get('/collections/customers/records', {
        params: {
          filter: `store = "${storeId}"`,
          page,
          perPage,
          sort: '-created'
        }
      })

      return {
        data: response.data.items,
        total: response.data.totalItems,
        page: response.data.page,
        perPage: response.data.perPage,
        totalPages: response.data.totalPages,
      }
    } catch (error) {
      console.error('Error fetching store customers:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      }
    }
  },

  // Get single customer
  getCustomer: async (customerId: string): Promise<Customer | null> => {
    try {
      const response = await api.get(`/collections/customers/records/${customerId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching customer:', error)
      return null
    }
  },

  // Get store orders
  getStoreOrders: async (
    storeId: string, 
    page = 1, 
    perPage = 10, 
    status?: string
  ): Promise<PaginatedResponse<OrderWithRelations>> => {
    try {
      let filter = `store = "${storeId}"`
      if (status) {
        filter += ` && status = "${status}"`
      }

      const response = await api.get('/collections/orders/records', {
        params: {
          filter,
          page,
          perPage,
          sort: '-created',
          expand: 'user,store,address'
        }
      })

      return {
        data: response.data.items,
        total: response.data.totalItems,
        page: response.data.page,
        perPage: response.data.perPage,
        totalPages: response.data.totalPages,
      }
    } catch (error) {
      console.error('Error fetching store orders:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      }
    }
  },

  // Get single order
  getOrder: async (orderId: string): Promise<OrderWithRelations | null> => {
    try {
      const response = await api.get(`/collections/orders/records/${orderId}`, {
        params: {
          expand: 'user,store,address'
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  },

  // Update order status
  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    try {
      const response = await api.patch(`/collections/orders/records/${orderId}`, { status })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Get store analytics (simplified)
  getStoreAnalytics: async (storeId: string, period = '30d'): Promise<any> => {
    try {
      // This would need custom implementation or server-side aggregation
      // For now, we'll get basic data
      const ordersResponse = await api.get('/collections/orders/records', {
        params: {
          filter: `store = "${storeId}"`,
          perPage: 500, // Get recent orders for basic analytics
          sort: '-created'
        }
      })

      const productsResponse = await api.get('/collections/products/records', {
        params: {
          filter: `store = "${storeId}" && active = true`,
          perPage: 1
        }
      })

      return {
        totalOrders: ordersResponse.data.totalItems,
        totalProducts: productsResponse.data.totalItems,
        recentOrders: ordersResponse.data.items.slice(0, 10)
      }
    } catch (error) {
      console.error('Error fetching store analytics:', error)
      return {}
    }
  },
}