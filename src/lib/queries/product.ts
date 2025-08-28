import "server-only"

import {
  unstable_noStore as noStore,
} from "next/cache"
import type { SearchParams } from "@/types"

import { getProductsSchema } from "@/lib/validations/product"
import { pb, COLLECTIONS, type Product, type ProductWithRelations, type Category, type Subcategory } from "@/lib/pocketbase"

export async function getFeaturedProducts(): Promise<Product[]> {
  noStore()
  try {
    const records = await pb.collection(COLLECTIONS.PRODUCTS).getList<Product>(1, 8, {
      filter: 'active = true && rating >= 4',
      sort: '-rating,-created',
      expand: 'category,subcategory,store'
    })
    return records.items
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

export async function getProducts(input: SearchParams) {
  const { page, per_page, sort, subcategories, price_range, store_ids, active } =
    getProductsSchema.parse(input)

  try {
    let filter = `active = ${active === 'true' ? 'true' : 'false'}`
    
    // Add subcategories filter
    if (subcategories) {
      const subcategoryList = subcategories.split(",")
      filter += ` && subcategory.slug ?~ "${subcategoryList.join('|')}"`
    }
    
    // Add price range filter (price is stored as string in PocketBase)
    if (price_range) {
      const [min, max] = price_range.split("-").map(Number)
      if (min) filter += ` && price >= "${min}"`
      if (max) filter += ` && price <= "${max}"`
    }
    
    // Add store filter
    if (store_ids) {
      const storeList = store_ids.split(",")
      filter += ` && store ?~ "${storeList.join('|')}"`
    }

    // Convert sort format from "field.direction" to PocketBase format
    let pbSort = '-created' // default sort
    if (sort?.includes('.desc')) {
      pbSort = '-' + sort.split('.')[0]
    } else if (sort?.includes('.asc')) {
      pbSort = sort.split('.')[0]!
    } else if (sort && !sort.includes('.')) {
      // If no direction specified, assume desc
      pbSort = sort.startsWith('-') ? sort : '-' + sort
    }

    const records = await pb.collection(COLLECTIONS.PRODUCTS).getList<ProductWithRelations>(page, per_page, {
      filter,
      sort: pbSort,
      expand: 'category,subcategory,store'
    })

    return {
      data: records.items,
      pageCount: Math.ceil(records.totalItems / per_page),
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
    const records = await pb.collection('categories').getFullList<Category>({
      sort: 'name'
    })
    return records
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function getProduct(input: { id: string }): Promise<Product | null> {
  noStore()
  try {
    const record = await pb.collection('products').getOne<Product>(input.id, {
      expand: 'category,subcategory,store'
    })
    return record
  } catch (err) {
    console.error('Error fetching product:', err)
    return null
  }
}

export async function getProductInventory(input: { id: string }): Promise<number> {
  try {
    const record = await pb.collection('products').getOne<Product>(input.id, {
      fields: 'inventory'
    })
    return record.inventory || 0
  } catch (err) {
    console.error('Error fetching product inventory:', err)
    return 0
  }
}

export async function getSubcategories(categoryId?: string): Promise<Subcategory[]> {
  try {
    let filter = ''
    if (categoryId) {
      filter = `category = "${categoryId}"`
    }
    
    const records = await pb.collection('subcategories').getFullList<Subcategory>({
      filter,
      sort: 'name',
      expand: 'category'
    })
    return records
  } catch (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }
}

export async function getProductCountByCategory(categoryId: string): Promise<number> {
  noStore()
  try {
    const records = await pb.collection('products').getList(1, 1, {
      filter: `category = "${categoryId}" && active = true`,
    })
    return records.totalItems
  } catch (err) {
    console.error('Error fetching product count by category:', err)
    return 0
  }
}