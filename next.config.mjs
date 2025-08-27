/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Enhanced path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
      '@/app': './app',
      '@/components': './components',
      '@/hooks': './hooks',
      '@/lib': './lib',
    }

    // Handle canvas and worker files
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
    }

    return config
  },
  async rewrites() {
    return [
      // Domain-specific rewrites for tool-focused domains
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixorapdf.com',
          },
        ],
        destination: '/pdf-tools/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixoraimg.com',
          },
        ],
        destination: '/image-tools/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixoraqrcode.com',
          },
        ],
        destination: '/qr-tools/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixoracode.com',
          },
        ],
        destination: '/text-tools/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixoraseo.com',
          },
        ],
        destination: '/seo-tools/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixoranet.com',
          },
        ],
        destination: '/utilities/:path*',
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'pixorautilities.com',
          },
        ],
        destination: '/utilities/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

export default nextConfig