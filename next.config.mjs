import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    // Disable worker threads completely
    workerThreads: false,
    // Disable Webpack 5 worker pool
    webpackBuildWorker: false,
    // Add pino and aniwatch to external packages
    serverComponentsExternalPackages: ['pino', 'pino-pretty', 'aniwatch'],
  },
  // Webpack configuration to handle worker issues and pino
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable worker threads in server-side builds
      config.optimization.minimize = false;
      config.cache = false;
      
      // Resolve worker thread issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        worker_threads: false,
      };
      
      // Externalize pino-related packages to avoid bundling issues
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push(
          'worker_threads',
          'pino-pretty',
          'pino/file',
          'sonic-boom'
        );
      }
    }
    
    return config;
  },
  // Environment variables to disable workers
  env: {
    DISABLE_WORKER_THREADS: 'true',
    PINO_DISABLE_PRETTY: 'true',
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);