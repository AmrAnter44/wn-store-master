/** @type {import('next').NextConfig} */
const nextConfig = {
  // تفعيل React Strict Mode
  reactStrictMode: true,
  
  // إعدادات الصور الأساسية
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
    // تحسين بسيط للصور
    formats: ['image/webp'],
    deviceSizes: [640, 1080, 1200],
    imageSizes: [64, 128, 256],
  },

  // إعدادات الإخراج
  output: 'standalone',
  
  // تفعيل الضغط
  compress: true,
  
  // إخفاء powered by header
  poweredByHeader: false,

  // إعدادات بسيطة لتجنب مشاكل البناء
  trailingSlash: false,

  // تحسين webpack بسيط
  webpack: (config, { dev }) => {
    // في الإنتاج، قسم الملفات لتحسين الأداء
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 200000,
      }
    }
    
    return config
  },

  // Headers بسيطة للأمان
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
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
    ]
  },

  // Redirects أساسية
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },

  // إيقاف التليمتري لتوفير الوقت
  env: {
    NEXT_TELEMETRY_DISABLED: '1'
  },
}

export default nextConfig