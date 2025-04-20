// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // You can remove or comment out rewrites to let Next.js handle routing automatically
    // async rewrites() {
    //   return [
    //     {
    //       source: '/users',
    //       destination: '/Components/System_Management_Component/Usermanagement', 
    //     },
    //   ];
    // },
  };
  
  module.exports = nextConfig;
  