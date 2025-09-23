// app/page.jsx - Fixed for Vercel Deployment
import Nav from "./Nav"
import StoreSSG from "../app/StoreSSG"
import { getAllProducts, getSaleProducts, getProductCategories } from "@/lib/productService"

/**
 * ✅ FIXED: Home Page without Build Mode Issues
 */
export default async function Home() {
  console.log('🏠 Building home page...')
  
  let allProducts = []
  let saleProducts = []
  let categories = []
  
  try {
    // ✅ FIXED: Always fetch real data, let fallbacks handle errors
    console.log('📡 Fetching data from Supabase...')
    
    // Parallel data fetching with individual error handling
    const [productsResult, saleResult, categoriesResult] = await Promise.allSettled([
      getAllProducts(false),
      getSaleProducts(4),
      getProductCategories()
    ])
    
    // Handle each result individually
    if (productsResult.status === 'fulfilled') {
      allProducts = productsResult.value || []
      console.log(`✅ Products loaded: ${allProducts.length}`)
    } else {
      console.error('❌ Failed to load products:', productsResult.reason)
      allProducts = []
    }
    
    if (saleResult.status === 'fulfilled') {
      saleProducts = saleResult.value || []
      console.log(`✅ Sale products loaded: ${saleProducts.length}`)
    } else {
      console.error('❌ Failed to load sale products:', saleResult.reason)
      saleProducts = []
    }
    
    if (categoriesResult.status === 'fulfilled') {
      categories = categoriesResult.value || []
      console.log(`✅ Categories loaded: ${categories.length}`)
    } else {
      console.error('❌ Failed to load categories:', categoriesResult.reason)
      categories = []
    }

    console.log(`✅ Home page data loaded:`)
    console.log(`   - Products: ${allProducts.length}`)
    console.log(`   - Sale products: ${saleProducts.length}`)
    console.log(`   - Categories: ${categories.length}`)
    
  } catch (error) {
    console.error('❌ Error loading home page data:', error)
    
    // Use empty fallback to prevent build failure
    console.log('⚠️ Using empty fallback data for home page')
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
 * ✅ FIXED: Build Configuration for Vercel
 */
export const dynamic = 'force-dynamic' // Allow real data fetching
export const revalidate = 0 // Disable static caching, use in-memory cache instead
export const fetchCache = 'default-cache'
export const preferredRegion = 'auto'