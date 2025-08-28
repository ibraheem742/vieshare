"use server"

import { revalidatePath } from "next/cache"

// TODO: Replace with PocketBase implementation

export async function seedProducts() {
  try {
    // TODO: Replace with PocketBase implementation
    // Temporarily disabled seeding functionality
    revalidatePath("/")
    return { success: true, message: "Seeding temporarily disabled - using PocketBase" }
  } catch (err) {
    console.error(err)
    return { success: false, error: "Failed to seed products" }
  }
}