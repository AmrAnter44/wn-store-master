/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode للتأكد من جودة الكود
  reactStrictMode: true,
  
  // 🔥 تحسينات البناء الأساسية
  experimental: {
    // تحسين memory usage
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    // تقليل حجم البيانات المسموح
    largePageDataBytes: 64 * 1024, // 64KB بدلاً من default
  },

  // Images optimization - محسن للأداء
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
    formats: ['image/webp'], // WebP فقط لتوفير المساحة
    deviceSizes: [640, 1080, 1200], // تقليل عدد الأحجام
    imageSizes: [64, 128, 256], // تقليل أحجام الصور الصغيرة
    minimumCacheTTL: 60, // Cache مؤقت للبناء
  },

  // تحسين الoutput للproduction
  output: 'standalone',
  
  // Enable static optimization
  trailingSlash: false,
  
  // Compress responses
  compress: true,
  
  // PoweredBy header removal للأمان
  poweredByHeader: false,

  // 🔥 تحسينات Webpack لتقليل الذاكرة
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // تحسين bundle size في الإنتاج
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 10000, // أصغر حجم للتقسيم
        maxSize: 150000, // أكبر حجم للملف الواحد
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          }
        }
      }
      
      // تقليل استهلاك الذاكرة
      config.optimization.minimize = true
    }
    
    return config
  },

  // Headers للأمان والأداء - مبسطة
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers أساسية
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options', 
            value: 'DENY',
          },
        ],
      },
      {
        // Cache headers للصور
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        // API routes caching مؤقت
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control', 
            value: 'public, s-maxage=60',
          },
        ],
      },
    ]
  },

  // Redirects مبسطة
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },

  // 🔥 إعدادات مهمة لتجنب build timeout
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checking
  },
  
  eslint: {
    ignoreDuringBuilds: false, // Keep ESLint checking
  },

  // تحسينات إضافية
  swcMinify: true, // استخدم SWC للتصغير
  
  // تقليل عدد الworkers في البناء
  onDemandEntries: {
    maxInactiveAge: 15 * 1000, // 15 seconds
    pagesBufferLength: 2, // عدد الصفحات في الذاكرة
  },
}

export default nextConfig