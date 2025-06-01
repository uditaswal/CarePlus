/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ✅ Add ESLint config inside the object
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
