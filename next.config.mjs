/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true,
  },
  env: {
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'AIzaSyBMcd_Mzc1Wp4Nva0YRFbpckUqTgkMSB1Y',
  },
}

export default nextConfig
