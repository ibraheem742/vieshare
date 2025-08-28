import { type MetadataRoute } from "next"
import { pb, COLLECTIONS } from "@/lib/pocketbase"
import { allPages, allPosts } from "contentlayer2/generated"

import { absoluteUrl } from "@/lib/utils"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  async function getAllStores() {
    try {
      const stores = await pb.collection(COLLECTIONS.STORES).getFullList({
        sort: '-created',
        fields: 'id'
      })
      // Google's limit is 50,000 URLs per sitemap
      return stores.slice(0, 50000)
    } catch (err) {
      return []
    }
  }

  const storesRoutes = (await getAllStores()).map((store) => ({
    url: absoluteUrl(`/products?store_ids=${store.id}`),
    lastModified: new Date().toISOString(),
  }))

  async function getAllProducts() {
    try {
      const products = await pb.collection(COLLECTIONS.PRODUCTS).getFullList({
        sort: '-created',
        fields: 'id'
      })
      // Google's limit is 50,000 URLs per sitemap
      return products.slice(0, 50000)
    } catch (err) {
      return []
    }
  }

  const productsRoutes = (await getAllProducts()).map((product) => ({
    url: absoluteUrl(`/product/${product.id}`),
    lastModified: new Date().toISOString(),
  }))

  async function getAllCategories() {
    try {
      const categories = await pb.collection(COLLECTIONS.CATEGORIES).getFullList({
        sort: '-name',
        fields: 'id,name,slug,description'
      })
      return categories
    } catch (err) {
      return []
    }
  }

  const categoriesRoutes = (await getAllCategories()).map((category) => ({
    url: absoluteUrl(`/collections/${category.slug}`),
    lastModified: new Date().toISOString(),
  }))

  async function getAllSubcategories() {
    try {
      const subcategories = await pb.collection(COLLECTIONS.SUBCATEGORIES).getFullList({
        sort: 'name',
        fields: 'id,name,slug,description'
      })
      return subcategories
    } catch (err) {
      return []
    }
  }

  const subcategoriesRoutes = (await getAllSubcategories())
    .map((s) =>
      categoriesRoutes.map((c) => ({
        url: absoluteUrl(`/collections/${c.url.split("/").pop()}/${s.slug}`),
        lastModified: new Date().toISOString(),
      }))
    )
    .flat()

  const pagesRoutes = allPages.map((page) => ({
    url: absoluteUrl(page.slug),
    lastModified: new Date().toISOString(),
  }))

  const postsRoutes = allPosts.map((post) => ({
    url: absoluteUrl(post.slug),
    lastModified: new Date().toISOString(),
  }))

  const routes = [
    "",
    "/products",
    "/stores",
    "/build-a-board",
    "/blog",
    "/dashboard/account",
    "/dashboard/stores",
    "/dashboard/billing",
    "/dashboard/purchases",
  ].map((route) => ({
    url: absoluteUrl(route),
    lastModified: new Date().toISOString(),
  }))

  return [
    ...routes,
    ...storesRoutes,
    ...productsRoutes,
    ...categoriesRoutes,
    ...subcategoriesRoutes,
    ...pagesRoutes,
    ...postsRoutes,
  ]
}
