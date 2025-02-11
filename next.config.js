/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
    ],
  },
  trailingSlash: false,
  skipTrailingSlashRedirect: true
}

module.exports = nextConfig