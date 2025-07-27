/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for cPanel compatibility
  output: 'export',
  
  // Point to src directory
  experimental: {
    appDir: true
  },
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // Set base path if deploying to a subdirectory
  // basePath: '/your-subdirectory', // Uncomment and modify if needed
  
  // Ensure trailing slashes for better cPanel compatibility
  trailingSlash: true,
  
  // Disable server-side features for static export
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configure asset prefix for CDN or subdirectory deployment
  // assetPrefix: '/your-subdirectory', // Uncomment and modify if needed
  
  // Disable experimental features that cause issues with static export
  experimental: {
    optimizeCss: false, // Disable to avoid critters module issues
  },
  
  // Disable features not compatible with static export
  poweredByHeader: false,
  
  // Configure compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig
