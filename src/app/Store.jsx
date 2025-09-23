// app/store/page.jsx
import StoreSSG from "../components/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * صفحة المتجر - Static Generation
 * نفس البيانات بتاعة الصفحة الرئيسية بس بدون الهيرو سيكشن
 */
export default async function StorePage() {
  // جلب البيانات في build time
  const [allProducts, saleProducts, categories] = await Promise.all([
    getAllProducts(),
    getSaleProducts(4),
    getProductCategories()
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
 * إعدادات الcache للأداء الأمثل
 */
export const revalidate = false // Manual revalidation only
export const dynamic = 'force-static' // فورس static generation
export const fetchCache = 'force-cache' // استخدم الcache للdata fetching