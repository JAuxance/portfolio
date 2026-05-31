import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle (.next/standalone) for a minimal Docker runtime image.
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '5mb' },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
};

export default withNextIntl(nextConfig);
