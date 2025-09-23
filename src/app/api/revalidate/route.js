// // app/api/revalidate/route.js
// import { NextResponse } from 'next/server'
// import { revalidatePath, revalidateTag } from 'next/cache'
// import { clearProductsCache } from '@/lib/productService'

// /**
//  * API لتحديث الcache والصفحات الثابتة
//  * POST /api/revalidate
//  */
// export async function POST(request) {
//   try {
//     const body = await request.json()
//     const { paths, action, productId } = body

//     console.log('🔄 Revalidation request:', { action, productId, paths })

//     // مسح الcache من الذاكرة
//     clearProductsCache()

//     // مصفوفة الصفحات اللي هتتحدث
//     const defaultPaths = [
//       '/',           // الصفحة الرئيسية
//       '/store',      // صفحة المتجر
//     ]

//     let pathsToRevalidate = paths || defaultPaths

//     // حسب نوع العملية، ضيف صفحات إضافية
//     if (action && productId) {
//       switch (action) {
//         case 'add':
//           // منتج جديد - حدث الصفحة الرئيسية والمتجر
//           pathsToRevalidate = [...defaultPaths]
//           break
          
//         case 'update':
//           // تعديل منتج - حدث صفحة المنتج كمان
//           pathsToRevalidate = [
//             ...defaultPaths,
//             `/product/${productId}`
//           ]
//           break
          
//         case 'delete':
//           // حذف منتج - حدث كل الصفحات
//           pathsToRevalidate = [
//             ...defaultPaths,
//             `/product/${productId}` // رغم إنه اتحذف، بس عشان نتأكد
//           ]
//           break
//       }
//     }

//     // تنفيذ الrevalidation لكل صفحة
//     const results = []
//     for (const path of pathsToRevalidate) {
//       try {
//         revalidatePath(path)
//         results.push({ path, status: 'success' })
//         console.log(`✅ Revalidated: ${path}`)
//       } catch (error) {
//         results.push({ path, status: 'error', error: error.message })
//         console.error(`❌ Failed to revalidate ${path}:`, error)
//       }
//     }

//     // Revalidate tags إضافية لو موجودة
//     const tags = ['products', 'categories']
//     for (const tag of tags) {
//       try {
//         revalidateTag(tag)
//         console.log(`✅ Revalidated tag: ${tag}`)
//       } catch (error) {
//         console.error(`❌ Failed to revalidate tag ${tag}:`, error)
//       }
//     }

//     return NextResponse.json({
//       success: true,
//       message: 'Cache cleared and pages revalidated',
//       results,
//       timestamp: new Date().toISOString()
//     })

//   } catch (error) {
//     console.error('❌ Revalidation error:', error)
    
//     return NextResponse.json({
//       success: false,
//       error: error.message,
//       timestamp: new Date().toISOString()
//     }, { status: 500 })
//   }
// }

// /**
//  * معلومات عن الcache الحالي
//  * GET /api/revalidate
//  */
// export async function GET() {
//   try {
//     const { getCacheInfo } = await import('@/lib/productService')
//     const cacheInfo = getCacheInfo()

//     return NextResponse.json({
//       success: true,
//       cache: cacheInfo,
//       timestamp: new Date().toISOString()
//     })

//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       error: error.message
//     }, { status: 500 })
//   }
// }

// /**
//  * مسح الcache فقط بدون revalidation
//  * DELETE /api/revalidate
//  */
// export async function DELETE() {
//   try {
//     clearProductsCache()
    
//     return NextResponse.json({
//       success: true,
//       message: 'Cache cleared successfully',
//       timestamp: new Date().toISOString()
//     })

//   } catch (error) {
//     return NextResponse.json({
//       success: false,
//       error: error.message
//     }, { status: 500 })
//   }
// }
// app/api/revalidate/route.js
import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"
import { clearProductsCache, getCacheInfo } from "@/lib/productService"

// Simple admin check via header token (avoid extra deps)
function isAuthorized(request) {
  try {
    const authHeader = request.headers.get('x-admin-token') || ''
    const expected = process.env.ADMIN_TOKEN || ''
    if (!expected) return true // if not configured, allow
    return authHeader === expected
  } catch {
    return false
  }
}

/**
 * POST /api/revalidate
 */
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { paths, action, productId } = body

    console.log("🔄 Revalidation request:", { action, productId, paths })

    clearProductsCache()

    const defaultPaths = ["/", "/store"]
    let pathsToRevalidate = paths || defaultPaths

    if (action && productId) {
      switch (action) {
        case "add":
          pathsToRevalidate = [...defaultPaths]
          break
        case "update":
          pathsToRevalidate = [...defaultPaths, `/product/${productId}`]
          break
        case "delete":
          pathsToRevalidate = [...defaultPaths, `/product/${productId}`]
          break
      }
    }

    const results = []
    for (const path of pathsToRevalidate) {
      try {
        revalidatePath(path)
        results.push({ path, status: "success" })
      } catch (error) {
        results.push({ path, status: "error", error: error.message })
      }
    }

    const tags = ["products", "categories"]
    for (const tag of tags) {
      try {
        revalidateTag(tag)
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: "Cache cleared and pages revalidated",
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Provide cache info for dashboard
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  try {
    const cache = getCacheInfo()
    return NextResponse.json({ success: true, cache, timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Clear only in-memory cache
export async function DELETE(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
  }
  try {
    clearProductsCache()
    return NextResponse.json({ success: true, message: 'Cache cleared successfully', timestamp: new Date().toISOString() })
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
