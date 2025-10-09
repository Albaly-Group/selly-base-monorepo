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
  // Enable static export for CSR deployment on AWS Amplify
  output: 'export',
}

export default nextConfig