import createNextIntlPlugin from 'next-intl/plugin';

// Create next-intl plugin with i18n config path
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
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

// Wrap config with next-intl plugin
export default withNextIntl(nextConfig)