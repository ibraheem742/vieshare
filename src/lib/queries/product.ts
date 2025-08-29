import "server-only"

import {
  unstable_noStore as noStore,
} from "next/cache"
import type { SearchParams } from "@/types"

import { getProductsSchema } from "@/lib/validations/product"
import { productsApi, categoriesApi, type Product, type ProductWithRelations, type Category, type Subcategory } from "@/lib/api"

export async function getFeaturedProducts(): Promise<Product[]> {
  noStore()
  try {
    return await productsApi.getFeaturedProducts()
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getProducts(input: SearchParams) {
  const { page, per_page, sort, subcategories, price_range, store_ids, active } =
    getProductsSchema.parse(input)

  try {
    const result = await productsApi.getProducts({
      page,
      perPage: per_page,
      sort,
      subcategories,
      priceRange: price_range,
      storeIds: store_ids,
      active: active === 'true'
    })

    return {
      data: result.data,
      pageCount: result.totalPages,
    }
  } catch (err) {
    console.error('Error fetching products:', err)
    return {
      data: [],
      pageCount: 0,
    }
  }
}

export async function getCategories(): Promise<Category[]> {
  noStore()
  try {
    return await categoriesApi.getCategories()
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getProduct(input: { id: string }): Promise<ProductWithRelations | null> {
  noStore()
  try {
    return await productsApi.getProduct(input.id)
  } catch (err) {
    console.error('Error fetching product:', err)
    return null
  }
}

export async function getProductInventory(input: { id: string }): Promise<number> {
  try {
    return await productsApi.getProductInventory(input.id)
  } catch (err) {
    console.error('Error fetching product inventory:', err)
    return 0
  }
}

export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  try {
    return await categoriesApi.getSubcategories(categoryId)
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
}

export async function getProductCountByCategory(categoryId: string): Promise<number> {
  noStore()
  try {
    return await categoriesApi.getProductCountByCategory(categoryId)
  } catch (err) {
    console.error('Error fetching product count by category:', err)
    return 0
  }
}