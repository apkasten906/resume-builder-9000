import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

// Load repo root .env file FIRST (before Next.js loads its own .env files)
// This gives us a single source of truth for all environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnvPath = resolve(__dirname, '../../.env');
dotenv.config({ path: rootEnvPath });

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
