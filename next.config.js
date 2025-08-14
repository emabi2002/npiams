/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  trailingSlash: false,
  basePath: "",
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
};

export default nextConfig;
