"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { productsApi, type Product } from "@/lib/api"

export async function createProduct(storeId: string, formData: FormData) {
  try {
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: formData.get("price") as string,
      inventory: Number(formData.get("inventory")),
      categoryId: formData.get("categoryId") as string,
      subcategoryId: formData.get("subcategoryId") as string || undefined,
      active: true,
    }
    
    await productsApi.createProduct(storeId, productData)
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
    if (data.categoryId) updateData.categoryId = data.categoryId
    if (data.subcategoryId) updateData.subcategoryId = data.subcategoryId
    
    // Handle images if provided
    if (data.images && Array.isArray(data.images)) {
      updateData.images = data.images.map((img: string | { url: string }) => typeof img === 'string' ? img : img.url)
    }
    
    await productsApi.updateProduct(productId, updateData)
    
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to update product" }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await productsApi.deleteProduct(productId)
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
    const inventory = await productsApi.getProductInventory(productId)
    return { available: inventory > 0, stock: inventory }
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
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || undefined,
      active: true,
      images: data.images || []
    }
    
    const product = await productsApi.createProduct(storeId, productData)
    
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
    await productsApi.updateProduct(productId, { rating })
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
    
    const result = await productsApi.getProducts({
      page: 1,
      perPage: 50,
      active: true,
      search: filters.query,
    })
    
    // Group products by category
    const groupedProducts = result.data.reduce((acc: any, product: any) => {
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