import { withContentlayer } from "next-contentlayer2"

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js")

/** @type {import("next").NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "pocketbase.vietopik.com",
      },
    ],
    unoptimized: true,
  },
  // Enable linting and typechecking during builds for better error detection
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        '@react-email/render': 'commonjs @react-email/render',
      });
    }
    return config;
  },
}

export default withContentlayer(nextConfig)
