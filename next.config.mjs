/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode للتأكد من جودة الكود
  reactStrictMode: true,
  
  // Images optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dfurfmrwpyotjfrryatn.supabase.co",
      },
      {
        protocol: "https", 
        hostname: "images.unsplash.com",
      },
    ],
    // تحسين الصور للأداء الأفضل
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features لتحسين الأداء
  experimental: {
    // تحسين memory usage
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // تحسين الoutput للproduction
  output: 'standalone',
  
  // Enable static optimization
  trailingSlash: false,
  
  // Compress responses
  compress: true,
  
  // PoweredBy header removal للأمان
  poweredByHeader: false,

  // Headers للأمان والأداء
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Cache headers للstatic assets
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache headers خاصة للصور
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // API routes caching
        source: '/api/products/(.*)',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, s-maxage=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },

  // Redirects لتحسين SEO
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig