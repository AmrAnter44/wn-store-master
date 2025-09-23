// lib/productService.js - Build Optimized Version
import { supabaseServer } from './supabaseClient'

// Simple in-memory cache
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

/**
 * Get all products with simplified build-time handling
 */
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  // ⚠️ CRITICAL: In build mode, return minimal hardcoded data to prevent timeout
  if (buildMode) {
    console.log('⚡ Build mode: Using fallback data')
    return getFallbackProducts()
  }

  // Check cache first
  if (!forceRefresh && productsCache && cacheTimestamp && 
      Date.now() - cacheTimestamp < CACHE_DURATION) {
    console.log('⚡ Using cached products')
    return productsCache
  }

  try {
    console.log('🔄 Fetching products from database...')
    
    // Simplified query with timeout handling
    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('id, name, price, newprice, type, pictures, colors, sizes, description')
        .order('id', { ascending: false })
        .limit(50), // Reduced limit for faster builds
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 10000) // 10s timeout
      )
    ])

    if (error) {
      console.error('Database error:', error)
      return getCachedOrFallback()
    }

    // Update cache
    productsCache = data || []
    cacheTimestamp = Date.now()
    
    console.log(`✅ Fetched ${productsCache.length} products`)
    return productsCache
    
  } catch (error) {
    console.error('Error fetching products:', error)
    return getCachedOrFallback()
  }
}

/**
 * Get product by ID with build optimization
 */
export async function getProductById(id, buildMode = false) {
  if (buildMode) {
    console.log(`⚡ Build mode: Getting fallback product for ${id}`)
    const fallbackProducts = getFallbackProducts()
    return fallbackProducts.find(p => p.id.toString() === id.toString()) || null
  }

  try {
    // Try cache first
    if (productsCache) {
      const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
      if (cachedProduct) return cachedProduct
    }

    // Fetch from database with timeout
    const { data, error } = await Promise.race([
      supabaseServer()
        .from('products')
        .select('*')
        .eq('id', id)
        .single(),
      
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      )
    ])

    if (error) {
      console.error('Database error:', error)
      return null
    }

    return data

  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * Get related products with build optimization
 */
export async function getRelatedProducts(currentProduct, limit = 8, buildMode = false) {
  if (buildMode || !currentProduct) {
    return []
  }

  try {
    const allProducts = await getAllProducts(false, false)
    
    if (!allProducts || allProducts.length === 0) {
      return []
    }
    
    // Simple filtering by type
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .slice(0, limit)

    return related

  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

/**
 * Get sale products with build optimization
 */
export async function getSaleProducts(limit = 4, buildMode = false) {
  if (buildMode) {
    console.log('⚡ Build mode: Using fallback sale products')
    return getFallbackProducts()
      .filter(p => p.newprice && p.newprice > 0)
      .slice(0, limit)
  }

  try {
    const allProducts = await getAllProducts(false, false)
    
    if (!allProducts || allProducts.length === 0) {
      return []
    }
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0)
      .slice(0, limit)

    return saleProducts

  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

/**
 * Get product categories with build optimization
 */
export async function getProductCategories(buildMode = false) {
  if (buildMode) {
    console.log('⚡ Build mode: Using fallback categories')
    return getFallbackCategories()
  }

  try {
    const allProducts = await getAllProducts(false, false)
    
    if (!allProducts || allProducts.length === 0) {
      return getFallbackCategories()
    }
    
    // Extract unique types
    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
    
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

    return categories

  } catch (error) {
    console.error('Error fetching categories:', error)
    return getFallbackCategories()
  }
}

/**
 * Fallback products for build mode
 */
function getFallbackProducts() {
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
 * Fallback categories for build mode
 */
function getFallbackCategories() {
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
 * Get cached data or fallback
 */
function getCachedOrFallback() {
  if (productsCache && productsCache.length > 0) {
    console.log('⚠️ Using old cached data due to error')
    return productsCache
  }
  
  console.log('⚠️ Using fallback data due to error')
  return getFallbackProducts()
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