/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@bizai/shared'],
 
  // ============================================
  // TURBOPACK OPTIMIZATIONS
  // ============================================
  experimental: {
    // Turbopack configuration with optimized loaders
    turbo: {
      rules: {
        // SVG optimization with SVGR
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
      // Resolve extensions for faster module resolution
      resolveExtensions: [
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
        '.json',
      ],
      // Module ID strategy for better caching
      moduleIdStrategy: 'deterministic',
    },
 
    // Turbopack-specific optimizations
    turbopack: {
      resolveAlias: {
        '@bizai/shared': '../../packages/shared/src',
        '@': './app',
        '@/components': './components',
        '@/lib': './lib',
        '@/hooks': './hooks',
        '@/types': './types',
      },
      // Memory limits for better performance
      memoryLimit: 8192,
    },
 
    // Server-side optimizations
    serverExternalPackages: [
      '@supabase/supabase-js',
      'exceljs',
      'jsonwebtoken',
      'inngest',
    ],
 
    // Enable optimized package imports
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@supabase/supabase-js',
    ],
 
    // Server actions for better data fetching
    serverActions: {
      bodySizeLimit: '2mb',
    },
 
    // Optimize CSS
    optimizeCss: true,
 
    // Enable PPR (Partial Prerendering) for better performance
    ppr: 'incremental',
 
    // Optimize fonts
    optimizeFonts: true,
 
    // Enable React compiler (if available)
    reactCompiler: true,
  },
 
  // ============================================
  // WEBPACK OPTIMIZATIONS (Fallback)
  // ============================================
  webpack(config, { dev, isServer }) {
    // SVG handling
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );
 
    if (fileLoaderRule) {
      config.module.rules.push(
        {
          ...fileLoaderRule,
          test: /\.svg$/i,
          resourceQuery: /url/,
        },
        {
          test: /\.svg$/i,
          issuer: fileLoaderRule.issuer,
          resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] },
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                svgoConfig: {
                  plugins: [
                    {
                      name: 'preset-default',
                      params: {
                        overrides: {
                          removeViewBox: false,
                          cleanupIds: false,
                        },
                      },
                    },
                    'removeDimensions',
                  ],
                },
                typescript: true,
                memo: true,
                ref: true,
              },
            },
          ],
        }
      );
      fileLoaderRule.exclude = /\.svg$/i;
    }
 
    // Production optimizations
    if (!dev) {
      // Split chunks for better caching
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunks
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name(module) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                )?.[1];
                return `vendor.${packageName?.replace('@', '')}`;
              },
              priority: 10,
            },
            // React/Next.js core
            framework: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'framework',
              priority: 40,
              enforce: true,
            },
            // UI libraries
            ui: {
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react)[\\/]/,
              name: 'ui',
              priority: 30,
            },
            // Shared package
            shared: {
              test: /[\\/]packages[\\/]shared[\\/]/,
              name: 'shared',
              priority: 20,
            },
            // Common chunks
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
 
    // Ignore source maps in production for faster builds
    if (!dev && !isServer) {
      config.devtool = false;
    }
 
    return config;
  },
 
  // ============================================
  // IMAGE OPTIMIZATION
  // ============================================
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Disable image optimization in development for faster builds
    unoptimized: process.env.NODE_ENV === 'development',
  },
 
  // ============================================
  // COMPILER OPTIONS
  // ============================================
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
 
    // Emotion support (if needed)
    emotion: false,
 
    // Styled-components support (if needed)
    styledComponents: false,
 
    // React remove properties
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },
 
  // ============================================
  // OUTPUT & CACHING
  // ============================================
  output: 'standalone',
 
  // Generate ETags for better caching
  generateEtags: true,
 
  // Compress responses
  compress: true,
 
  // Power by header
  poweredByHeader: false,
 
  // ============================================
  // HEADERS & SECURITY
  // ============================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/:path*.{jpg,jpeg,png,gif,webp,avif,ico,svg}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
 
  // ============================================
  // REDIRECTS & REWRITES
  // ============================================
  async redirects() {
    return [
      // Add your redirects here
    ];
  },
 
  async rewrites() {
    return [
      // Add your rewrites here
    ];
  },
 
  // ============================================
  // ENVIRONMENT VARIABLES
  // ============================================
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || 'development',
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_GITPOD_WORKSPACE_URL: process.env.GITPOD_WORKSPACE_URL,
  },
 
  // ============================================
  // LOGGING
  // ============================================
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};
 
export default nextConfig;