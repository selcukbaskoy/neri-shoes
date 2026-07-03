import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const cspHeader = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.iyzipay.com https://sandbox-api.iyzipay.com https://api.iyzipay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https:",
  "connect-src 'self' https://*.supabase.co https://*.iyzipay.com",
  "frame-src 'self' https://*.iyzipay.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // iyzipay, constructor'da __dirname + '/resources' yolunu fs.readdirSync ile tarar.
  // Webpack bundle ettiğinde __dirname değişir ve Vercel ortamında ENOENT verir.
  // serverComponentsExternalPackages: iyzipay bundle edilmez, native require() olarak kalır.
  // Böylece __dirname doğru node_modules/iyzipay/lib/ yolunu gösterir.
  experimental: {
    serverComponentsExternalPackages: ['iyzipay'],
  },
  images: {
    unoptimized: true
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // next-intl uses dynamic import(t) expressions that webpack cannot statically analyze.
  // This prevents webpack from tracking those dependencies for cache invalidation,
  // causing stale vendor-chunk references (vendor-chunks/@formatjs.js not found) in dev.
  // Disabling cache in dev eliminates this class of error entirely.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
      config.snapshot = {
        ...config.snapshot,
        managedPaths: [],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
