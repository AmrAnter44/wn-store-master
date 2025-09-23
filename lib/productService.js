// lib/productService.js
import { supabase } from './supabaseClient'

// Cache في الذاكرة - هيخزن البيانات لحد ما الserver يعيد تشغيل
let productsCache = null
let cacheTimestamp = null
const CACHE_DURATION = 10 * 60 * 1000 // 10 دقايق

/**
 * جلب كل المنتجات مع إدارة الcache
 */
export async function getAllProducts(forceRefresh = false) {
  // لو عايز force refresh أو مفيش cache أو الcache قديم
  if (
    forceRefresh || 
    !productsCache || 
    !cacheTimestamp || 
    Date.now() - cacheTimestamp > CACHE_DURATION
  ) {
    try {
      console.log('🔄 Fetching products from database...')
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false }) // الأحدث الأول

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
 * جلب منتج واحد بالID
 */
export async function getProductById(id) {
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
    
    const { data, error } = await supabase
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
    throw error
  }
}

/**
 * جلب المنتجات المشابهة حسب النوع
 */
export async function getRelatedProducts(currentProduct, limit = 8) {
  try {
    const allProducts = await getAllProducts()
    
    // فلتر المنتجات من نفس النوع ماعدا المنتج الحالي
    const related = allProducts
      .filter(p => 
        p.type === currentProduct.type && 
        p.id !== currentProduct.id
      )
      .map(p => ({
        ...p,
        priceDiff: Math.abs((p.newprice || p.price) - (currentProduct.newprice || currentProduct.price))
      }))
      .sort((a, b) => a.priceDiff - b.priceDiff) // الأقرب في السعر الأول
      .slice(0, limit)

    return related

  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

/**
 * جلب منتجات العروض (اللي عليها خصم)
 */
export async function getSaleProducts(limit = 4) {
  try {
    const allProducts = await getAllProducts()
    
    const saleProducts = allProducts
      .filter(p => p.newprice && p.newprice > 0)
      .sort((a, b) => {
        // حساب نسبة الخصم وترتيب حسب الأعلى خصم
        const discountA = ((a.price - a.newprice) / a.price) * 100
        const discountB = ((b.price - b.newprice) / b.price) * 100
        return discountB - discountA
      })
      .slice(0, limit)

    return saleProducts

  } catch (error) {
    console.error('Error fetching sale products:', error)
    return []
  }
}

/**
 * جلب الأنواع المتاحة (categories)
 */
export async function getProductCategories() {
  try {
    const allProducts = await getAllProducts()
    
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
 * مسح الcache - للاستخدام بعد إضافة/تعديل/حذف منتجات
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