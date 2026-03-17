/** @type {import('next').NextConfig} */
const isVercel = process.env.VERCEL === "1";
const nextConfig = isVercel
  ? {}
  : {
      output: "standalone",
    };

export default nextConfig;
