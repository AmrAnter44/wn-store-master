// app/store/page.jsx
import StoreSSG from "../components/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * صفحة المتجر - Static Generation مع Error Handling
 */
export default async function StorePage() {
  try {
    console.log('🏪 Building store page...')
    
    // جلب البيانات في build time مع build mode
    const [allProducts, saleProducts, categories] = await Promise.all([
      getAllProducts(false, true), // Enable build mode
      getSaleProducts(4, true),
      getProductCategories(true)
    ])

    console.log(`🏪 Store page built with:`)
    console.log(`   - Total products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)

    return (
      <div className="min-h-screen pt-16">
        <StoreSSG
          initialProducts={allProducts}
          initialSaleProducts={saleProducts}
          initialCategories={categories}
        />
      </div>
    )
    
  } catch (error) {
    console.error('❌ Store page build error:', error)
    
    // Provide fallback UI with empty data
    return (
      <div className="min-h-screen pt-16">
        <StoreSSG
          initialProducts={[]}
          initialSaleProducts={[]}
          initialCategories={[]}
        />
      </div>
    )
  }
}

/**
 * Metadata للـ SEO
 */
export const metadata = {
  title: "Store - Wn Store Fashion Collection",
  description: "Browse our complete fashion collection. Find the perfect dress, casual wear, or bag from our curated selection.",
  keywords: "fashion store, dresses, casual wear, bags, online shopping, Egypt, fashion collection",
  openGraph: {
    title: "Store - Wn Store Fashion Collection",
    description: "Browse our complete fashion collection. Find the perfect outfit from our curated selection.",
    type: "website",
    url: "https://your-domain.com/store",
    images: [
      {
        url: "/store-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wn Store Complete Fashion Collection"
      }
    ]
  }
}

/**
 * إعدادات الcache للأداء الأمثل - محسنة
 */
export const dynamic = 'force-dynamic'
export const revalidate = 0

export const fetchCache = 'default-cache' // بدلاً من force-cache