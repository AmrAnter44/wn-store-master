// app/page.jsx - Build Optimized
import Nav from "./Nav"
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * Home Page with Build Optimization
 * Uses static fallback data during build to prevent timeouts
 */
export default async function Home() {
  console.log('🏠 Building home page...')
  
  let allProducts = []
  let saleProducts = []
  let categories = []
  
  try {
    // Enable build mode to use fallback data and prevent timeouts
    const buildMode = process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production'
    
    console.log(`Build mode: ${buildMode}`)
    
    // Parallel data fetching with timeout protection
    const dataPromises = [
      getAllProducts(false, buildMode),
      getSaleProducts(4, buildMode),
      getProductCategories(buildMode)
    ]
    
    // Set overall timeout for data fetching
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Data fetch timeout')), 15000) // 15s max
    )
    
    const [productsData, saleData, categoriesData] = await Promise.race([
      Promise.all(dataPromises),
      timeoutPromise
    ])
    
    allProducts = productsData || []
    saleProducts = saleData || []
    categories = categoriesData || []
    
    console.log(`✅ Home page data loaded:`)
    console.log(`   - Products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)
    
  } catch (error) {
    console.error('❌ Error loading home page data:', error)
    
    // Use empty fallback to prevent build failure
    console.log('⚠️ Using empty fallback data')
    allProducts = []
    saleProducts = []
    categories = []
  }

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
 * Enhanced Metadata for SEO
 */
export const metadata = {
  title: "Wn Store - Latest Fashion Collection",
  description: "Shop the latest collection of elegant dresses, casual styles & chic outfits. High-quality fabrics, affordable prices & fast delivery in Egypt.",
  keywords: "fashion, dresses, casual wear, bags, online shopping, Egypt, women clothing",
  authors: [{ name: "Wn Store" }],
  creator: "Wn Store",
  publisher: "Wn Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wn-store.vercel.app",
    siteName: "Wn Store",
    title: "Wn Store - Latest Fashion Collection",
    description: "Shop the latest collection of elegant dresses, casual styles & chic outfits.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Wn Store Fashion Collection",
        type: "image/jpeg"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Wn Store - Latest Fashion Collection",
    description: "Shop the latest collection of elegant dresses, casual styles & chic outfits.",
    images: ["/og-image.jpg"],
    creator: "@wnstore"
  },
  alternates: {
    canonical: "https://wn-store.vercel.app"
  }
}

/**
 * Build Configuration - Optimized for Vercel
 */
export const dynamic = 'force-static' // Changed to static
export const revalidate = 3600 // Revalidate every hour
export const fetchCache = 'force-cache'
export const preferredRegion = 'auto'