/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ disables ESLint checks in next build
  },
  typescript: {
    ignoreBuildErrors: true, // optional: disables TS errors in build
  },
};

export default nextConfig;
