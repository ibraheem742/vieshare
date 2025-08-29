import { api, handleApiError, ApiResponse, PaginatedResponse } from '@/lib/axios'
import { Product, ProductWithRelations, Category, Subcategory, GetProductsParams } from './types'
import { transformPocketBaseRecord } from './helpers'

// Products API endpoints
export const productsApi = {
  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/collections/products/records', {
        params: {
          filter: 'active = true && rating >= 4',
          sort: '-rating,-created',
          expand: 'category,subcategory,store',
          perPage: 8,
        }
      })
      return response.data.items.map((item: any) => transformPocketBaseRecord<Category>(item)).map((item: any) => transformPocketBaseRecord<Product>(item))
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return []
    }
  },

  // Get products with pagination and filters
  getProducts: async (params: GetProductsParams): Promise<PaginatedResponse<ProductWithRelations>> => {
    try {
      let filter = `active = ${params.active ? 'true' : 'false'}`
      
      // Add subcategories filter
      if (params.subcategories) {
        const subcategoryList = params.subcategories.split(",")
        filter += ` && subcategory.slug ?~ "${subcategoryList.join('|')}"`
      }
      
      // Add price range filter
      if (params.priceRange) {
        const [min, max] = params.priceRange.split("-").map(Number)
        if (min) filter += ` && price >= "${min}"`
        if (max) filter += ` && price <= "${max}"`
      }
      
      // Add store filter
      if (params.storeIds) {
        const storeList = params.storeIds.split(",")
        filter += ` && store ?~ "${storeList.join('|')}"`
      }

      // Add search filter
      if (params.search) {
        filter += ` && name ~ "${params.search}"`
      }

      // Convert sort format
      let pbSort = '-created'
      if (params.sort?.includes('.desc')) {
        pbSort = '-' + params.sort.split('.')[0]
      } else if (params.sort?.includes('.asc')) {
        pbSort = params.sort.split('.')[0]!
      } else if (params.sort && !params.sort.includes('.')) {
        pbSort = params.sort.startsWith('-') ? params.sort : '-' + params.sort
      }

      const response = await api.get('/collections/products/records', {
        params: {
          page: params.page || 1,
          perPage: params.perPage || 10,
          filter,
          sort: pbSort,
          expand: 'category,subcategory,store',
        }
      })

      return {
        data: response.data.items.map((item: any) => transformPocketBaseRecord<ProductWithRelations>(item)),
        total: response.data.totalItems,
        page: response.data.page,
        perPage: response.data.perPage,
        totalPages: response.data.totalPages,
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      return {
        data: [],
        total: 0,
        page: 1,
        perPage: 10,
        totalPages: 0,
      }
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<ProductWithRelations | null> => {
    try {
      const response = await api.get(`/collections/products/records/${id}`, {
        params: {
          expand: 'category,subcategory,store'
        }
      })
      return transformPocketBaseRecord<ProductWithRelations>(response.data)
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  },

  // Get product inventory
  getProductInventory: async (id: string): Promise<number> => {
    try {
      const response = await api.get(`/collections/products/records/${id}`, {
        params: {
          fields: 'inventory'
        }
      })
      return response.data.inventory || 0
    } catch (error) {
      console.error('Error fetching product inventory:', error)
      return 0
    }
  },

  // Create new product
  createProduct: async (storeId: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const data = {
        ...productData,
        store: storeId,
      }
      const response = await api.post('/collections/products/records', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Update product
  updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product> => {
    try {
      const response = await api.patch(`/collections/products/records/${productId}`, productData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<void> => {
    try {
      await api.delete(`/collections/products/records/${productId}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Upload product images
  uploadImages: async (productId: string, images: File[]): Promise<string[]> => {
    try {
      const formData = new FormData()
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      const response = await api.post<ApiResponse<{ urls: string[] }>>(
        `/products/${productId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return response.data.data.urls
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },

  // Delete product image
  deleteImage: async (productId: string, imageUrl: string): Promise<void> => {
    try {
      await api.delete(`/products/${productId}/images`, {
        data: { imageUrl }
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  },
}

// Categories API endpoints
export const categoriesApi = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get('/collections/categories/records', {
        params: {
          sort: 'name'
        }
      })
      return response.data.items.map((item: any) => transformPocketBaseRecord<Category>(item))
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  },

  // Get single category
  getCategory: async (id: string): Promise<Category | null> => {
    try {
      const response = await api.get(`/collections/categories/records/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching category:', error)
      return null
    }
  },

  // Get subcategories by category
  getSubcategories: async (categoryId?: string): Promise<Subcategory[]> => {
    try {
      const params: any = {
        sort: 'name',
        expand: 'category'
      }
      
      if (categoryId) {
        params.filter = `category = "${categoryId}"`
      }
      
      const response = await api.get('/collections/subcategories/records', { params })
      return response.data.items.map((item: any) => transformPocketBaseRecord<Subcategory>(item))
    } catch (error) {
      console.error('Error fetching subcategories:', error)
      return []
    }
  },

  // Get product count by category
  getProductCountByCategory: async (categoryId: string): Promise<number> => {
    try {
      const response = await api.get('/collections/products/records', {
        params: {
          filter: `category = "${categoryId}" && active = true`,
          page: 1,
          perPage: 1
        }
      })
      return response.data.totalItems
    } catch (error) {
      console.error('Error fetching product count by category:', error)
      return 0
    }
  },
}