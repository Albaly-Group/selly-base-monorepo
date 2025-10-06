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
  // Enable standalone output for Docker builds
  output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
}

export default nextConfig