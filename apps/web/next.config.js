/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * @returns {Promise<import('next').Rewrite[]>}
   */
  async rewrites() {
    // Use localhost for dev, allow override for Docker or CI
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
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
