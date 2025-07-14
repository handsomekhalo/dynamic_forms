
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← critical for static export to /out folder
  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
  images: {
    unoptimized: true, // ← required if you're using <Image> in static mode
  },
};

module.exports = nextConfig;
