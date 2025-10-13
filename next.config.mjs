/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/AgiFront_II',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
