"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { pb, Product } from "@/lib/pocketbase"

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
    const productData = {
      name: data.name,
      description: data.description || "",
      price: data.price,
      inventory: data.inventory || 0,
      category: data.category,
      subcategory: data.subcategory || "",
      store: storeId,
      active: true
    }
    
    await pb.collection('products').create(productData)
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error(err)
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
    if (filters.search) filter += ` && name ~ "${filters.search}"`
    
    const products = await pb.collection('products').getList(1, 50, {
      filter,
      sort: '-created'
    })
    
    return { data: products.items, error: null }
  } catch (err) {
    console.error(err)
    return { data: [], error: "Failed to fetch products" }
  }
}