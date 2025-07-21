"use client"; // Ensure this is a client component

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← critical for static export to /out folder
  distDir: 'out', // Default export directory
  trailingSlash: true, // important for S3 paths


  reactStrictMode: true,
  compiler: {
    removeConsole: false,
  },
  images: {
    unoptimized: true, // ← required if you're using <Image> in static mode
  },
};

module.exports = nextConfig;
