
"use client"
import ProductDetailClient from './ProductDetailClient'
import { getAllProducts, getProductById, getRelatedProducts } from '@/lib/productService'
import { notFound } from 'next/navigation'

/**
 * ✅ FIXED: Product Detail Page now uses REAL Supabase data
 */
export default async function ProductDetailPage({ params }) {
  const { id } = params
  
  try {
    console.log(`📦 Loading product ${id} with REAL Supabase data...`)
    
    // ✅ FIXED: Remove buildMode - fetch REAL product data
    const product = await getProductById(id)
    
    if (!product) {
      console.log(`❌ Product ${id} not found in Supabase`)
      notFound()
    }

    console.log(`✅ Loaded REAL product: ${product.name}`)
    console.log(`   - Price: ${product.price} LE`)
    console.log(`   - Type: ${product.type}`)
    console.log(`   - Colors: ${product.colors?.join(', ') || 'None'}`)
    console.log(`   - Sizes: ${product.sizes?.join(', ') || 'None'}`)

    // ✅ FIXED: Fetch REAL related products
    const relatedProducts = await getRelatedProducts(product, 8)

    console.log(`✅ Found ${relatedProducts.length} related products`)

    return (
      <div className="min-h-screen pt-16">
        <ProductDetailClient 
          productId={id} 
          initialProduct={product}
          initialRelatedProducts={relatedProducts}
        />
      </div>
    )
    
  } catch (error) {
    console.error(`❌ Error loading product ${id}:`, error)
    notFound()
  }
}

/**
 * ✅ FIXED: Generate Static Params with REAL Supabase data
 */
export async function generateStaticParams() {
  try {
    console.log('📋 Generating static params with REAL Supabase products...')
    
    // ✅ FIXED: Get REAL products from Supabase (no build mode)
    const products = await getAllProducts(false)
    
    if (!products || products.length === 0) {
      console.log('⚠️ No products found in Supabase for static generation')
      return []
    }
    
    console.log(`📋 Found ${products.length} REAL products in Supabase`)
    
    // Generate static params for all products (or limit if needed)
    const limitedProducts = products.slice(0, 50) // First 50 products to avoid timeout
    
    console.log(`📋 Generating static params for ${limitedProducts.length} products`)
    
    const params = limitedProducts.map((product) => {
      console.log(`   - Product: ${product.name} (ID: ${product.id})`)
      return {
        id: product.id.toString()
      }
    })

    console.log(`✅ Generated ${params.length} static product pages with REAL data`)
    return params
    
  } catch (error) {
    console.error('❌ Error generating static params:', error)
    return [] // Return empty instead of crashing build
  }
}

/**
 * ✅ FIXED: Generate Metadata with CORRECTED OpenGraph type
 */
export async function generateMetadata({ params }) {
  const { id } = params
  
  try {
    // ✅ FIXED: Get REAL product data for metadata
    const product = await getProductById(id)
    
    if (!product) {
      return {
        title: 'Product Not Found - Wn Store',
        description: 'The requested product could not be found.'
      }
    }

    console.log(`✅ Generated metadata for REAL product: ${product.name}`)

    const price = product.newprice || product.price
    const discountText = product.newprice ? ` - ${Math.round((1 - product.newprice / product.price) * 100)}% OFF` : ''
    
    return {
      title: `${product.name} - ${price} LE${discountText} | Wn Store`,
      description: product.description || `Shop ${product.name} at Wn Store. High-quality ${product.type} with fast delivery. Price: ${price} LE.`,
      keywords: `${product.name}, ${product.type}, fashion, online shopping, Egypt, ${product.colors?.join(', ') || ''}, ${product.sizes?.join(', ') || ''}`,
      
      // ✅ FIXED: Use 'website' instead of 'product' for OpenGraph type
      openGraph: {
        title: product.name,
        description: product.description || `Shop ${product.name} at Wn Store`,
        type: 'website', // ✅ FIXED: Changed from 'product' to 'website'
        url: `https://wn-store.vercel.app/product/${id}`,
        siteName: 'Wn Store',
        images: product.pictures?.map(pic => ({
          url: pic,
          width: 800,
          height: 1000,
          alt: product.name
        })) || []
      },
      
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Shop ${product.name} at Wn Store`,
        images: product.pictures?.[0] ? [product.pictures[0]] : []
      },
      
      // ✅ ADDED: Product-specific meta tags for e-commerce SEO
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'EGP',
        'product:availability': 'in stock',
        'product:condition': 'new',
        'product:brand': 'Wn Store',
        'product:category': product.type || 'fashion',
        // Schema.org structured data
        'application/ld+json': JSON.stringify({
          '@context': 'https://schema.org/',
          '@type': 'Product',
          'name': product.name,
          'image': product.pictures || [],
          'description': product.description || `High-quality ${product.type} from Wn Store`,
          'brand': {
            '@type': 'Brand',
            'name': 'Wn Store'
          },
          'offers': {
            '@type': 'Offer',
            'price': price,
            'priceCurrency': 'EGP',
            'availability': 'https://schema.org/InStock',
            'condition': 'https://schema.org/NewCondition'
          },
          'category': product.type,
          'color': product.colors?.[0] || undefined,
          'size': product.sizes || undefined
        })
      }
    }
    
  } catch (error) {
    console.error(`❌ Error generating metadata for product ${id}:`, error)
    return {
      title: 'Product - Wn Store',
      description: 'Fashion product at Wn Store',
      openGraph: {
        title: 'Product - Wn Store',
        description: 'Fashion product at Wn Store',
        type: 'website', // ✅ FIXED: Use 'website' type
        siteName: 'Wn Store'
      }
    }
  }
}

/**
 * ✅ FIXED: Cache settings for real data
 */
export const dynamic = 'force-dynamic' // Allow real-time data fetching
export const revalidate = 3600 // Revalidate every hour with fresh data
export const dynamicParams = true // Allow dynamic product IDs