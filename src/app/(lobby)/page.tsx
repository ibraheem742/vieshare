import * as React from "react"

import { getGithubStars } from "@/lib/queries/github"
import { getCategories, getFeaturedProducts } from "@/lib/queries/product"
import { getFeaturedStores } from "@/lib/queries/store"

import { Lobby } from "./_components/lobby"
import { LobbySkeleton } from "./_components/lobby-skeleton"

export const dynamic = 'force-dynamic'

export default async function IndexPage() {
  /**
   * Direct await for debugging - remove cache/suspense issues
   */
  
  try {
    console.log('Homepage: Starting data fetch...')
    
    const githubStars = await getGithubStars()
    console.log('Homepage: GitHub stars:', githubStars)
    
    const products = await getFeaturedProducts()
    console.log('Homepage: Products fetched:', products.length)
    
    const categories = await getCategories()
    console.log('Homepage: Categories fetched:', categories.length)
    
    const stores = await getFeaturedStores()
    console.log('Homepage: Stores fetched:', stores.length)

    return (
      <Lobby
        githubStarsPromise={Promise.resolve(githubStars)}
        productsPromise={Promise.resolve(products)}
        categoriesPromise={Promise.resolve(categories)}
        storesPromise={Promise.resolve(stores)}
      />
    )
    
  } catch (error) {
    console.error('Homepage: Data fetch error:', error)
    return <LobbySkeleton />
  }
}
