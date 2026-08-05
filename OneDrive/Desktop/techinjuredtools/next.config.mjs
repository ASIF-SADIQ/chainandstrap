/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/animate',
        destination: 'https://techinjuredtool.onrender.com/animate',
      },
    ];
  },
  devIndicators: false,
};

export default nextConfig;
