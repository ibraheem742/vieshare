import { env } from '@/env'
import { getFileUrl } from '@/lib/api/helpers'

/**
 * Helper functions for constructing image URLs from PocketBase API
 */

export function getImageUrl(
  record: { id: string; collectionId: string }, 
  filename: string,
  thumb?: string
): string {
  if (!record || !filename) return ''
  
  // Use the working implementation from helpers
  return getFileUrl(record, filename, thumb)
}

export function getImageUrls(
  record: { id: string; collectionId: string }, 
  images: string[]
): string[] {
  if (!record || !images || !Array.isArray(images)) return []
  
  // Use the working implementation from helpers
  return images.map(img => getFileUrl(record, img))
}

export function getProductImageUrl(
  product: { id: string; collectionId?: string; collectionName?: string; images?: string[] },
  index = 0
): string | null {
  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    return null
  }
  
  const filename = product.images[index]
  if (!filename) return null
  
  // Try to get collection ID from multiple sources
  const collectionId = product.collectionId || product.collectionName || 'products'
  
  const record = {
    id: product.id,
    collectionId,
    collectionName: collectionId
  }
  
  // Use the working implementation from helpers
  return getFileUrl(record, filename)
}

export function getProductImageUrls(
  product: { id: string; collectionId?: string; collectionName?: string; images?: string[] }
): string[] {
  if (!product.images || !Array.isArray(product.images)) return []
  
  const collectionId = product.collectionId || product.collectionName || 'products'
  
  const record = {
    id: product.id,
    collectionId,
    collectionName: collectionId
  }
  
  // Use the working implementation from helpers
  return product.images.map(img => getFileUrl(record, img))
}