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
  experimental: {
    // Enable CSS optimization for proper Vercel deployment
    optimizeCss: true,
  },
  // Conditional output mode based on deployment platform:
  // - AWS Amplify: Use 'standalone' mode for SSR support (requires AWS_AMPLIFY=true)
  // - Vercel: Use default Next.js output with routes-manifest.json (no output set)
  output: process.env.AWS_AMPLIFY === 'true' ? 'standalone' : undefined,
}

export default nextConfig