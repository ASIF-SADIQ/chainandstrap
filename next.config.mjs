/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow any hostname since we don't know yet
      },
    ],
  },
  eslint: {
    // This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/products/:handle',
        destination: '/product/:handle',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: 'http://137.184.102.82:5000/sitemap.xml',
      },
      {
        source: '/backend-api/:path*',
        destination: 'http://137.184.102.82:5000/api/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://137.184.102.82:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;