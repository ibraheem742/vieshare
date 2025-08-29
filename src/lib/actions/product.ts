"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { pb, Product, COLLECTIONS } from "@/lib/pocketbase"

export async function createProduct(storeId: string, formData: FormData) {
  try {
    // TODO: Replace with PocketBase implementation
    revalidatePath("/")
    redirect(`/dashboard/stores/${storeId}/products`)
  } catch (err) {
    console.error(err)
    throw new Error("Failed to create product")
  }
}

export async function updateProduct(productId: string, data: any) {
  try {
    const updateData: any = {
      name: data.name,
      description: data.description || "",
      price: data.price,
      inventory: data.inventory || 0,
    }
    
    // Only update category/subcategory if provided
    if (data.categoryId) updateData.category = data.categoryId
    if (data.subcategoryId) updateData.subcategory = data.subcategoryId
    
    // Handle images if provided
    if (data.images && Array.isArray(data.images)) {
      updateData.images = data.images.map((img: string | { url: string }) => typeof img === 'string' ? img : img.url)
    }
    
    await pb.collection('products').update(productId, updateData)
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  try {
    // TODO: Replace with PocketBase implementation
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to delete product" }
  }
}

export async function checkProductInventory(productId: string) {
  noStore()
  try {
    // TODO: Replace with PocketBase implementation
    return { available: true, stock: 100 }
  } catch (err) {
    console.error(err)
    return { available: false, stock: 0 }
  }
}

export async function addProduct(storeId: string, data: any) {
  try {
    // Create FormData for file upload
    const formData = new FormData()
    
    // Add basic product data
    formData.append('name', data.name)
    formData.append('description', data.description || "")
    formData.append('price', data.price)
    formData.append('inventory', data.inventory || 0)
    formData.append('category', data.categoryId)
    formData.append('subcategory', data.subcategoryId || "")
    formData.append('store', storeId)
    formData.append('active', 'true')
    
    // Add image files if any
    if (data.images && data.images.length > 0) {
      data.images.forEach((fileData: any) => {
        if (fileData.file) {
          formData.append('images', fileData.file)
        }
      })
    }
    
    const product = await pb.collection(COLLECTIONS.PRODUCTS).create(formData)
    
    revalidatePath(`/store/${storeId}/products`)
    revalidatePath("/")
    return { success: true, data: product }
  } catch (err) {
    console.error('Product creation error:', err)
    return { success: false, error: "Failed to add product" }
  }
}

export async function updateProductRating(productId: string, rating: number) {
  try {
    await pb.collection('products').update(productId, { rating })
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to update rating" }
  }
}

export async function filterProducts(filters: any) {
  noStore()
  try {
    let filter = 'active = true'
    if (filters.category) filter += ` && category = "${filters.category}"`
    if (filters.subcategory) filter += ` && subcategory = "${filters.subcategory}"`
    if (filters.store) filter += ` && store = "${filters.store}"`
    if (filters.query) filter += ` && name ~ "${filters.query}"`
    
    const products = await pb.collection('products').getList(1, 50, {
      filter,
      sort: '-created',
      expand: 'category'
    })
    
    // Group products by category
    const groupedProducts = products.items.reduce((acc: any, product: any) => {
      const categoryName = product.expand?.category?.name || product.category || 'Other'
      
      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          products: []
        }
      }
      
      acc[categoryName].products.push(product)
      return acc
    }, {})
    
    const groupedArray = Object.values(groupedProducts)
    
    return { data: groupedArray, error: null }
  } catch (err) {
    console.error(err)
    return { data: [], error: "Failed to fetch products" }
  }
}