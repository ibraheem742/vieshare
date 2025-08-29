#!/usr/bin/env node

/**
 * Updated PocketBase Data Import Script
 * Import categories from product config and corresponding fake products
 * 
 * Usage: node import-updated-data.js
 * 
 * Make sure your PocketBase instance is running at https://pocketbase.vietopik.com
 * and has the collections created according to pocketbase-schema.md
 */

import { faker } from '@faker-js/faker'

const POCKETBASE_URL = 'https://pocketbase.vietopik.com'

// Product configuration from src/config/product.ts
const productConfig = {
  categories: [
    {
      id: 'vieboard-cat-1',
      name: "Vieboards",
      description: "The best vieboards for all levels of viers.",
      subcategories: [
        {
          id: 'vieboard-decks-1',
          name: "Decks",
          description: "The board itself.",
        },
        {
          id: 'vieboard-wheels-1',
          name: "Wheels",
          description: "The wheels that go on the board.",
        },
        {
          id: 'vieboard-trucks-1',
          name: "Trucks",
          description: "The trucks that go on the board.",
        },
        {
          id: 'vieboard-bearings-1',
          name: "Bearings",
          description: "The bearings that go in the wheels.",
        },
        {
          id: 'vieboard-griptape-1',
          name: "Griptape",
          description: "The griptape that goes on the board.",
        },
        {
          id: 'vieboard-hardware-1',
          name: "Hardware",
          description: "The hardware that goes on the board.",
        },
        {
          id: 'vieboard-tools-1',
          name: "Tools",
          description: "The tools that go with the board.",
        },
      ],
    },
    {
      id: 'clothing-cat-1',
      name: "Clothing",
      description: "Stylish and comfortable vieboarding clothing.",
      subcategories: [
        {
          id: 'clothing-tshirts-1',
          name: "T-shirts",
          description: "Cool and comfy tees for effortless style.",
        },
        {
          id: 'clothing-hoodies-1',
          name: "Hoodies",
          description: "Cozy up in trendy hoodies.",
        },
        {
          id: 'clothing-pants-1',
          name: "Pants",
          description: "Relaxed and stylish pants for everyday wear.",
        },
        {
          id: 'clothing-shorts-1',
          name: "Shorts",
          description: "Stay cool with casual and comfortable shorts.",
        },
        {
          id: 'clothing-hats-1',
          name: "Hats",
          description: "Top off your look with stylish and laid-back hats.",
        },
      ],
    },
    {
      id: 'shoes-cat-1',
      name: "Shoes",
      description: "Rad shoes for long vie sessions.",
      subcategories: [
        {
          id: 'shoes-lowtops-1',
          name: "Low Tops",
          description: "Rad low tops shoes for a stylish low-profile look.",
        },
        {
          id: 'shoes-hightops-1',
          name: "High Tops",
          description: "Elevate your style with rad high top shoes.",
        },
        {
          id: 'shoes-slipons-1',
          name: "Slip-ons",
          description: "Effortless style with rad slip-on shoes.",
        },
        {
          id: 'shoes-pros-1',
          name: "Pros",
          description: "Performance-driven rad shoes for the pros.",
        },
        {
          id: 'shoes-classics-1',
          name: "Classics",
          description: "Timeless style with rad classic shoes.",
        },
      ],
    },
    {
      id: 'accessories-cat-1',
      name: "Accessories",
      description: "The essential vieboarding accessories to keep you rolling.",
      subcategories: [
        {
          id: 'accessories-vietools-1',
          name: "Vie Tools",
          description: "Essential tools for maintaining your vieboard, all rad.",
        },
        {
          id: 'accessories-bushings-1',
          name: "Bushings",
          description: "Upgrade your ride with our rad selection of bushings.",
        },
        {
          id: 'accessories-pads-1',
          name: "Shock & Riser Pads",
          description: "Enhance your vieboard's performance with rad shock and riser pads.",
        },
        {
          id: 'accessories-vierails-1',
          name: "Vie Rails",
          description: "Add creativity and style to your tricks with our rad vie rails.",
        },
        {
          id: 'accessories-wax-1',
          name: "Wax",
          description: "Keep your board gliding smoothly with our rad vie wax.",
        },
        {
          id: 'accessories-socks-1',
          name: "Socks",
          description: "Keep your feet comfy and stylish with our rad socks.",
        },
        {
          id: 'accessories-backpacks-1',
          name: "Backpacks",
          description: "Carry your gear in style with our rad backpacks.",
        },
      ],
    },
  ],
}

// Helper function to make API calls to PocketBase
async function pbCreate(collection, data) {
  const response = await fetch(`${POCKETBASE_URL}/api/collections/${collection}/records`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    const error = await response.text()
    console.error(`Failed to create ${collection}:`, error)
    return null
  }
  
  return await response.json()
}

// Helper function to create slug from name
function createSlug(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

// Generate fake users data
function generateUsers(count = 10) {
  const users = []
  
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const username = faker.internet.userName()
    
    users.push({
      email: faker.internet.email(),
      username: username,
      name: `${firstName} ${lastName}`,
      password: 'password123',
      passwordConfirm: 'password123'
    })
  }
  
  return users
}

// Generate fake stores data
function generateStores(users, count = 8) {
  const stores = []
  const plans = ['free', 'standard', 'pro']
  
  for (let i = 0; i < Math.min(count, users.length); i++) {
    const storeName = faker.company.name() + ' Store'
    const plan = faker.helpers.arrayElement(plans)
    
    stores.push({
      name: storeName,
      slug: createSlug(storeName),
      description: faker.company.catchPhrase() + '. ' + faker.lorem.sentence(),
      user: users[i].id,
      plan: plan,
      product_limit: plan === 'free' ? 10 : plan === 'standard' ? 50 : 200,
      tag_limit: plan === 'free' ? 5 : plan === 'standard' ? 20 : 50,
      variant_limit: plan === 'free' ? 5 : plan === 'standard' ? 10 : 25,
      cancel_plan_at_end: false,
      active: faker.datatype.boolean(0.9)
    })
  }
  
  return stores
}

// Generate products based on category and subcategory
function generateProductsForCategory(category, subcategories, stores, productsPerSubcategory = 3) {
  const products = []
  
  for (const subcategory of subcategories) {
    for (let i = 0; i < productsPerSubcategory; i++) {
      const store = faker.helpers.arrayElement(stores)
      
      let productName = generateProductName(category.name, subcategory.name)
      let price = generateCategoryPrice(category.name, subcategory.name)
      
      products.push({
        name: productName,
        description: generateProductDescription(category.name, subcategory.name),
        category: category.id,
        subcategory: subcategory.id,
        price: price,
        inventory: faker.number.int({ min: 5, max: 150 }),
        rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
        store: store.id,
        active: faker.datatype.boolean(0.95)
      })
    }
  }
  
  return products
}

// Generate product names based on category and subcategory
function generateProductName(categoryName, subcategoryName) {
  const adjectives = ['Pro', 'Elite', 'Premium', 'Classic', 'Advanced', 'Ultimate', 'Street', 'Signature']
  const adjective = faker.helpers.arrayElement(adjectives)
  
  switch (categoryName) {
    case 'Vieboards':
      switch (subcategoryName) {
        case 'Decks':
          return `${adjective} ${faker.commerce.productMaterial()} Deck ${faker.number.int({ min: 7, max: 9 })}.5"`
        case 'Wheels':
          return `${faker.number.int({ min: 50, max: 65 })}mm ${faker.color.human()} ${adjective} Wheels`
        case 'Trucks':
          return `${faker.number.int({ min: 129, max: 159 })}mm ${adjective} Trucks`
        case 'Bearings':
          return `${adjective} ABEC-${faker.helpers.arrayElement([3, 5, 7, 9])} Bearings`
        case 'Griptape':
          return `${adjective} ${faker.color.human()} Griptape`
        case 'Hardware':
          return `${faker.number.int({ min: 7, max: 10 })}/8" ${adjective} Hardware Set`
        case 'Tools':
          return `${adjective} Multi-Tool`
        default:
          return `${adjective} ${subcategoryName}`
      }
    case 'Clothing':
      switch (subcategoryName) {
        case 'T-shirts':
          return `${adjective} ${faker.color.human()} Tee`
        case 'Hoodies':
          return `${adjective} Zip-Up Hoodie`
        case 'Pants':
          return `${adjective} Chino Pants`
        case 'Shorts':
          return `${adjective} ${faker.number.int({ min: 7, max: 11 })}" Shorts`
        case 'Hats':
          return `${adjective} ${faker.helpers.arrayElement(['Snapback', 'Beanie', 'Dad Hat'])}`
        default:
          return `${adjective} ${subcategoryName}`
      }
    case 'Shoes':
      const sizes = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11']
      return `${adjective} ${subcategoryName} - ${faker.helpers.arrayElement(sizes)}`
    case 'Accessories':
      switch (subcategoryName) {
        case 'Vie Tools':
          return `${adjective} Skate Tool`
        case 'Bushings':
          return `${faker.helpers.arrayElement(['Soft', 'Medium', 'Hard'])} ${adjective} Bushings`
        case 'Shock & Riser Pads':
          return `${faker.number.float({ min: 0.125, max: 0.5, fractionDigits: 3 })}" ${adjective} Riser Pads`
        case 'Vie Rails':
          return `${faker.number.int({ min: 14, max: 20 })}" ${adjective} Rails`
        case 'Wax':
          return `${adjective} Curb Wax`
        case 'Socks':
          return `${adjective} Crew Socks`
        case 'Backpacks':
          return `${adjective} ${faker.number.int({ min: 20, max: 35 })}L Backpack`
        default:
          return `${adjective} ${subcategoryName}`
      }
    default:
      return `${adjective} ${subcategoryName}`
  }
}

// Generate category-appropriate prices
function generateCategoryPrice(categoryName, subcategoryName) {
  switch (categoryName) {
    case 'Vieboards':
      switch (subcategoryName) {
        case 'Decks': return faker.commerce.price({ min: 40, max: 120, dec: 2 })
        case 'Wheels': return faker.commerce.price({ min: 25, max: 80, dec: 2 })
        case 'Trucks': return faker.commerce.price({ min: 35, max: 90, dec: 2 })
        case 'Bearings': return faker.commerce.price({ min: 15, max: 50, dec: 2 })
        case 'Griptape': return faker.commerce.price({ min: 8, max: 25, dec: 2 })
        case 'Hardware': return faker.commerce.price({ min: 5, max: 15, dec: 2 })
        case 'Tools': return faker.commerce.price({ min: 10, max: 35, dec: 2 })
        default: return faker.commerce.price({ min: 20, max: 100, dec: 2 })
      }
    case 'Clothing':
      switch (subcategoryName) {
        case 'T-shirts': return faker.commerce.price({ min: 15, max: 45, dec: 2 })
        case 'Hoodies': return faker.commerce.price({ min: 35, max: 85, dec: 2 })
        case 'Pants': return faker.commerce.price({ min: 40, max: 90, dec: 2 })
        case 'Shorts': return faker.commerce.price({ min: 25, max: 60, dec: 2 })
        case 'Hats': return faker.commerce.price({ min: 12, max: 35, dec: 2 })
        default: return faker.commerce.price({ min: 15, max: 80, dec: 2 })
      }
    case 'Shoes':
      return faker.commerce.price({ min: 45, max: 150, dec: 2 })
    case 'Accessories':
      switch (subcategoryName) {
        case 'Backpacks': return faker.commerce.price({ min: 30, max: 80, dec: 2 })
        case 'Socks': return faker.commerce.price({ min: 8, max: 20, dec: 2 })
        default: return faker.commerce.price({ min: 5, max: 40, dec: 2 })
      }
    default:
      return faker.commerce.price({ min: 10, max: 100, dec: 2 })
  }
}

// Generate product descriptions
function generateProductDescription(categoryName, subcategoryName) {
  const baseDescription = faker.commerce.productDescription()
  
  switch (categoryName) {
    case 'Vieboards':
      return `${baseDescription} Perfect for vieboarding enthusiasts who demand quality and performance. Built with premium materials for durability.`
    case 'Clothing':
      return `${baseDescription} Designed for comfort and style, perfect for vieboarding sessions or casual wear.`
    case 'Shoes':
      return `${baseDescription} Engineered for vieboarding with superior grip, comfort, and durability.`
    case 'Accessories':
      return `${baseDescription} Essential vieboarding accessory to enhance your riding experience.`
    default:
      return baseDescription
  }
}

// Main import function
async function importData() {
  console.log('🚀 Starting updated PocketBase data import...\n')
  
  try {
    // 1. Create Categories from product config
    console.log('📁 Creating categories from product config...')
    const createdCategories = []
    
    for (const categoryData of productConfig.categories) {
      const category = await pbCreate('categories', {
        name: categoryData.name,
        slug: createSlug(categoryData.name),
        description: categoryData.description
      })
      
      if (category) {
        createdCategories.push({
          ...category,
          originalId: categoryData.id,
          subcategories: categoryData.subcategories
        })
        console.log(`✅ Created category: ${category.name}`)
      }
    }
    
    // 2. Create Subcategories from product config
    console.log('\n📂 Creating subcategories from product config...')
    const createdSubcategories = []
    
    for (const createdCategory of createdCategories) {
      for (const subData of createdCategory.subcategories) {
        const subcategory = await pbCreate('subcategories', {
          name: subData.name,
          slug: createSlug(subData.name),
          description: subData.description,
          category: createdCategory.id
        })
        
        if (subcategory) {
          createdSubcategories.push({
            ...subcategory,
            originalId: subData.id,
            categoryId: createdCategory.id
          })
          console.log(`✅ Created subcategory: ${subcategory.name}`)
        }
      }
    }
    
    // 3. Create Users
    console.log('\n👥 Creating users...')
    const users = generateUsers(12)
    const createdUsers = []
    
    for (const userData of users) {
      const user = await pbCreate('users', userData)
      if (user) {
        createdUsers.push(user)
        console.log(`✅ Created user: ${user.username}`)
      }
    }
    
    // 4. Create Stores
    console.log('\n🏪 Creating stores...')
    const stores = generateStores(createdUsers, 8)
    const createdStores = []
    
    for (const storeData of stores) {
      const store = await pbCreate('stores', storeData)
      if (store) {
        createdStores.push(store)
        console.log(`✅ Created store: ${store.name}`)
      }
    }
    
    // 5. Create Products for each category
    console.log('\n🛍️ Creating products for each category...')
    let allProducts = []
    
    for (const createdCategory of createdCategories) {
      const categorySubcategories = createdSubcategories.filter(sub => 
        sub.categoryId === createdCategory.id
      )
      
      const categoryProducts = generateProductsForCategory(
        createdCategory, 
        categorySubcategories, 
        createdStores, 
        4 // 4 products per subcategory
      )
      
      allProducts = [...allProducts, ...categoryProducts]
    }
    
    const createdProducts = []
    for (const productData of allProducts) {
      const product = await pbCreate('products', productData)
      if (product) {
        createdProducts.push(product)
        console.log(`✅ Created product: ${product.name}`)
      }
    }
    
    // Summary
    console.log('\n🎉 Import completed successfully!')
    console.log(`
📊 Summary:
   Categories: ${createdCategories.length}
   Subcategories: ${createdSubcategories.length}
   Users: ${createdUsers.length}
   Stores: ${createdStores.length}
   Products: ${createdProducts.length}
   
🔗 PocketBase Admin: ${POCKETBASE_URL}/_/
    `)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importData()