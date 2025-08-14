/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "export",
  distDir: "out",
  trailingSlash: true,
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
  },
  async generateStaticParams() {
    return [];
  }
};

export default nextConfig;
