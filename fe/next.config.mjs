/** @type {import('next').NextConfig} */
const nextConfig = {
  // React Compiler
  reactCompiler: true,

  // Strict mode
  reactStrictMode: true,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**",
        port: "",
        pathname: "/**",
      },
    ],
    // Format modern untuk performa lebih baik
    formats: ["image/avif", "image/webp"],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Logging fetch requests di development
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Typed routes
  typedRoutes: true,

  // Experimental features
  experimental: {
    // Optimasi CSS
    optimizeCss: true,
  },
};

export default nextConfig;
