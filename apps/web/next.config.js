/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Workaround for Next.js file watcher bug in monorepo
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable problematic file watcher completely
      config.watchOptions = {
        ignored: ['**/*'],
      };
      // Use manual refresh instead of hot reload
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
