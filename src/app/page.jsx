// app/page.jsx
import Nav from "./Nav"
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * الصفحة الرئيسية - Static Generation مع Error Handling محسن
 */
export default async function Home() {
  try {
    console.log('🏠 Building home page...')
    
    // جلب البيانات في build time مع build mode
    const [allProducts, saleProducts, categories] = await Promise.all([
      getAllProducts(false, true), // Enable build mode
      getSaleProducts(4, true),
      getProductCategories(true)
    ])

    console.log(`📊 Home page built with:`)
    console.log(`   - Total products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)

    return (
      <>
        <Nav />
        <StoreSSG
          initialProducts={allProducts}
          initialSaleProducts={saleProducts}
          initialCategories={categories}
        />
      </>
    )
    
  } catch (error) {
    console.error('❌ Home page build error:', error)
    
    // Provide fallback UI with empty data
    return (
      <>
        <Nav />
        <StoreSSG
          initialProducts={[]}
          initialSaleProducts={[]}
          initialCategories={[]}
        />
      </>
    )
  }
}

/**
 * إعدادات Next.js للـ Static Generation - محسنة
 */
export const metadata = {
  title: "Wn Store - Latest Fashion Collection",
  description: "Shop the latest collection of elegant dresses, casual styles & chic outfits. High-quality fabrics, affordable prices & fast delivery.",
  keywords: "fashion, dresses, casual wear, bags, online shopping, Egypt",
  openGraph: {
    title: "Wn Store - Latest Fashion Collection",
    description: "Shop the latest collection of elegant dresses, casual styles & chic outfits.",
    type: "website",
    url: "https://your-domain.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wn Store Fashion Collection"
      }
    ]
  }
}

/**
 * إعدادات الcache - محسنة للبناء
 */
export const revalidate = 3600 // 1 hour بدلاً من false
export const dynamic = 'auto' // بدلاً من force-static
export const fetchCache = 'default-cache' // بدلاً من force-cache