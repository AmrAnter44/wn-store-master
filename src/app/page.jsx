// app/page.jsx
import Nav from "./Nav"
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * الصفحة الرئيسية - Static Generation
 * هتتبني مرة واحدة وتتcache في CDN
 */
export default async function Home() {
  // جلب البيانات في build time
  const [allProducts, saleProducts, categories] = await Promise.all([
    getAllProducts(),
    getSaleProducts(4),
    getProductCategories()
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
}

/**
 * إعدادات Next.js للـ Static Generation
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
 * إعدادات الcache - مهمة جداً للأداء
 */
export const revalidate = false // Manual revalidation only
export const dynamic = 'force-static' // فورس static generation
export const fetchCache = 'force-cache' // استخدم الcache للdata fetching