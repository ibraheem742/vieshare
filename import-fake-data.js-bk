#!/usr/bin/env node

/**
 * PocketBase Data Import Script for VieShare
 * Import fake data into PocketBase instance following the schema design
 * 
 * Usage: node import-fake-data.js
 * 
 * Make sure your PocketBase instance is running at https://pocketbase.vietopik.com
 * and has the collections created according to pocketbase-schema.md
 */

import { faker } from '@faker-js/faker'

const POCKETBASE_URL = 'https://pocketbase.vietopik.com'

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

// Categories data based on product config
const categoriesData = [
  {
    name: "Vieboards",
    slug: "vieboards", 
    description: "The best vieboards for all levels of viers.",
    subcategories: [
      { name: "Decks", description: "The board itself." },
      { name: "Wheels", description: "The wheels that go on the board." },
      { name: "Trucks", description: "The trucks that go on the board." },
      { name: "Bearings", description: "The bearings that go in the wheels." },
      { name: "Griptape", description: "The griptape that goes on the board." },
      { name: "Hardware", description: "The hardware that goes on the board." },
      { name: "Tools", description: "The tools that go with the board." }
    ]
  },
  {
    name: "Clothing",
    slug: "clothing",
    description: "Stylish and comfortable vieboarding clothing.",
    subcategories: [
      { name: "T-shirts", description: "Cool and comfy tees for effortless style." },
      { name: "Hoodies", description: "Cozy up in trendy hoodies." },
      { name: "Pants", description: "Relaxed and stylish pants for everyday wear." },
      { name: "Shorts", description: "Stay cool with casual and comfortable shorts." },
      { name: "Hats", description: "Top off your look with stylish and laid-back hats." }
    ]
  },
  {
    name: "Shoes", 
    slug: "shoes",
    description: "Rad shoes for long vie sessions.",
    subcategories: [
      { name: "Low Tops", description: "Rad low tops shoes for a stylish low-profile look." },
      { name: "High Tops", description: "Elevate your style with rad high top shoes." },
      { name: "Slip-ons", description: "Effortless style with rad slip-on shoes." },
      { name: "Pros", description: "Performance-driven rad shoes for the pros." },
      { name: "Classics", description: "Timeless style with rad classic shoes." }
    ]
  },
  {
    name: "Accessories",
    slug: "accessories", 
    description: "The essential vieboarding accessories to keep you rolling.",
    subcategories: [
      { name: "Vie Tools", description: "Essential tools for maintaining your vieboard, all rad." },
      { name: "Bushings", description: "Upgrade your ride with our rad selection of bushings." },
      { name: "Shock & Riser Pads", description: "Enhance your vieboard's performance with rad shock and riser pads." },
      { name: "Vie Rails", description: "Add creativity and style to your tricks with our rad vie rails." },
      { name: "Wax", description: "Keep your board gliding smoothly with our rad vie wax." },
      { name: "Socks", description: "Keep your feet comfy and stylish with our rad socks." },
      { name: "Backpacks", description: "Carry your gear in style with our rad backpacks." }
    ]
  }
]

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
      password: 'password123', // Default password for testing
      passwordConfirm: 'password123',
      verified: faker.datatype.boolean(0.8) // 80% verified
    })
  }
  
  return users
}

// Generate fake stores data
function generateStores(users, count = 5) {
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
      active: faker.datatype.boolean(0.9) // 90% stores are active
    })
  }
  
  return stores
}

// Generate fake products data
function generateProducts(categories, subcategories, stores, count = 50) {
  const products = []
  
  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(categories)
    const categorySubcategories = subcategories.filter(sub => sub.category === category.id)
    const subcategory = categorySubcategories.length > 0 ? faker.helpers.arrayElement(categorySubcategories) : null
    const store = faker.helpers.arrayElement(stores)
    
    // Generate product name based on category and subcategory
    let productName = ''
    if (category.name === 'Vieboards') {
      if (subcategory?.name === 'Decks') {
        productName = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} Deck`
      } else if (subcategory?.name === 'Wheels') {
        productName = `${faker.number.int({ min: 50, max: 60 })}mm ${faker.color.human()} Wheels`
      } else {
        productName = `Pro ${subcategory?.name || 'Component'}`
      }
    } else if (category.name === 'Clothing') {
      productName = `${faker.commerce.productAdjective()} ${subcategory?.name || 'Apparel'}`
    } else if (category.name === 'Shoes') {
      productName = `${faker.commerce.productAdjective()} ${subcategory?.name || 'Shoes'}`  
    } else {
      productName = `${faker.commerce.productAdjective()} ${subcategory?.name || category.name}`
    }
    
    products.push({
      name: productName,
      description: faker.commerce.productDescription(),
      category: category.id,
      subcategory: subcategory?.id,
      price: faker.commerce.price({ min: 10, max: 500, dec: 2 }),
      inventory: faker.number.int({ min: 0, max: 100 }),
      rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
      store: store.id,
      active: faker.datatype.boolean(0.9) // 90% active
    })
  }
  
  return products
}

// Generate fake addresses
function generateAddresses(users, count = 15) {
  const addresses = []
  
  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users)
    
    addresses.push({
      line1: faker.location.streetAddress(),
      line2: faker.datatype.boolean(0.3) ? faker.location.secondaryAddress() : '',
      city: faker.location.city(),
      state: faker.location.state(),
      postal_code: faker.location.zipCode(),
      country: 'Vietnam',
      user: user.id
    })
  }
  
  return addresses
}

// Generate fake notifications
function generateNotifications(users, count = 20) {
  const notifications = []
  
  // Some notifications for registered users
  for (let i = 0; i < Math.min(count / 2, users.length); i++) {
    const user = users[i]
    
    notifications.push({
      email: user.email,
      token: faker.string.uuid(),
      user: user.id,
      communication: faker.datatype.boolean(),
      newsletter: faker.datatype.boolean(0.7), // 70% subscribed
      marketing: faker.datatype.boolean(0.3)  // 30% marketing
    })
  }
  
  // Some notifications for non-registered emails
  for (let i = 0; i < count / 2; i++) {
    notifications.push({
      email: faker.internet.email(),
      token: faker.string.uuid(),
      communication: faker.datatype.boolean(),
      newsletter: faker.datatype.boolean(0.5),
      marketing: faker.datatype.boolean(0.2)
    })
  }
  
  return notifications
}

// Main import function
async function importData() {
  console.log('🚀 Starting PocketBase data import...\n')
  
  try {
    // 1. Create Categories
    console.log('📁 Creating categories...')
    const createdCategories = []
    
    for (const categoryData of categoriesData) {
      const category = await pbCreate('categories', {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description
      })
      
      if (category) {
        createdCategories.push(category)
        console.log(`✅ Created category: ${category.name}`)
      }
    }
    
    // 2. Create Subcategories
    console.log('\n📂 Creating subcategories...')
    const createdSubcategories = []
    
    for (let i = 0; i < categoriesData.length; i++) {
      const categoryData = categoriesData[i]
      const createdCategory = createdCategories[i]
      
      if (!createdCategory) continue
      
      for (const subData of categoryData.subcategories) {
        const subcategory = await pbCreate('subcategories', {
          name: subData.name,
          slug: createSlug(subData.name),
          description: subData.description,
          category: createdCategory.id
        })
        
        if (subcategory) {
          createdSubcategories.push(subcategory)
          console.log(`✅ Created subcategory: ${subcategory.name}`)
        }
      }
    }
    
    // 3. Create Users
    console.log('\n👥 Creating users...')
    const users = generateUsers(10)
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
    const stores = generateStores(createdUsers, 5)
    const createdStores = []
    
    for (const storeData of stores) {
      const store = await pbCreate('stores', storeData)
      if (store) {
        createdStores.push(store)
        console.log(`✅ Created store: ${store.name}`)
      }
    }
    
    // 5. Create Products
    console.log('\n🛍️ Creating products...')
    const products = generateProducts(createdCategories, createdSubcategories, createdStores, 50)
    const createdProducts = []
    
    for (const productData of products) {
      const product = await pbCreate('products', productData)
      if (product) {
        createdProducts.push(product)
        console.log(`✅ Created product: ${product.name}`)
      }
    }
    
    // 6. Create Addresses
    console.log('\n🏠 Creating addresses...')
    const addresses = generateAddresses(createdUsers, 15)
    const createdAddresses = []
    
    for (const addressData of addresses) {
      const address = await pbCreate('addresses', addressData)
      if (address) {
        createdAddresses.push(address)
        console.log(`✅ Created address in ${address.city}`)
      }
    }
    
    // 7. Create Notifications
    console.log('\n📧 Creating notifications...')
    const notifications = generateNotifications(createdUsers, 20)
    const createdNotifications = []
    
    for (const notificationData of notifications) {
      const notification = await pbCreate('notifications', notificationData)
      if (notification) {
        createdNotifications.push(notification)
        console.log(`✅ Created notification: ${notification.email}`)
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
   Addresses: ${createdAddresses.length}
   Notifications: ${createdNotifications.length}
   
🔗 PocketBase Admin: ${POCKETBASE_URL}/_/
    `)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importData()