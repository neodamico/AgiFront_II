/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' para Render - use apenas para GitHub Pages
  // output: 'export',
  basePath: process.env.GITHUB_PAGES ? '/AgiFront_II' : '',
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
