/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      }
    ],
    domains: [
      'books.google.com',
      'lh3.googleusercontent.com',
      // Add other domains you're loading images from
    ],
  }
}

module.exports = nextConfig