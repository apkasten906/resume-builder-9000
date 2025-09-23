/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /**
   * @returns {Promise<import('next').Rewrite[]>}
   */
  async rewrites() {
    // Explicit route proxies for backend API endpoints
    const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';
    return [
      {
        source: '/api/jd/parse',
        destination: `${apiBase}/jd/parse`,
      },
      {
        source: '/api/tailor',
        destination: `${apiBase}/tailor`,
      },
      {
        source: '/api/applications',
        destination: `${apiBase}/applications`,
      },
      {
        source: '/api/applications/:id/stage',
        destination: `${apiBase}/applications/:id/stage`,
      },
      {
        source: '/api/applications/:id/attachments',
        destination: `${apiBase}/applications/:id/attachments`,
      },
      {
        source: '/api/resume/download',
        destination: `${apiBase}/resume/download`,
      },
    ];
  },
  compiler: {
    reactRemoveProperties: false,
  },
};

export default nextConfig;
