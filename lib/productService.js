// lib/productService.js - Emergency Version
import { supabaseServer } from './supabaseClient'

// Cache في الذاكرة - هيخزن البيانات لحد ما الserver يعيد تشغيل
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 10 * 60 * 1000 // 10 دقايق

/**
 * جلب كل المنتجات - مبسط للطوارئ
 */
export async function getAllProducts(forceRefresh = false, buildMode = false) {
  // في وضع البناء، ارجع فاضي فوراً لتجنب timeout
  if (buildMode) {
    console.log('⚠️ Build mode: Returning empty data to avoid timeout')
    return []
  }

  // لو عايز force refresh أو مفيش cache أو الcache قديم
  if (
    forceRefresh || 
    !productsCache || 
    !cacheTimestamp || 
    Date.now() - cacheTimestamp > CACHE_DURATION
  ) {
    try {
      console.log('🔄 Fetching products from database...')
      
      const { data, error } = await supabaseServer()
        .from('products')
        .select('*')
        .limit(100) // حدد العدد لتجنب مشاكل الذاكرة
        .order('id', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        throw error
      }

      // تحديث الcache
      productsCache = data || []
      cacheTimestamp = Date.now()
      
      console.log(`✅ Cached ${productsCache.length} products`)
      return productsCache
      
    } catch (error) {
      console.error('Error fetching products:', error)
      
      // لو فيه مشكلة وعندنا cache قديم، استخدمه
      if (productsCache) {
        console.log('⚠️ Using old cached data due to error')
        return productsCache
      }
      
      // لو مفيش cache خالص، ارجع array فاضي
      return []
    }
  }

  // استخدم الcache الموجود
  console.log('⚡ Using cached products')
  return productsCache
}

/**
 * جلب منتج واحد بالID - مبسط
 */
export async function getProductById(id, buildMode = false) {
  // في وضع البناء، ارجع null فوراً
  if (buildMode) {
    console.log('⚠️ Build mode: Returning null for product', id)
    return null
  }

  try {
    // جرب الأول من الcache
    if (productsCache) {
      const cachedProduct = productsCache.find(p => p.id.toString() === id.toString())
      if (cachedProduct) {
        console.log(`⚡ Using cached product: ${id}`)
        return cachedProduct
      }
    }

    // لو مش موجود في الcache، جيبه من الdatabase
    console.log(`🔄 Fetching product ${id} from database...`)
    
    const { data, error } = await supabaseServer()
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    return data

  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

/**
 * جلب المنتجات المشابهة - مبسط
 */
export async function getRelatedProducts(currentProduct, limit = 8, buildMode = false) {
  try {
    // في وضع البناء، ارجع array فاضي
    if (buildMode) {
      return []
    }

    const allProducts = await getAllProducts(false, buildMode)
    
    if (!allProducts || allProducts.length === 0) {
      return []
    }
    
    // فلتر المنتجات من نفس النوع ماعدا المنتج الحالي
    const related = allProducts
      .filter(p => 
        p.type === currentProduct?.type && 
        p.id !== currentProduct?.id
      )
      .slice(0, limit) // بسط الترتيب

    return related

  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

/**
 * جلب منتجات العروض - مبسط
 */
export async function getSaleProducts(limit = 4, buildMode = false) {
  try {
    // في وضع البناء، ارجع array فاضي
    if (buildMode) {
      return []
    }

    const allProducts = await getAllProducts(false, buildMode)
    
    if (!allProducts || allProducts.length === 0) {
      return []
    }
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0)
      .slice(0, limit) // بسط الترتيب

    return saleProducts

  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

/**
 * جلب الأنواع المتاحة - مبسط
 */
export async function getProductCategories(buildMode = false) {
  try {
    // في وضع البناء، ارجع categories افتراضية
    if (buildMode) {
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

    const allProducts = await getAllProducts(false, buildMode)
    
    if (!allProducts || allProducts.length === 0) {
      return []
    }
    
    // استخراج الأنواع الفريدة
    const uniqueTypes = [...new Set(allProducts.map(p => p.type).filter(Boolean))]
    
    // معلومات إضافية لكل نوع
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
      
      // حساب عدد المنتجات في كل نوع
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
    return []
  }
}

/**
 * مسح الcache
 */
export function clearProductsCache() {
  console.log('🗑️ Clearing products cache...')
  productsCache = null
  cacheTimestamp = null
}

/**
 * معلومات الcache الحالي
 */
export function getCacheInfo() {
  return {
    hasCache: !!productsCache,
    cacheSize: productsCache ? productsCache.length : 0,
    cacheAge: cacheTimestamp ? Date.now() - cacheTimestamp : null,
    cacheValid: cacheTimestamp ? (Date.now() - cacheTimestamp) < CACHE_DURATION : false
  }
}