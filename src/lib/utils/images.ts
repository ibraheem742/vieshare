import { env } from '@/env'

/**
 * Helper functions for constructing image URLs from PocketBase API
 */

export function getImageUrl(
  record: { id: string; collectionId: string }, 
  filename: string,
  thumb?: string
): string {
  if (!record || !filename) return ''
  
  const baseUrl = env.NEXT_PUBLIC_POCKETBASE_URL
  let url = `${baseUrl}/api/files/${record.collectionId}/${record.id}/${filename}`
  
  if (thumb) {
    url += `?thumb=${thumb}`
  }
  
  return url
}

export function getImageUrls(
  record: { id: string; collectionId: string }, 
  images: string[]
): string[] {
  if (!record || !images || !Array.isArray(images)) return []
  
  return images.map(img => getImageUrl(record, img))
}

export function getProductImageUrl(
  product: { id: string; collectionId?: string; images?: string[] },
  index = 0
): string | null {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null
  }
  
  const filename = product.images[index]
  if (!filename) return null
  
  // For products, collection is usually 'products'
  const record = {
    id: product.id,
    collectionId: product.collectionId || 'products'
  }
  
  return getImageUrl(record, filename)
}

export function getProductImageUrls(
  product: { id: string; collectionId?: string; images?: string[] }
): string[] {
  if (!product.images || !Array.isArray(product.images)) return []
  
  const record = {
    id: product.id,
    collectionId: product.collectionId || 'products'
  }
  
  return getImageUrls(record, product.images)
}