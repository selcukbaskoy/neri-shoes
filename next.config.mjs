import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  // next-intl uses dynamic import(t) expressions that webpack cannot statically analyze.
  // This prevents webpack from tracking those dependencies for cache invalidation,
  // causing stale vendor-chunk references (vendor-chunks/@formatjs.js not found) in dev.
  // Disabling cache in dev eliminates this class of error entirely.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      // Prevent webpack from treating node_modules as managed paths eligible
      // for incremental vendor-chunk updates — new npm installs would otherwise
      // create a stale manifest/file mismatch (Cannot find module vendor-chunks/X).
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
