/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://resumebuilder-api:4000/api';
    return [
      {
        source: '/api/:path*',
        destination: apiUrl + '/:path*',
      },
    ];
  },
  compiler: {
    reactRemoveProperties: false,
  },
};

export default nextConfig;
