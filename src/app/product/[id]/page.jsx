// app/product/[id]/page.jsx
import ProductDetailClient from './ProductDetailClient'
import { getAllProducts, getProductById, getRelatedProducts } from '@/lib/productService'
import { notFound } from 'next/navigation'

/**
 * صفحة المنتج الواحد - Static Generation مع Dynamic Routes
 */
export default async function ProductDetailPage({ params }) {
  const { id } = params
  
  try {
    // جلب بيانات المنتج مع build mode
    const product = await getProductById(id, true)
    
    if (!product) {
      notFound()
    }

    // جلب المنتجات المشابهة مع build mode
    const relatedProducts = await getRelatedProducts(product, 8, true)

    console.log(`📦 Product page built for: ${product.name} (ID: ${id})`)
    console.log(`   - Related products: ${relatedProducts.length}`)

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
 * Generate Static Params - بناء كل صفحات المنتجات في build time
 * 🔥 محدود بـ 10 منتجات فقط لتجنب timeout
 */
export async function generateStaticParams() {
  try {
    const products = await getAllProducts(false, true) // Enable build mode
    
    console.log(`📋 Found ${products.length} total products`)
    
    // 🔥 CRITICAL: قلل العدد لتجنب build timeout
    const limitedProducts = products.slice(0, 10) // أول 10 منتجات فقط
    
    console.log(`📋 Generating static params for ${limitedProducts.length} products`)
    
    // إنشاء array من IDs للمنتجات
    const params = limitedProducts.map((product) => ({
      id: product.id.toString()
    }))

    console.log(`✅ Generated ${params.length} static product pages`)
    return params
    
  } catch (error) {
    console.error('❌ Error generating static params:', error)
    return [] // Return empty instead of crashing build
  }
}

/**
 * Generate Metadata - SEO لكل منتج
 */
export async function generateMetadata({ params }) {
  const { id } = params
  
  try {
    const product = await getProductById(id, true)
    
    if (!product) {
      return {
        title: 'Product Not Found - Wn Store',
        description: 'The requested product could not be found.'
      }
    }

    const price = product.newprice || product.price
    const discountText = product.newprice ? ` - ${Math.round((1 - product.newprice / product.price) * 100)}% OFF` : ''
    
    return {
      title: `${product.name} - ${price} LE${discountText} | Wn Store`,
      description: product.description || `Shop ${product.name} at Wn Store. High-quality ${product.type} with fast delivery. Price: ${price} LE.`,
      keywords: `${product.name}, ${product.type}, fashion, online shopping, Egypt, ${product.colors?.join(', ')}, ${product.sizes?.join(', ')}`,
      openGraph: {
        title: product.name,
        description: product.description || `Shop ${product.name} at Wn Store`,
        type: 'product',
        url: `https://your-domain.com/product/${id}`,
        images: product.pictures?.map(pic => ({
          url: pic,
          width: 800,
          height: 1000,
          alt: product.name
        })) || [],
        siteName: 'Wn Store'
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description || `Shop ${product.name} at Wn Store`,
        images: product.pictures?.[0] ? [product.pictures[0]] : []
      },
      // Structured Data for Google Shopping
      other: {
        'product:price:amount': price.toString(),
        'product:price:currency': 'EGP',
        'product:availability': 'in stock',
        'product:condition': 'new',
        'product:brand': 'Wn Store'
      }
    }
    
  } catch (error) {
    console.error(`❌ Error generating metadata for product ${id}:`, error)
    return {
      title: 'Product - Wn Store',
      description: 'Fashion product at Wn Store'
    }
  }
}

/**
 * إعدادات الcache والأداء - محسنة لتجنب build timeout
 */
export const revalidate = 3600 // بدلاً من false، استخدم 1 ساعة
export const dynamic = 'auto' // بدلاً من force-static
export const dynamicParams = true