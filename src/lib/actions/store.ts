"use server"

import {
  unstable_noStore as noStore,
  revalidatePath,
} from "next/cache"

import { pb, COLLECTIONS, type Store } from "@/lib/pocketbase"
import { type CreateStoreSchema } from "@/lib/validations/store"

export async function createStore(input: CreateStoreSchema & { userId: string }): Promise<{
  data?: Store
  error?: string
}> {
  noStore()
  
  try {
    const store = await pb.collection(COLLECTIONS.STORES).create<Store>({
      name: input.name,
      slug: input.slug || input.name.toLowerCase().replace(/\s+/g, '-'),
      description: input.description || '',
      user: input.userId,
      plan: 'free',
      cancel_plan_at_end: false,
      product_limit: 10,
      tag_limit: 5,
      variant_limit: 5,
      active: true,
    })

    revalidatePath("/dashboard/stores")
    revalidatePath("/")
    
    return { data: store }
  } catch (err) {
    console.error('Error creating store:', err)
    return { error: "Failed to create store. Please try again." }
  }
}

export async function updateStore(input: { storeId: string } & Partial<CreateStoreSchema>): Promise<{
  data?: Store
  error?: string
}> {
  noStore()
  
  try {
    const updateData: any = {}
    if (input.name) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description
    if (input.slug) updateData.slug = input.slug
    
    const store = await pb.collection(COLLECTIONS.STORES).update<Store>(input.storeId, updateData)
    
    revalidatePath("/dashboard/stores")
    revalidatePath(`/store/${input.storeId}`)
    
    return { data: store }
  } catch (err) {
    console.error('Error updating store:', err)
    return { error: "Failed to update store" }
  }
}

// Form action version for Next.js forms
export async function updateStoreAction(storeId: string, formData: FormData): Promise<void> {
  noStore()
  
  try {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== null) updateData.description = description
    
    await pb.collection(COLLECTIONS.STORES).update(storeId, updateData)
    
    revalidatePath("/dashboard/stores")
    revalidatePath(`/store/${storeId}`)
    
  } catch (err) {
    console.error('Error updating store:', err)
    throw new Error("Failed to update store")
  }
}

export async function deleteStore(storeId: string): Promise<{
  success: boolean
  error?: string
}> {
  noStore()
  
  try {
    await pb.collection(COLLECTIONS.STORES).delete(storeId)
    
    revalidatePath("/dashboard/stores")
    revalidatePath("/")
    
    return { success: true }
  } catch (err) {
    console.error('Error deleting store:', err)
    return { success: false, error: "Failed to delete store" }
  }
}