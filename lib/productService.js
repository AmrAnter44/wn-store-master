// lib/productService.js - Fixed for Vercel deployment
import { supabaseServer } from './supabaseClient'

// Simple in-memory cache
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * ✅ FIXED: Get all products - Always fetch from Supabase
 */
export async function getAllProducts(forceRefresh = false) {
  // Check cache first
  if (!forceRefresh && productsCache && cacheTimestamp && 
      Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('⚡ Using cached products')
    return productsCache
  }

  try {
    console.log('🔄 Fetching products from Supabase database...')
    
    // Always fetch from Supabase with proper timeout
    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('id, name, price, newprice, type, pictures, colors, sizes, description')
        .order('id', { ascending: false }),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 30000) // 30s timeout
      )
    ])

    if (error) {
      console.error('❌ Supabase error:', error)
      // Return cached data if available, otherwise fallback
      return productsCache || getFallbackProducts()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No products found in database')
      return productsCache || getFallbackProducts()
    }

    // Update cache with real data
    productsCache = data
    cacheTimestamp = Date.now()
    
    console.log(`✅ Fetched ${productsCache.length} products from Supabase`)
    return productsCache
    
  } catch (error) {
    console.error('❌ Error fetching products:', error)
    // Return cached data if available, otherwise fallback
    return productsCache || getFallbackProducts()
  }
}

/**
 * ✅ FIXED: Get product by ID - Always from Supabase
 */
export async function getProductById(id) {
  try {
    // Try cache first
    if (productsCache) {
      const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
      if (cachedProduct) {
        console.log(`⚡ Using cached product for ID: ${id}`)
        return cachedProduct
      }
    }

    console.log(`🔄 Fetching product ${id} from Supabase...`)

    // Always fetch from Supabase with timeout
    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('*')
        .eq('id', id)
        .single(),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 15000) // 15s timeout
      )
    ])

    if (error) {
      console.error(`❌ Supabase error for product ${id}:`, error)
      return null
    }

    console.log(`✅ Fetched product: ${data?.name} (ID: ${id})`)
    return data

  } catch (error) {
    console.error(`❌ Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * ✅ FIXED: Get related products
 */
export async function getRelatedProducts(currentProduct, limit = 8) {
  if (!currentProduct) {
    return []
  }

  try {
    console.log(`🔄 Fetching related products for: ${currentProduct.name}`)
    
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for related products')
      return []
    }
    
    // Filter by same type, exclude current product
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .slice(0, limit)

    console.log(`✅ Found ${related.length} related products`)
    return related

  } catch (error) {
    console.error('❌ Error fetching related products:', error)
    return []
  }
}

/**
 * ✅ FIXED: Get sale products
 */
export async function getSaleProducts(limit = 4) {
  try {
    console.log('🔄 Fetching sale products from Supabase...')
    
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for sale products')
      return []
    }
    
    // Filter products with newprice (sale price)
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0 && p.newprice < p.price)
      .slice(0, limit)

    console.log(`✅ Found ${saleProducts.length} sale products`)
    return saleProducts

  } catch (error) {
    console.error('❌ Error fetching sale products:', error)
    return []
  }
}

/**
 * ✅ FIXED: Get product categories
 */
export async function getProductCategories() {
  try {
    console.log('🔄 Fetching categories from Supabase...')
    
    const allProducts = await getAllProducts(false)
    
    if (!allProducts || allProducts.length === 0) {
      console.warn('⚠️ No products available for categories')
      return getFallbackCategories()
    }
    
    // Extract unique types from real data
    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
    
    console.log(`📂 Found categories: ${uniqueTypes.join(', ')}`)
    
    const categoryMapping = {
      "casual": {
        name: "Casual",
        description: "Comfortable everyday wear",
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"
      },
      "dress": {
        name: "Dresses", 
        description: "Elegant dresses for special occasions",
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png"
      },
      "bag": {
        name: "Bags",
        description: "Stylish bags and accessories", 
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png"
      }
    }

    const categories = uniqueTypes.map(type => {
      const mapping = categoryMapping[type.toLowerCase()] || {
        name: type.charAt(0).toUpperCase() + type.slice(1),
        description: `Discover our ${type} collection`,
        image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"
      }
      
      const productCount = allProducts.filter(p => p.type === type).length
      
      return {
        key: type,
        ...mapping,
        count: productCount
      }
    })

    console.log(`✅ Generated ${categories.length} categories`)
    return categories

  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return getFallbackCategories()
  }
}

/**
 * Fallback products - Only when Supabase completely unavailable
 */
function getFallbackProducts() {
  console.log('⚠️ Using fallback products (Supabase unavailable)')
  return [
    {
      id: 1,
      name: "Classic Black Dress",
      price: 299,
      newprice: 199,
      type: "dress",
      description: "Elegant black dress perfect for any occasion",
      pictures: [
        "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png"
      ],
      colors: ["black"],
      sizes: ["S", "M", "L"]
    },
    {
      id: 2,
      name: "Casual Summer Top",
      price: 149,
      newprice: null,
      type: "casual",
      description: "Light and comfortable summer wear",
      pictures: [
        "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png"
      ],
      colors: ["white", "blue"],
      sizes: ["S", "M", "L", "XL"]
    },
    {
      id: 3,
      name: "Luxury Handbag",
      price: 599,
      newprice: 399,
      type: "bag",
      description: "Premium quality leather handbag",
      pictures: [
        "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png"
      ],
      colors: ["brown", "black"],
      sizes: []
    }
  ]
}

/**
 * Fallback categories - Only when Supabase completely unavailable
 */
function getFallbackCategories() {
  console.log('⚠️ Using fallback categories (Supabase unavailable)')
  return [
    {
      key: "casual",
      name: "Casual",
      description: "Comfortable everyday wear",
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png",
      count: 0
    },
    {
      key: "dress",
      name: "Dresses",
      description: "Elegant dresses for special occasions",
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/dress.png",
      count: 0
    },
    {
      key: "bag",
      name: "Bags",
      description: "Stylish bags and accessories",
      image: "https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/bag.png",
      count: 0
    }
  ]
}

/**
 * Clear cache
 */
export function clearProductsCache() {
  console.log('🗑️ Clearing products cache...')
  productsCache = null
  cacheTimestamp = null
}

/**
 * Get cache info
 */
export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    cacheValid: cacheTimestamp ? (Date.now() - cacheTimestamp) < CACHE_DURATION : false
  }
}